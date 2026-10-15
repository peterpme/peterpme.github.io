export const AUTHOR = "Peter Piekarczyk";
export const TAGLINE = "Building Backpack and products AI made possible";
export const SITE_HOST = "www.peterp.me";
export const SITE_URL = `https://${SITE_HOST}`;
export const DESCRIPTION = `${AUTHOR}. ${TAGLINE}.`;
export const TWITTER = "@peterpme";
export const FEATURED_SLUG = "what-actually-happens-when-you-message-grok-bot";
export const ARCHIVE_BEFORE_YEAR = 2019;

export type NavId = "writing" | "ideas" | "talks" | "about";

export const SOCIAL = [
  { label: "Twitter", href: "https://www.twitter.com/peterpme" },
  { label: "GitHub", href: "https://www.github.com/peterpme" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/peterpme" },
  { label: "Instagram", href: "https://www.instagram.com/peterpme" },
] as const;

export const NOW = [
  { label: "TypeScript", href: "https://www.typescriptlang.org/" },
  { label: "Effect", href: "https://effect.website/" },
  { label: "React Native", href: "https://reactnative.dev/" },
] as const;

export const FAVORITES = [
  { label: "Expo", href: "https://expo.io/" },
  { label: "React Native", href: "https://reactnative.dev/" },
  { label: "ChatGPT", href: "https://chat.openai.com" },
  { label: "Stable Diffusion", href: "https://stable.ai/" },
] as const;

export const COMMUNITY = [{ label: "ChicagoJS", href: "https://chicagojs.org" }] as const;
