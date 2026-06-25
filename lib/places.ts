// Friendly names for common IATA airport / city codes. Falls back to the raw
// code for anything not listed, so it is safe to leave incomplete.

const PLACES: Record<string, string> = {
  // United States
  JFK: "New York", EWR: "Newark", LGA: "New York", NYC: "New York",
  LAX: "Los Angeles", SFO: "San Francisco", SJC: "San Jose", OAK: "Oakland",
  ORD: "Chicago", MDW: "Chicago", CHI: "Chicago",
  MIA: "Miami", FLL: "Fort Lauderdale", MCO: "Orlando", TPA: "Tampa", RSW: "Fort Myers",
  BOS: "Boston", SEA: "Seattle", PDX: "Portland", DEN: "Denver", LAS: "Las Vegas",
  ATL: "Atlanta", DFW: "Dallas", DAL: "Dallas", IAH: "Houston", HOU: "Houston",
  PHX: "Phoenix", SAN: "San Diego", SMF: "Sacramento",
  PHL: "Philadelphia", DCA: "Washington", IAD: "Washington", BWI: "Baltimore", WAS: "Washington",
  CLT: "Charlotte", DTW: "Detroit", MSP: "Minneapolis", SLC: "Salt Lake City",
  AUS: "Austin", SAT: "San Antonio", BNA: "Nashville", MSY: "New Orleans",
  RDU: "Raleigh", IND: "Indianapolis", MCI: "Kansas City", STL: "St. Louis",
  CMH: "Columbus", CLE: "Cleveland", CVG: "Cincinnati", PIT: "Pittsburgh",
  HNL: "Honolulu", OGG: "Maui", ANC: "Anchorage",

  // Canada
  YYZ: "Toronto", YVR: "Vancouver", YUL: "Montreal", YYC: "Calgary", YOW: "Ottawa",

  // Europe
  LHR: "London", LGW: "London", STN: "London", LON: "London",
  CDG: "Paris", ORY: "Paris", PAR: "Paris",
  AMS: "Amsterdam", FRA: "Frankfurt", MUC: "Munich", BER: "Berlin", HAM: "Hamburg", DUS: "Dusseldorf",
  MAD: "Madrid", BCN: "Barcelona", AGP: "Malaga", PMI: "Palma",
  FCO: "Rome", ROM: "Rome", MXP: "Milan", MIL: "Milan", VCE: "Venice", NAP: "Naples",
  LIS: "Lisbon", OPO: "Porto", DUB: "Dublin", EDI: "Edinburgh", MAN: "Manchester",
  ZRH: "Zurich", GVA: "Geneva", VIE: "Vienna", BRU: "Brussels",
  CPH: "Copenhagen", ARN: "Stockholm", OSL: "Oslo", HEL: "Helsinki", KEF: "Reykjavik",
  ATH: "Athens", IST: "Istanbul", PRG: "Prague", BUD: "Budapest", WAW: "Warsaw", NCE: "Nice",

  // Middle East & Africa
  DXB: "Dubai", AUH: "Abu Dhabi", DOH: "Doha", TLV: "Tel Aviv",
  CAI: "Cairo", CMN: "Casablanca", RAK: "Marrakesh",
  JNB: "Johannesburg", CPT: "Cape Town", NBO: "Nairobi",

  // Asia & Pacific
  NRT: "Tokyo", HND: "Tokyo", TYO: "Tokyo", KIX: "Osaka", ICN: "Seoul",
  PEK: "Beijing", PVG: "Shanghai", HKG: "Hong Kong", TPE: "Taipei",
  SIN: "Singapore", BKK: "Bangkok", HKT: "Phuket", KUL: "Kuala Lumpur",
  CGK: "Jakarta", DPS: "Bali", MNL: "Manila", DEL: "Delhi", BOM: "Mumbai",
  SYD: "Sydney", MEL: "Melbourne", AKL: "Auckland", NAN: "Fiji",

  // Latin America & Caribbean
  CUN: "Cancun", MEX: "Mexico City", SJD: "Los Cabos", PVR: "Puerto Vallarta", GDL: "Guadalajara",
  GRU: "Sao Paulo", GIG: "Rio de Janeiro", EZE: "Buenos Aires", SCL: "Santiago", LIM: "Lima",
  BOG: "Bogota", CTG: "Cartagena", PTY: "Panama City", SJO: "San Jose", LIR: "Liberia",
  PUJ: "Punta Cana", SDQ: "Santo Domingo", MBJ: "Montego Bay", NAS: "Nassau",
  AUA: "Aruba", SJU: "San Juan", HAV: "Havana", BZE: "Belize City", GCM: "Grand Cayman",
  BGI: "Barbados", SXM: "St. Maarten", CUR: "Curacao",
};

export function placeName(code: string): string {
  return PLACES[code?.toUpperCase()] ?? code;
}
