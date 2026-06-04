/**
 * Maps the cities used across the app (seeded baseline cities + cities captured
 * on live fraud reports) to their Indian state. The admin fraud map aggregates
 * report volume by state, which is the framing media, police, investors, and
 * government care about. Unknown cities fall back to an "Other" bucket so the
 * totals always reconcile.
 */

export interface StateRef {
  state: string;
  code: string;
}

export const OTHER_STATE: StateRef = { state: "Other / Unknown", code: "—" };

const CITY_TO_STATE: Record<string, StateRef> = {
  delhi: { state: "Delhi", code: "DL" },
  "new delhi": { state: "Delhi", code: "DL" },
  bengaluru: { state: "Karnataka", code: "KA" },
  bangalore: { state: "Karnataka", code: "KA" },
  mysuru: { state: "Karnataka", code: "KA" },
  mumbai: { state: "Maharashtra", code: "MH" },
  pune: { state: "Maharashtra", code: "MH" },
  nagpur: { state: "Maharashtra", code: "MH" },
  hyderabad: { state: "Telangana", code: "TG" },
  chennai: { state: "Tamil Nadu", code: "TN" },
  coimbatore: { state: "Tamil Nadu", code: "TN" },
  gurugram: { state: "Haryana", code: "HR" },
  gurgaon: { state: "Haryana", code: "HR" },
  faridabad: { state: "Haryana", code: "HR" },
  kolkata: { state: "West Bengal", code: "WB" },
  ahmedabad: { state: "Gujarat", code: "GJ" },
  surat: { state: "Gujarat", code: "GJ" },
  noida: { state: "Uttar Pradesh", code: "UP" },
  lucknow: { state: "Uttar Pradesh", code: "UP" },
  kanpur: { state: "Uttar Pradesh", code: "UP" },
  ghaziabad: { state: "Uttar Pradesh", code: "UP" },
  jaipur: { state: "Rajasthan", code: "RJ" },
  jodhpur: { state: "Rajasthan", code: "RJ" },
  patna: { state: "Bihar", code: "BR" },
  bhopal: { state: "Madhya Pradesh", code: "MP" },
  indore: { state: "Madhya Pradesh", code: "MP" },
  chandigarh: { state: "Chandigarh", code: "CH" },
  kochi: { state: "Kerala", code: "KL" },
  thiruvananthapuram: { state: "Kerala", code: "KL" },
  bhubaneswar: { state: "Odisha", code: "OD" },
  guwahati: { state: "Assam", code: "AS" },
  visakhapatnam: { state: "Andhra Pradesh", code: "AP" },
  vijayawada: { state: "Andhra Pradesh", code: "AP" },
};

export function resolveState(city: string | null | undefined): StateRef {
  if (!city) return OTHER_STATE;
  return CITY_TO_STATE[city.trim().toLowerCase()] ?? OTHER_STATE;
}
