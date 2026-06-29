/**
 * Type definitions (schema contract) for the page-map output.
 * Written by PageMapper.ts, read by PageMapLocatorRegistry.ts.
 * Output location: generated/page-maps/<pageName>.page-map.json
 *
 * Notes:
 * Currently, the locator strategy is simple and works well with Static Pages:
 * --> Consider in the future: Domain-specific strategies (e.g. shadow DOM, dynamic ids).
 * 
 * etc. (Just an idea)
 */

export type LocatorStrategy = 'label' | 'role' | 'placeholder' | 'text' | 'css' | 'cssNth';

export type LocatorCandidate = {
  strategy: LocatorStrategy;
  value?: string;
  role?: string;
  name?: string;
  exact?: boolean;
  // Used by cssNth strategy — zero-based position among matching elements
  index?: number;
  score: number;
  matchCount?: number;
  isUnique?: boolean;
};

export type ElementType =
  | 'input'
  | 'password'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'button'
  | 'heading'
  | 'link';

export type TargetEntry = {
  type: ElementType;
  humanName?: string;
  label?: string;
  text?: string;
  role?: string;
  tag?: string;
  placeholder?: string;
  locatorCandidates: LocatorCandidate[];
};

export type DetectedFeature = {
  feature: string;
  confidence: number;
  evidence: string[];
};

export type PageMap = {
  schemaVersion: string;
  url: string;
  path: string;
  title: string;
  pageName: string;
  scannedAt: string;
  ariaSnapshot: string;
  detectedFeatures: DetectedFeature[];
  targets: Record<string, TargetEntry>;
};
