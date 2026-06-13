export const COUNTRIES = [
  { code: 'CA', name: 'Canada', currency: 'CAD', regionLabel: 'Province' },
  { code: 'US', name: 'United States', currency: 'USD', regionLabel: 'State' },
  { code: 'CO', name: 'Colombia', currency: 'COP', regionLabel: 'Department' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', regionLabel: 'County' },
  { code: 'AU', name: 'Australia', currency: 'AUD', regionLabel: 'State' },
  { code: 'MX', name: 'Mexico', currency: 'MXN', regionLabel: 'State' },
] as const

export const REGIONS: Record<string, string[]> = {
  CA: [
    'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick',
    'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia',
    'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec',
    'Saskatchewan', 'Yukon',
  ],
  US: [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
    'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
    'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
    'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
    'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
    'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
    'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
    'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
    'West Virginia', 'Wisconsin', 'Wyoming', 'District of Columbia',
  ],
  CO: [
    'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bolívar', 'Boyacá',
    'Caldas', 'Caquetá', 'Casanare', 'Cauca', 'Cesar', 'Chocó',
    'Córdoba', 'Cundinamarca', 'Guainía', 'Guaviare', 'Huila',
    'La Guajira', 'Magdalena', 'Meta', 'Nariño', 'Norte de Santander',
    'Putumayo', 'Quindío', 'Risaralda', 'San Andrés', 'Santander',
    'Sucre', 'Tolima', 'Valle del Cauca', 'Vaupés', 'Vichada',
  ],
  GB: [
    'England', 'Scotland', 'Wales', 'Northern Ireland',
    'Greater London', 'West Midlands', 'Greater Manchester',
    'West Yorkshire', 'Kent', 'Essex', 'Surrey', 'Hampshire',
  ],
  AU: [
    'Australian Capital Territory', 'New South Wales', 'Northern Territory',
    'Queensland', 'South Australia', 'Tasmania', 'Victoria',
    'Western Australia',
  ],
  MX: [
    'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche',
    'Chiapas', 'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima',
    'Durango', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'México',
    'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla',
    'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora',
    'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas',
  ],
}

/** Legacy province abbreviations → full names for Canadian properties. */
const CA_ABBREV_TO_REGION: Record<string, string> = {
  AB: 'Alberta', BC: 'British Columbia', MB: 'Manitoba', NB: 'New Brunswick',
  NL: 'Newfoundland and Labrador', NS: 'Nova Scotia', NT: 'Northwest Territories',
  NU: 'Nunavut', ON: 'Ontario', PE: 'Prince Edward Island', QC: 'Quebec',
  SK: 'Saskatchewan', YT: 'Yukon',
}

export function normalizeRegion(countryCode: string, region: string | null | undefined): string {
  if (!region) return ''
  if (countryCode === 'CA' && region.length <= 3 && CA_ABBREV_TO_REGION[region]) {
    return CA_ABBREV_TO_REGION[region]
  }
  return region
}

export function getCurrencyForCountry(countryCode: string): string {
  return COUNTRIES.find((c) => c.code === countryCode)?.currency || 'CAD'
}

export function getRegionLabel(countryCode: string): string {
  return COUNTRIES.find((c) => c.code === countryCode)?.regionLabel || 'Province'
}

export function getRegions(countryCode: string): string[] {
  return REGIONS[countryCode] || []
}

export function getRegionOptions(countryCode: string, currentRegion?: string | null): string[] {
  const regions = getRegions(countryCode)
  const normalized = normalizeRegion(countryCode, currentRegion)
  if (normalized && !regions.includes(normalized)) {
    return [normalized, ...regions]
  }
  return regions
}
