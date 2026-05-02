import { venueConfig } from "./venue.config";

export type SiteConfig = typeof siteConfig;

// Re-export venue branding as site config for backward compatibility
// with HeroUI template components
export const siteConfig = {
  name: venueConfig.branding.name,
  description: venueConfig.branding.description,
};
