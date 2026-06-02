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

/** Maps each supported detected city to its state. */
const CITY_TO_STATE: Record<string, string> = {
  Mumbai: "Maharashtra",
  Pune: "Maharashtra",
  Delhi: "Delhi",
  Gurugram: "Haryana",
  Noida: "Uttar Pradesh",
  Lucknow: "Uttar Pradesh",
  Kolkata: "West Bengal",
  Ahmedabad: "Gujarat",
  Jaipur: "Rajasthan",
  // Bengaluru, Hyderabad, Chennai: no verified state cyber-cell contact yet.
};

/**
 * Returns the verified state cyber-cell contact for a detected city, or null
 * when we have no verified entry (so the home card hides).
 */
export function getCyberCellContact(city: string | null | undefined): CyberCellContact | null {
  if (!city) return null;
  const stateKey = CITY_TO_STATE[city];
  if (!stateKey) return null;
  return STATE_CONTACTS[stateKey] ?? null;
}
