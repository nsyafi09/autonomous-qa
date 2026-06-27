export const env = {
  isCI: !!process.env.CI,
  baseURL: process.env.BASE_URL ?? 'https://the-internet.herokuapp.com',
};
