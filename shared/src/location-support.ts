import type { JobSource } from "./types";

const COUNTRY_ALIASES: Record<string, string> = {
  uk: "united kingdom",
  us: "united states",
  usa: "united states",
  türkiye: "turkey",
  "czech republic": "czechia",
};

const COUNTRY_LABELS: Record<string, string> = {
  "united kingdom": "United Kingdom",
  "united states": "United States",
  "usa/ca": "USA/CA",
  turkey: "Turkey",
  czechia: "Czechia",
  "european union": "European Union",
  eea: "EEA (EU + EFTA)",
  "eu + uk": "EU + United Kingdom",
};

/**
 * Region groups that expand into multiple individual countries.
 * Each member must be a key present in SUPPORTED_COUNTRY_INPUTS.
 */
export const REGION_GROUPS: Record<string, readonly string[]> = {
  "european union": [
    "austria",
    "belgium",
    "bulgaria",
    "croatia",
    "cyprus",
    "czechia",
    "denmark",
    "estonia",
    "finland",
    "france",
    "germany",
    "greece",
    "hungary",
    "ireland",
    "italy",
    "latvia",
    "lithuania",
    "luxembourg",
    "malta",
    "netherlands",
    "poland",
    "portugal",
    "romania",
    "slovakia",
    "slovenia",
    "spain",
    "sweden",
  ],
  eea: [
    "austria",
    "belgium",
    "bulgaria",
    "croatia",
    "cyprus",
    "czechia",
    "denmark",
    "estonia",
    "finland",
    "france",
    "germany",
    "greece",
    "hungary",
    "ireland",
    "italy",
    "latvia",
    "lithuania",
    "luxembourg",
    "malta",
    "netherlands",
    "norway",
    "poland",
    "portugal",
    "romania",
    "slovakia",
    "slovenia",
    "spain",
    "sweden",
    "switzerland",
  ],
  "eu + uk": [
    "austria",
    "belgium",
    "bulgaria",
    "croatia",
    "cyprus",
    "czechia",
    "denmark",
    "estonia",
    "finland",
    "france",
    "germany",
    "greece",
    "hungary",
    "ireland",
    "italy",
    "latvia",
    "lithuania",
    "luxembourg",
    "malta",
    "netherlands",
    "poland",
    "portugal",
    "romania",
    "slovakia",
    "slovenia",
    "spain",
    "sweden",
    "united kingdom",
  ],
};

/**
 * If `country` is a region group key, returns the list of member countries.
 * Otherwise returns a single-element array with the original country.
 */
export function expandRegionGroup(country: string): string[] {
  const normalized = normalizeCountryKey(country);
  const members = REGION_GROUPS[normalized];
  return members ? [...members] : [normalized];
}

/**
 * Returns true if the given country key is a region group (e.g. "european union").
 */
export function isRegionGroup(country: string): boolean {
  return normalizeCountryKey(country) in REGION_GROUPS;
}

// Keep this list aligned with the JobSpy supported country inputs.
export const SUPPORTED_COUNTRY_INPUTS = [
  "argentina",
  "australia",
  "austria",
  "bahrain",
  "bangladesh",
  "belgium",
  "bulgaria",
  "brazil",
  "canada",
  "chile",
  "china",
  "colombia",
  "costa rica",
  "croatia",
  "cyprus",
  "czech republic",
  "czechia",
  "denmark",
  "ecuador",
  "egypt",
  "estonia",
  "finland",
  "france",
  "germany",
  "greece",
  "hong kong",
  "hungary",
  "india",
  "indonesia",
  "ireland",
  "israel",
  "italy",
  "japan",
  "kuwait",
  "latvia",
  "lithuania",
  "luxembourg",
  "malaysia",
  "malta",
  "mexico",
  "morocco",
  "netherlands",
  "new zealand",
  "nigeria",
  "norway",
  "oman",
  "pakistan",
  "panama",
  "peru",
  "philippines",
  "poland",
  "portugal",
  "qatar",
  "romania",
  "saudi arabia",
  "singapore",
  "slovakia",
  "slovenia",
  "south africa",
  "south korea",
  "spain",
  "sweden",
  "switzerland",
  "taiwan",
  "thailand",
  "türkiye",
  "turkey",
  "ukraine",
  "united arab emirates",
  "uk",
  "united kingdom",
  "usa",
  "us",
  "united states",
  "uruguay",
  "venezuela",
  "vietnam",
  "usa/ca",
  "worldwide",
  "european union",
  "eea",
  "eu + uk",
] as const;

const UK_ONLY_SOURCES = new Set<JobSource>(["gradcracker", "ukvisajobs"]);
const GLASSDOOR_SUPPORTED_COUNTRIES = new Set(
  [
    "australia",
    "austria",
    "belgium",
    "brazil",
    "canada",
    "france",
    "germany",
    "hong kong",
    "india",
    "ireland",
    "italy",
    "mexico",
    "netherlands",
    "new zealand",
    "singapore",
    "spain",
    "switzerland",
    "united kingdom",
    "united states",
    "vietnam",
  ].map((country) => normalizeCountryKey(country)),
);
const ADZUNA_COUNTRY_CODE_BY_KEY: Record<string, string> = {
  "united kingdom": "gb",
  "united states": "us",
  austria: "at",
  australia: "au",
  belgium: "be",
  brazil: "br",
  canada: "ca",
  switzerland: "ch",
  germany: "de",
  spain: "es",
  france: "fr",
  india: "in",
  italy: "it",
  mexico: "mx",
  netherlands: "nl",
  "new zealand": "nz",
  poland: "pl",
  singapore: "sg",
  "south africa": "za",
};

export function normalizeCountryKey(value: string | null | undefined): string {
  const normalized = value?.trim().toLowerCase() ?? "";
  return COUNTRY_ALIASES[normalized] ?? normalized;
}

export function formatCountryLabel(value: string): string {
  const normalized = normalizeCountryKey(value);
  if (!normalized) return "";
  return (
    COUNTRY_LABELS[normalized] ||
    normalized.replace(/\b\w/g, (char) => char.toUpperCase())
  );
}

export const SUPPORTED_COUNTRY_KEYS = Array.from(
  new Set(
    SUPPORTED_COUNTRY_INPUTS.map((country) => normalizeCountryKey(country)),
  ),
).filter(Boolean);

export function isUkCountry(country: string | null | undefined): boolean {
  return normalizeCountryKey(country) === "united kingdom";
}

export function isGlassdoorCountry(
  country: string | null | undefined,
): boolean {
  return GLASSDOOR_SUPPORTED_COUNTRIES.has(normalizeCountryKey(country));
}

export function getAdzunaCountryCode(
  country: string | null | undefined,
): string | null {
  return ADZUNA_COUNTRY_CODE_BY_KEY[normalizeCountryKey(country)] ?? null;
}

export function isSourceAllowedForCountry(
  source: JobSource,
  country: string | null | undefined,
): boolean {
  const normalized = normalizeCountryKey(country);
  const members = REGION_GROUPS[normalized];
  if (members) {
    return members.some((member) => isSourceAllowedForCountry(source, member));
  }
  if (UK_ONLY_SOURCES.has(source)) return isUkCountry(country);
  if (source === "glassdoor") return isGlassdoorCountry(country);
  if (source === "adzuna") return getAdzunaCountryCode(country) !== null;
  return true;
}

export function getCompatibleSourcesForCountry(
  sources: JobSource[],
  country: string | null | undefined,
): JobSource[] {
  return sources.filter((source) => isSourceAllowedForCountry(source, country));
}
