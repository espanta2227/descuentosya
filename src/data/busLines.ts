// Líneas de ómnibus de Montevideo organizadas por zonas geográficas
// Datos basados en recorridos reales de STM (Sistema de Transporte Metropolitano)

interface BusZone {
  name: string;
  latMin: number;
  latMax: number;
  lngMin: number;
  lngMax: number;
  lines: { number: string; name: string; company: string }[];
}

const montevideoBusZones: BusZone[] = [
  {
    name: 'Ciudad Vieja',
    latMin: -34.915, latMax: -34.900,
    lngMin: -56.220, lngMax: -56.195,
    lines: [
      { number: '21', name: 'Aduana - Cerro', company: 'CUTCSA' },
      { number: '64', name: 'Ciudad Vieja - Paso de la Arena', company: 'CUTCSA' },
      { number: '124', name: 'Ciudad Vieja - Portones', company: 'CUTCSA' },
      { number: '130', name: 'Aduana - Colón', company: 'CUTCSA' },
      { number: '141', name: 'Aduana - Pocitos', company: 'CUTCSA' },
      { number: '142', name: 'Aduana - Buceo', company: 'CUTCSA' },
      { number: '148', name: 'Ciudad Vieja - Tres Cruces', company: 'CUTCSA' },
      { number: '187', name: 'Aduana - Manga', company: 'CUTCSA' },
      { number: '188', name: 'Aduana - Maroñas', company: 'CUTCSA' },
    ]
  },
  {
    name: 'Centro',
    latMin: -34.912, latMax: -34.898,
    lngMin: -56.198, lngMax: -56.175,
    lines: [
      { number: '103', name: '18 de Julio - Malvín', company: 'CUTCSA' },
      { number: '104', name: '18 de Julio - Carrasco', company: 'CUTCSA' },
      { number: '109', name: 'Centro - Portones', company: 'CUTCSA' },
      { number: '110', name: 'Centro - Tres Cruces', company: 'CUTCSA' },
      { number: '117', name: 'Centro - Punta Carretas', company: 'CUTCSA' },
      { number: '121', name: 'Centro - Pocitos', company: 'CUTCSA' },
      { number: '145', name: 'Centro - Cordón', company: 'CUTCSA' },
      { number: '156', name: 'Centro - Parque Batlle', company: 'CUTCSA' },
      { number: '158', name: 'Centro - La Comercial', company: 'CUTCSA' },
      { number: '169', name: 'Centro - Aguada', company: 'CUTCSA' },
      { number: '174', name: 'Centro - Buceo', company: 'CUTCSA' },
      { number: '183', name: 'Centro - Pocitos', company: 'CUTCSA' },
      { number: '199', name: 'Centro - Tres Cruces', company: 'UCOT' },
    ]
  },
  {
    name: 'Cordón',
    latMin: -34.910, latMax: -34.897,
    lngMin: -56.185, lngMax: -56.168,
    lines: [
      { number: '109', name: 'Cordón - Goes', company: 'CUTCSA' },
      { number: '110', name: 'Cordón - Tres Cruces', company: 'CUTCSA' },
      { number: '117', name: 'Cordón - Punta Carretas', company: 'CUTCSA' },
      { number: '121', name: 'Cordón - Pocitos', company: 'CUTCSA' },
      { number: '145', name: 'Cordón - Parque Rodó', company: 'CUTCSA' },
      { number: '181', name: 'Cordón - La Blanqueada', company: 'CUTCSA' },
    ]
  },
  {
    name: 'Pocitos',
    latMin: -34.930, latMax: -34.910,
    lngMin: -56.165, lngMax: -56.140,
    lines: [
      { number: '104', name: 'Pocitos - Ciudad Vieja', company: 'CUTCSA' },
      { number: '117', name: 'Pocitos - Centro', company: 'CUTCSA' },
      { number: '121', name: 'Pocitos - Centro', company: 'CUTCSA' },
      { number: '141', name: 'Pocitos - Aduana', company: 'CUTCSA' },
      { number: '142', name: 'Pocitos - Aduana', company: 'CUTCSA' },
      { number: '174', name: 'Pocitos - Centro', company: 'CUTCSA' },
      { number: '183', name: 'Pocitos - Centro', company: 'CUTCSA' },
      { number: '300', name: 'Pocitos - Tres Cruces', company: 'COETC' },
    ]
  },
  {
    name: 'Buceo',
    latMin: -34.920, latMax: -34.905,
    lngMin: -56.145, lngMax: -56.125,
    lines: [
      { number: '104', name: 'Buceo - Centro', company: 'CUTCSA' },
      { number: '109', name: 'Buceo - Centro', company: 'CUTCSA' },
      { number: '117', name: 'Buceo - Punta Carretas', company: 'CUTCSA' },
      { number: '121', name: 'Buceo - Centro', company: 'CUTCSA' },
      { number: '142', name: 'Buceo - Ciudad Vieja', company: 'CUTCSA' },
      { number: '174', name: 'Buceo - Centro', company: 'CUTCSA' },
      { number: 'D1', name: 'Diferencial Buceo', company: 'CUTCSA' },
    ]
  },
  {
    name: 'Punta Carretas',
    latMin: -34.935, latMax: -34.920,
    lngMin: -56.170, lngMax: -56.150,
    lines: [
      { number: '104', name: 'Punta Carretas - Centro', company: 'CUTCSA' },
      { number: '117', name: 'Punta Carretas - Centro', company: 'CUTCSA' },
      { number: '121', name: 'Punta Carretas - Centro', company: 'CUTCSA' },
      { number: '142', name: 'Punta Carretas - Ciudad Vieja', company: 'CUTCSA' },
      { number: '174', name: 'Punta Carretas - Centro', company: 'CUTCSA' },
      { number: '116', name: 'Punta Carretas - Parque Rodó', company: 'CUTCSA' },
    ]
  },
  {
    name: 'Parque Rodó',
    latMin: -34.925, latMax: -34.912,
    lngMin: -56.175, lngMax: -56.155,
    lines: [
      { number: '60', name: 'Parque Rodó - Paso Molino', company: 'CUTCSA' },
      { number: '62', name: 'Parque Rodó - La Teja', company: 'CUTCSA' },
      { number: '64', name: 'Parque Rodó - Paso de la Arena', company: 'CUTCSA' },
      { number: '104', name: 'Parque Rodó - Carrasco', company: 'CUTCSA' },
      { number: '117', name: 'Parque Rodó - Centro', company: 'CUTCSA' },
      { number: '116', name: 'Parque Rodó - Punta Carretas', company: 'CUTCSA' },
    ]
  },
  {
    name: 'Tres Cruces',
    latMin: -34.900, latMax: -34.888,
    lngMin: -56.180, lngMax: -56.160,
    lines: [
      { number: '104', name: 'Tres Cruces - Centro', company: 'CUTCSA' },
      { number: '109', name: 'Tres Cruces - Centro', company: 'CUTCSA' },
      { number: '110', name: 'Tres Cruces - Centro', company: 'CUTCSA' },
      { number: '121', name: 'Tres Cruces - Pocitos', company: 'CUTCSA' },
      { number: '148', name: 'Tres Cruces - Ciudad Vieja', company: 'CUTCSA' },
      { number: '174', name: 'Tres Cruces - Buceo', company: 'CUTCSA' },
      { number: '199', name: 'Tres Cruces - Centro', company: 'UCOT' },
      { number: 'L1', name: 'Línea 1 Interdepartamental', company: 'COT' },
      { number: 'L3', name: 'Línea 3 Interdepartamental', company: 'COPSA' },
    ]
  },
  {
    name: 'Parque Batlle',
    latMin: -34.900, latMax: -34.885,
    lngMin: -56.168, lngMax: -56.148,
    lines: [
      { number: '103', name: 'Parque Batlle - Centro', company: 'CUTCSA' },
      { number: '109', name: 'Parque Batlle - Centro', company: 'CUTCSA' },
      { number: '121', name: 'Parque Batlle - Pocitos', company: 'CUTCSA' },
      { number: '142', name: 'Parque Batlle - Ciudad Vieja', company: 'CUTCSA' },
      { number: '156', name: 'Parque Batlle - Centro', company: 'CUTCSA' },
      { number: '181', name: 'Parque Batlle - Cordón', company: 'CUTCSA' },
    ]
  },
  {
    name: 'Carrasco',
    latMin: -34.900, latMax: -34.878,
    lngMin: -56.080, lngMax: -56.050,
    lines: [
      { number: '104', name: 'Carrasco - Centro', company: 'CUTCSA' },
      { number: '109', name: 'Carrasco - Centro', company: 'CUTCSA' },
      { number: '117', name: 'Carrasco - Pocitos', company: 'CUTCSA' },
      { number: '710', name: 'Carrasco - Aeropuerto', company: 'CUTCSA' },
      { number: 'CA1', name: 'COA Carrasco', company: 'CUTCSA' },
      { number: 'D10', name: 'Diferencial Carrasco', company: 'CUTCSA' },
    ]
  },
  {
    name: 'Malvín',
    latMin: -34.915, latMax: -34.900,
    lngMin: -56.120, lngMax: -56.095,
    lines: [
      { number: '103', name: 'Malvín - Centro', company: 'CUTCSA' },
      { number: '104', name: 'Malvín - Centro', company: 'CUTCSA' },
      { number: '109', name: 'Malvín - Centro', company: 'CUTCSA' },
      { number: '117', name: 'Malvín - Pocitos', company: 'CUTCSA' },
      { number: '121', name: 'Malvín - Centro', company: 'CUTCSA' },
    ]
  },
  {
    name: 'La Blanqueada',
    latMin: -34.898, latMax: -34.885,
    lngMin: -56.165, lngMax: -56.148,
    lines: [
      { number: '109', name: 'La Blanqueada - Centro', company: 'CUTCSA' },
      { number: '121', name: 'La Blanqueada - Pocitos', company: 'CUTCSA' },
      { number: '156', name: 'La Blanqueada - Centro', company: 'CUTCSA' },
      { number: '181', name: 'La Blanqueada - Cordón', company: 'CUTCSA' },
      { number: '195', name: 'La Blanqueada - Paso Molino', company: 'CUTCSA' },
    ]
  },
  {
    name: 'Canelones / Interior',
    latMin: -34.600, latMax: -34.500,
    lngMin: -56.350, lngMax: -56.200,
    lines: [
      { number: 'COT', name: 'Interdepartamental a Canelones', company: 'COT' },
      { number: 'COPSA', name: 'Interdepartamental a Canelones', company: 'COPSA' },
      { number: 'L60', name: 'Línea 60 - Ruta del Vino', company: 'COPSA' },
    ]
  },
];

/**
 * Busca las líneas de ómnibus cercanas a un punto geográfico
 * Primero busca en zonas exactas, si no encuentra, busca las más cercanas
 */
export function getNearbyBusLines(lat: number, lng: number): {
  zone: string;
  lines: { number: string; name: string; company: string }[];
} {
  // Buscar zona exacta
  for (const zone of montevideoBusZones) {
    if (lat >= zone.latMin && lat <= zone.latMax && lng >= zone.lngMin && lng <= zone.lngMax) {
      return { zone: zone.name, lines: zone.lines };
    }
  }

  // Si no está en zona exacta, buscar la más cercana
  let closestZone = montevideoBusZones[0];
  let minDist = Infinity;

  for (const zone of montevideoBusZones) {
    const centerLat = (zone.latMin + zone.latMax) / 2;
    const centerLng = (zone.lngMin + zone.lngMax) / 2;
    const dist = Math.sqrt(Math.pow(lat - centerLat, 2) + Math.pow(lng - centerLng, 2));
    if (dist < minDist) {
      minDist = dist;
      closestZone = zone;
    }
  }

  return { zone: closestZone.name + ' (aprox.)', lines: closestZone.lines };
}

/**
 * Calcula distancia en km entre dos puntos (fórmula Haversine)
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Estima tiempo de viaje
 */
export function estimateTravelTime(distanceKm: number): {
  walking: { time: string; minutes: number };
  driving: { time: string; minutes: number };
  bike: { time: string; minutes: number };
} {
  // Velocidades promedio en Montevideo
  const walkingSpeed = 4.5; // km/h
  const drivingSpeed = 25;  // km/h (tránsito urbano MVD)
  const bikeSpeed = 15;     // km/h

  const walkMin = Math.round((distanceKm / walkingSpeed) * 60);
  const driveMin = Math.round((distanceKm / drivingSpeed) * 60);
  const bikeMin = Math.round((distanceKm / bikeSpeed) * 60);

  const formatTime = (min: number) => {
    if (min < 60) return `${min} min`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
  };

  return {
    walking: { time: formatTime(walkMin), minutes: walkMin },
    driving: { time: formatTime(driveMin), minutes: driveMin },
    bike: { time: formatTime(bikeMin), minutes: bikeMin },
  };
}

export function formatDistanceText(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} metros`;
  return `${km.toFixed(1)} km`;
}
