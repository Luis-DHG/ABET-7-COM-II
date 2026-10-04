import assert from "node:assert/strict";
import { test } from "node:test";
import { OFDM_DEFAULTS, ofdmMetrics } from "../src/lib/ofdm.ts";

test("OFDM: unidades y valores de la configuración de referencia", () => {
  const result = ofdmMetrics(OFDM_DEFAULTS);
  assert.ok(Math.abs(result.rangeResolution - 7.49481145) < 1e-8);
  assert.ok(Math.abs(result.observationMs - 16.384) < 1e-8);
  assert.ok(Math.abs(result.rawRateMbps - 32) < 1e-8);
  assert.ok(Math.abs(result.delayUs - 0.5337025523) < 1e-8);
});

test("duplicar B mejora distancia pero empeora velocidad con N y M fijos", () => {
  const baseline = ofdmMetrics(OFDM_DEFAULTS);
  const wider = ofdmMetrics({ ...OFDM_DEFAULTS, bandwidthMHz: 40 });
  assert.equal(wider.rangeResolution, baseline.rangeResolution / 2);
  assert.equal(wider.velocityResolution, baseline.velocityResolution * 2);
  assert.equal(wider.rawRateMbps, baseline.rawRateMbps * 2);
  const longer = ofdmMetrics({ ...OFDM_DEFAULTS, symbols: 512 });
  assert.equal(longer.velocityResolution, baseline.velocityResolution / 2);
  assert.equal(longer.rawRateMbps, baseline.rawRateMbps);
});

test("todos los extremos de los controles permanecen dentro del CP y sin ambigüedad Doppler", () => {
  for (const bandwidthMHz of [10, 80]) {
    for (const symbols of [64, 512]) {
      for (const velocity of [-30, 0, 30]) {
        const result = ofdmMetrics({ bandwidthMHz, symbols, range: 200, velocity });
        assert.ok(Object.values(result).every(Number.isFinite));
        assert.ok(result.prefixRange > 200);
        assert.ok(result.unambiguousVelocity > Math.abs(velocity));
        assert.equal(Math.sign(result.dopplerHz), Math.sign(velocity));
      }
    }
  }
});
