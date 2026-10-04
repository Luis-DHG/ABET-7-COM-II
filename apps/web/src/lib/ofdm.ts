// Modelo analítico ideal monostático, no una simulación de canal ni una medición.
// B = N·Δf, CP = Tu/4; símbolos conocidos, sin interferencia entre subportadoras.
export const OFDM_DEFAULTS = { bandwidthMHz: 20, symbols: 256, range: 80, velocity: 15 };

export function ofdmMetrics({ bandwidthMHz, symbols, range, velocity }: typeof OFDM_DEFAULTS) {
  const c = 299_792_458;
  const carrier = 5.9e9;
  const subcarriers = 1024;
  const bandwidth = bandwidthMHz * 1e6;
  const spacing = bandwidth / subcarriers;
  const usefulTime = 1 / spacing;
  const prefixTime = usefulTime / 4;
  const symbolTime = usefulTime + prefixTime;
  const observationTime = symbols * symbolTime;
  return {
    rangeResolution: c / (2 * bandwidth),
    velocityResolution: c / (2 * carrier * observationTime),
    observationMs: observationTime * 1e3,
    delayUs: 2 * range / c * 1e6,
    dopplerHz: 2 * velocity * carrier / c,
    rawRateMbps: 2 * subcarriers / symbolTime / 1e6,
    prefixRange: c * prefixTime / 2,
    unambiguousVelocity: c / (4 * carrier * symbolTime),
    spacingKHz: spacing / 1e3,
  };
}
