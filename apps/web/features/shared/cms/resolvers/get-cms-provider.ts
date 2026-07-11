/**
 * CMS provider resolver — single injection point.
 *
 * Returns the appropriate CmsProvider based on environment.
 * All pages import from here — never from a specific provider class.
 *
 * Pattern:
 *   import { getCmsProvider } from "@/features/shared/cms/resolvers/get-cms-provider";
 *   const cms = getCmsProvider();
 *   const services = await cms.getServices();
 */
import type { CmsProvider } from "../contracts/cms-provider.contract";

let _provider: CmsProvider | null = null;

export function getCmsProvider(): CmsProvider {
  if (_provider) return _provider;

  // MONGODB_URI present → production MongoDB provider
  // Absent (local dev without DB, CI) → safe local fallback
  const hasMongo = Boolean(process.env.MONGODB_URI);

  if (hasMongo) {
    // Loaded lazily so the server bundle only includes Mongoose when needed
    const { MongoCmsProvider } = require("../providers/mongo.provider") as
      typeof import("../providers/mongo.provider");
    _provider = new MongoCmsProvider();
  } else {
    const { LocalFallbackProvider } = require("../providers/local-fallback.provider") as
      typeof import("../providers/local-fallback.provider");
    _provider = new LocalFallbackProvider();
  }

  return _provider;
}

/**
 * For use in tests or Storybook — inject a mock provider.
 */
export function setCmsProvider(provider: CmsProvider): void {
  _provider = provider;
}
