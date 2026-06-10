/**
 * State cyber-cell contacts shown on the home screen for the user's detected
 * city. Each entry is sourced from an official government page (.gov.in /
 * .nic.in) or the RBI-published list of cyber-crime nodal agencies, and carries
 * the `source` URL plus the month it was last verified so it can be audited and
 * refreshed. The national 1930 helpline is already shown elsewhere on the home
 * screen, so these are the *state* cyber-cell numbers/emails only.
 *
 * We only ship entries we could confirm against an official source. Cities whose
 * state contact could not be verified (e.g. Bengaluru, Hyderabad, Chennai)
 * intentionally have no entry, so the home card simply hides for them rather
 * than showing an unverified — and potentially wrong — number.
 */
export type CyberCellContact = {
  /** Display name of the state / UT (English proper noun, kept untranslated). */
  state: string;
  /** State cyber-cell phone (with STD code). Omitted when unverified. */
  phone?: string;
  /** State cyber-cell official email. Omitted when unverified. */
  email?: string;
  /** Official source the contact was verified against. */
  source: string;
  /** Month/year the contact was last verified, e.g. "Jun 2026". */
  verified: string;
};

const VERIFIED = "Jun 2026";

const STATE_CONTACTS: Record<string, CyberCellContact> = {
  Maharashtra: {
    state: "Maharashtra",
    phone: "022-22160080",
    email: "control.cgaw-mah@gov.in",
    source: "https://mhcyber.gov.in",
    verified: VERIFIED,
  },
  Delhi: {
    state: "Delhi",
    phone: "011-23746694",
    email: "dcp-newdelhi-dl@nic.in",
    source: "https://cyber.delhipolice.gov.in",
    verified: VERIFIED,
  },
  Haryana: {
    state: "Haryana",
    phone: "0172-2587529",
    email: "adgp.crime@hry.nic.in",
    source: "https://haryanapolice.gov.in/TelephoneDirectory_cyber",
    verified: VERIFIED,
  },
  "Uttar Pradesh": {
    state: "Uttar Pradesh",
    phone: "0522-2390538",
    email: "sp-cyber.lu@up.gov.in",
    source: "https://uppolice.gov.in/article/en/cyber-crime",
    verified: VERIFIED,
  },
  "West Bengal": {
    state: "West Bengal",
    phone: "033-22021200",
    email: "contact@cidwestbengal.gov.in",
    source: "https://cybercrimewing.wb.gov.in/ContactUs",
    verified: VERIFIED,
  },
  Gujarat: {
    state: "Gujarat",
    phone: "079-23250798",
    email: "Gujarat.cc-cid@gujarat.gov.in",
    source: "https://cybernodal.gujarat.gov.in",
    verified: VERIFIED,
  },
  Rajasthan: {
    state: "Rajasthan",
    phone: "0141-2740580",
    source: "https://police.rajasthan.gov.in",
    verified: VERIFIED,
  },
};

/**
 * Maps a known metro city to its state. Used only as a fallback when the
 * geocoded state name is unavailable — the device location now resolves the
 * state directly for anywhere in India.
 */
const CITY_TO_STATE: Record<string, string> = {
  Mumbai: "Maharashtra",
  Pune: "Maharashtra",
  Delhi: "Delhi",
  Gurugram: "Haryana",
  Noida: "Uttar Pradesh",
  Lucknow: "Uttar Pradesh",
  Kanpur: "Uttar Pradesh",
  Kolkata: "West Bengal",
  Ahmedabad: "Gujarat",
  Jaipur: "Rajasthan",
  // Bengaluru, Hyderabad, Chennai: no verified state cyber-cell contact yet.
};

/**
 * Normalises the many ways a platform geocoder can spell an Indian state/UT
 * (full names, abbreviations, the NCT-of-Delhi variants) to the canonical key
 * used in `STATE_CONTACTS`. Covers all 28 states + 8 UTs so a contact is found
 * whenever one is verified, regardless of the device's geocoder formatting.
 */
const STATE_ALIASES: Record<string, string> = {
  "andhra pradesh": "Andhra Pradesh",
  "ap": "Andhra Pradesh",
  "arunachal pradesh": "Arunachal Pradesh",
  "assam": "Assam",
  "bihar": "Bihar",
  "chhattisgarh": "Chhattisgarh",
  "chattisgarh": "Chhattisgarh",
  "goa": "Goa",
  "gujarat": "Gujarat",
  "haryana": "Haryana",
  "himachal pradesh": "Himachal Pradesh",
  "hp": "Himachal Pradesh",
  "jharkhand": "Jharkhand",
  "karnataka": "Karnataka",
  "kerala": "Kerala",
  "madhya pradesh": "Madhya Pradesh",
  "mp": "Madhya Pradesh",
  "maharashtra": "Maharashtra",
  "manipur": "Manipur",
  "meghalaya": "Meghalaya",
  "mizoram": "Mizoram",
  "nagaland": "Nagaland",
  "odisha": "Odisha",
  "orissa": "Odisha",
  "punjab": "Punjab",
  "rajasthan": "Rajasthan",
  "sikkim": "Sikkim",
  "tamil nadu": "Tamil Nadu",
  "tamilnadu": "Tamil Nadu",
  "telangana": "Telangana",
  "tripura": "Tripura",
  "uttar pradesh": "Uttar Pradesh",
  "up": "Uttar Pradesh",
  "uttarakhand": "Uttarakhand",
  "uttaranchal": "Uttarakhand",
  "west bengal": "West Bengal",
  "wb": "West Bengal",
  // Union Territories
  "andaman and nicobar islands": "Andaman and Nicobar Islands",
  "chandigarh": "Chandigarh",
  "dadra and nagar haveli and daman and diu": "Dadra and Nagar Haveli and Daman and Diu",
  "delhi": "Delhi",
  "nct of delhi": "Delhi",
  "national capital territory of delhi": "Delhi",
  "new delhi": "Delhi",
  "jammu and kashmir": "Jammu and Kashmir",
  "ladakh": "Ladakh",
  "lakshadweep": "Lakshadweep",
  "puducherry": "Puducherry",
  "pondicherry": "Puducherry",
};

/** Resolves a geocoded state/UT name to a canonical key, or undefined. */
function normalizeState(state: string | null | undefined): string | undefined {
  if (!state) return undefined;
  const trimmed = state.trim();
  if (STATE_CONTACTS[trimmed]) return trimmed;
  return STATE_ALIASES[trimmed.toLowerCase()];
}

/**
 * Returns the verified state cyber-cell contact for the user's location. Prefers
 * the geocoded state (accurate anywhere in India) and falls back to deriving the
 * state from a known metro city. Returns null when we have no *verified* entry
 * for that state, so the home card hides rather than show an unverified number
 * (the national 1930 helpline is shown elsewhere and covers every state).
 */
export function getCyberCellContact(
  city: string | null | undefined,
  state?: string | null | undefined,
): CyberCellContact | null {
  const stateKey = normalizeState(state) ?? (city ? CITY_TO_STATE[city] : undefined);
  if (!stateKey) return null;
  return STATE_CONTACTS[stateKey] ?? null;
}
