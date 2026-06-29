/**
 * CLI tool that scans a live page and writes a PageMap JSON to generated/page-maps/.
 * Run via: npm run scan -- <URL>  (or declared path like `/login`)
 *
 * Pipeline: PageMapper (scan) → PageMap JSON → PageMapLocatorRegistry (resolve at test time)
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { DetectedFeature, LocatorCandidate, PageMap, TargetEntry } from './PageMap';

function toCamelCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word, i) => (i === 0 ? word : word[0].toUpperCase() + word.slice(1)))
    .join('');
}

function pagePrefix(urlPath: string): string {
  return urlPath.replace(/^\//, '').replace(/\//g, '-').replace(/-+$/, '').trim() || 'home';
}

// Strips www. and TLD so "www.github.com" → "github". 
function hostnameSlug(hostname: string): string {
  const parts = hostname.replace(/^www\./, '').split('.');
  return parts.length > 1 ? parts.slice(0, -1).join('-') : parts[0];
}

// Includes hostname in prefix for full-URL args to avoid collision across domains. 
function buildPrefix(urlArg: string, fullUrl: string, urlPath: string): string {
  const pathPart = pagePrefix(urlPath);
  if (!urlArg.startsWith('http')) return pathPart;
  const slug = hostnameSlug(new URL(fullUrl).hostname);
  return pathPart === 'home' ? slug : `${slug}-${pathPart}`;
}

function uniqueKey(base: string, existing: Record<string, TargetEntry>): string {
  if (!existing[base]) return base;
  let i = 2;
  while (existing[`${base}${i}`]) i++;
  return `${base}${i}`;
}

// CSS.escape is browser-only -> this handles ids safely in Node
function safeIdSelector(id: string): string {
  return `[id="${id.replace(/"/g, '\\"')}"]`;
}

function detectFeatures(targets: Record<string, TargetEntry>): DetectedFeature[] {
  const entries = Object.values(targets);
  const features: DetectedFeature[] = [];

  const hasPassword = entries.some(e => e.type === 'password');
  const hasTextInput = entries.some(e => e.type === 'input');
  const hasButton = entries.some(e => e.type === 'button');
  const hasCheckbox = entries.some(e => e.type === 'checkbox');
  const hasRadio = entries.some(e => e.type === 'radio');
  const hasSelect = entries.some(e => e.type === 'select');
  const hasTextarea = entries.some(e => e.type === 'textarea');

  if (hasPassword && hasTextInput && hasButton) {
    features.push({
      feature: 'login',
      confidence: 0.92,
      evidence: ['Password input detected', 'Text input detected', 'Submit button detected'],
    });
  }
  if (hasCheckbox) features.push({ feature: 'checkboxes', confidence: 0.85, evidence: ['Checkbox inputs detected'] });
  if (hasRadio) features.push({ feature: 'radio-group', confidence: 0.85, evidence: ['Radio inputs detected'] });
  if (hasSelect) features.push({ feature: 'dropdown', confidence: 0.85, evidence: ['Select/dropdown detected'] });
  if (hasTextarea) features.push({ feature: 'text-entry', confidence: 0.75, evidence: ['Textarea detected'] });
  if (!hasPassword && hasTextInput && hasButton) {
    features.push({ feature: 'form', confidence: 0.70, evidence: ['Input fields and submit button detected'] });
  }

  return features;
}

/**
 * Scans a page and writes a PageMap JSON to generated/page-maps/.
 * @param urlArg - a full URL ("https://example.com") OR A path ("/login") 
 * 
 * Note: 
 * For domain-specific approach consider declaring better env to allow for proper pathing for that domain.
 * Example: 
 * - /shop-home
 * - /Shop-login
 * -- /shop-login-confirm
 * 
 * etc. (Just an idea)
 */
async function map(urlArg: string): Promise<void> {
  const baseURL = process.env.BASE_URL ?? 'https://the-internet.herokuapp.com';
  const fullUrl = urlArg.startsWith('http') ? urlArg : `${baseURL}${urlArg}`;
  const urlPath = new URL(fullUrl).pathname;
  const prefix = buildPrefix(urlArg, fullUrl, urlPath);

  console.log(`Mapping: ${fullUrl}`);

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(fullUrl, { waitUntil: 'load' });
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

    const title = await page.title();
    const targets: Record<string, TargetEntry> = {};
    const capturedInputIds = new Set<string>();
    const capturedInputNames = new Set<string>();

    // ARIA snapshot
    const ariaSnapshot = await page.ariaSnapshot().catch(() => '');

    // Pass 1 — labeled inputs
    for (const labelEl of await page.locator('label').all()) {
      const labelText = (await labelEl.innerText().catch(() => null))?.trim();
      if (!labelText) continue;

      const forAttr = await labelEl.getAttribute('for');
      const inputEl = forAttr
        ? page.locator(safeIdSelector(forAttr))
        : labelEl.locator('input, textarea, select').first();

      const inputType = await inputEl.getAttribute('type').catch(() => null);
      const tagName = await inputEl.evaluate(el => el.tagName.toLowerCase()).catch(() => null);
      if (!tagName || tagName === 'button') continue;

      const id = await inputEl.getAttribute('id').catch(() => null);
      const placeholder = await inputEl.getAttribute('placeholder').catch(() => null);
      const inputName = await inputEl.getAttribute('name').catch(() => null);

      if (id) capturedInputIds.add(id);
      if (inputName) capturedInputNames.add(inputName);

      const labelKey = toCamelCase(labelText);
      if (!labelKey) continue;

      let elType: TargetEntry['type'] = 'input';
      if (inputType === 'password') elType = 'password';
      else if (inputType === 'checkbox') elType = 'checkbox';
      else if (inputType === 'radio') elType = 'radio';
      else if (tagName === 'textarea') elType = 'textarea';
      else if (tagName === 'select') elType = 'select';

      const candidates: LocatorCandidate[] = [{ strategy: 'label', value: labelText, score: 0.95 }];
      if (placeholder) candidates.push({ strategy: 'placeholder', value: placeholder, score: 0.80 });
      if (id) candidates.push({ strategy: 'css', value: safeIdSelector(id), score: 0.75 });

      const key = uniqueKey(`${prefix}.${labelKey}`, targets);
      targets[key] = { type: elType, humanName: labelText, label: labelText, placeholder: placeholder ?? undefined, locatorCandidates: candidates };
    }

    // Pass 2 — unlabeled inputs/selects (placeholder / aria-label / name / id fallback)
    const unlabeledSelector = [
      'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"])',
      'textarea',
      'select',
    ].join(', ');
    let unlabeledIndex = 0;
    for (const inputEl of await page.locator(unlabeledSelector).all()) {
      const id = await inputEl.getAttribute('id').catch(() => null);
      if (id && capturedInputIds.has(id)) continue;

      const inputType = await inputEl.getAttribute('type').catch(() => null);
      const placeholder = await inputEl.getAttribute('placeholder').catch(() => null);
      const ariaLabel = await inputEl.getAttribute('aria-label').catch(() => null);
      const nameAttr = await inputEl.getAttribute('name').catch(() => null);
      const tagName = await inputEl.evaluate(el => el.tagName.toLowerCase()).catch(() => null);

      if (nameAttr && capturedInputNames.has(nameAttr)) continue;

      const signal = placeholder || ariaLabel || nameAttr || id;
      const signalKey = signal ? toCamelCase(signal) : '';

      if (!signal || !signalKey) {
        // positional fallback for elements with zero identifying attributes or non-Latin signal
        const type = inputType ?? tagName ?? 'input';
        const cssType = inputType ? `input[type="${inputType}"]` : tagName ?? 'input';
        const key = uniqueKey(`${prefix}.${type}${unlabeledIndex + 1}`, targets);
        targets[key] = {
          type: (inputType === 'checkbox' ? 'checkbox' : inputType === 'radio' ? 'radio' : 'input') as TargetEntry['type'],
          locatorCandidates: [{ strategy: 'cssNth', value: cssType, index: unlabeledIndex, score: 0.50 }],
        };
        unlabeledIndex++;
        continue;
      }

      let elType: TargetEntry['type'] = 'input';
      if (inputType === 'password') elType = 'password';
      else if (inputType === 'checkbox') elType = 'checkbox';
      else if (inputType === 'radio') elType = 'radio';
      else if (tagName === 'textarea') elType = 'textarea';
      else if (tagName === 'select') elType = 'select';

      const candidates: LocatorCandidate[] = [];
      if (placeholder) candidates.push({ strategy: 'placeholder', value: placeholder, score: 0.85 });
      if (ariaLabel) candidates.push({ strategy: 'label', value: ariaLabel, score: 0.80 });
      if (id) candidates.push({ strategy: 'css', value: safeIdSelector(id), score: 0.75 });
      if (nameAttr) candidates.push({ strategy: 'css', value: `[name="${nameAttr}"]`, score: 0.65 });

      const humanName = placeholder || ariaLabel || nameAttr || id || undefined;
      const key = uniqueKey(`${prefix}.${signalKey}`, targets);
      targets[key] = { type: elType, humanName: humanName ?? undefined, placeholder: placeholder ?? undefined, locatorCandidates: candidates };
      if (id) capturedInputIds.add(id);
    }

    // Buttons
    for (const btn of await page.locator('button, input[type="submit"], input[type="button"]').all()) {
      const text = ((await btn.innerText().catch(() => null)) ?? (await btn.getAttribute('value').catch(() => null)))?.trim();
      if (!text) continue;
      const btnKey = toCamelCase(text);
      if (!btnKey) continue;

      const btnType = await btn.getAttribute('type').catch(() => null);
      const tagName = await btn.evaluate(el => el.tagName.toLowerCase()).catch(() => null);

      const candidates: LocatorCandidate[] = [
        { strategy: 'role', role: 'button', name: text, score: 0.95 },
        { strategy: 'text', value: text, score: 0.80 },
      ];
      if (btnType === 'submit') {
        const cssValue = tagName === 'input' ? "input[type='submit']" : "button[type='submit']";
        candidates.push({ strategy: 'css', value: cssValue, score: 0.70 });
      }

      const key = uniqueKey(`${prefix}.${btnKey}Button`, targets);
      targets[key] = { type: 'button', humanName: text, text, role: 'button', locatorCandidates: candidates };
    }

    // Headings (h1–h3)
    for (const heading of await page.locator('h1, h2, h3').all()) {
      const text = (await heading.innerText().catch(() => null))?.trim();
      if (!text) continue;
      const headKey = toCamelCase(text);
      if (!headKey) continue;

      const tag = await heading.evaluate(el => el.tagName.toLowerCase());
      const candidates: LocatorCandidate[] = [
        { strategy: 'role', role: 'heading', name: text, exact: true, score: 0.85 },
        { strategy: 'text', value: text, score: 0.75 },
      ];

      const key = uniqueKey(`${prefix}.${headKey}Heading`, targets);
      targets[key] = { type: 'heading', humanName: text, text, tag, locatorCandidates: candidates };
    }

    // Links
    for (const link of await page.locator('a[href]').all()) {
      const text = (await link.innerText().catch(() => null))?.trim();
      if (!text || text.length > 60) continue;
      const linkKey = toCamelCase(text);
      if (!linkKey) continue;

      const candidates: LocatorCandidate[] = [
        { strategy: 'role', role: 'link', name: text, score: 0.85 },
        { strategy: 'text', value: text, score: 0.75 },
      ];

      const key = uniqueKey(`${prefix}.${linkKey}Link`, targets);
      targets[key] = { type: 'link', humanName: text, text, role: 'link', locatorCandidates: candidates };
    }

    // Verification pass — resolve each candidate on the live page, count matches
    for (const entry of Object.values(targets)) {
      for (const candidate of entry.locatorCandidates) {
        if (candidate.strategy === 'cssNth') continue;
        try {
          let count: number;
          switch (candidate.strategy) {
            case 'label':
              count = await page.getByLabel(candidate.value!).count();
              break;
            case 'role':
              count = await page.getByRole(candidate.role as Parameters<typeof page.getByRole>[0], {
                name: candidate.name,
                exact: candidate.exact,
              }).count();
              break;
            case 'placeholder':
              count = await page.getByPlaceholder(candidate.value!).count();
              break;
            case 'text':
              count = await page.getByText(candidate.value!).count();
              break;
            case 'css':
              count = await page.locator(candidate.value!).count();
              break;
            default:
              continue;
          }
          candidate.matchCount = count;
          candidate.isUnique = count === 1;
        } catch {
          // leave undefined — invalid locator or stale DOM
        }
      }
    }

    const allCandidates = Object.values(targets).flatMap(e => e.locatorCandidates);
    const verified = allCandidates.filter(c => c.matchCount !== undefined);
    const unique = verified.filter(c => c.isUnique);
    const ambiguous = verified.filter(c => !c.isUnique);
    console.log(`Verified ${verified.length} candidates: ${unique.length} unique, ${ambiguous.length} ambiguous`);

    const pageMap: PageMap = {
      schemaVersion: 'page-mapper-v1',
      url: fullUrl,
      path: urlPath,
      title,
      pageName: prefix,
      scannedAt: new Date().toISOString(),
      ariaSnapshot,
      detectedFeatures: detectFeatures(targets),
      targets,
    };

    const outDir = path.join(__dirname, '..', '..', '..', 'generated', 'page-maps');
    fs.mkdirSync(outDir, { recursive: true });
    const outFile = path.join(outDir, `${prefix}.page-map.json`);
    fs.writeFileSync(outFile, JSON.stringify(pageMap, null, 2));

    console.log(`Detected features: ${pageMap.detectedFeatures.map(f => f.feature).join(', ') || 'none'}`);
    console.log(`Found ${Object.keys(targets).length} targets:`);
    Object.entries(targets).forEach(([k, v]) => console.log(`  ${k} (${v.type}) — ${v.locatorCandidates.length} candidates`));
    console.log(`Output: generated/page-maps/${prefix}.page-map.json`);
  } finally {
    await browser.close();
  }
}

const urlArg = process.argv[2];
if (!urlArg) {
  console.error('Usage: npm run scan -- <url-path>');
  console.error('Example: npm run scan -- /login');
  process.exit(1);
}

map(urlArg).catch(err => {
  console.error(err);
  process.exit(1);
});
