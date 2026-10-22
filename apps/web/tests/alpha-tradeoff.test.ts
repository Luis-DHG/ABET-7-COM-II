import assert from "node:assert/strict";
import { test } from "node:test";
import { ALPHA_MODEL, alphaMetrics, alphaModelFacts, tradeoffCurve } from "../src/lib/alphaTradeoff.ts";

const close = (actual: number, expected: number, tolerance: number) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} no está dentro de ${tolerance} de ${expected}`);

test("α conserva potencia y las cifras de comunicación coinciden con el presupuesto independiente en dB", () => {
  for (const user of ["near", "far"] as const) {
    const result = alphaMetrics(0.5, user, "pedestrian");
    close(result.communicationPowerW + result.sensingPowerW, ALPHA_MODEL.totalPowerW, 1e-12);
    const wavelength = ALPHA_MODEL.lightSpeed / ALPHA_MODEL.carrierHz;
    const pathLossDb = ALPHA_MODEL.nodeGainDbi + ALPHA_MODEL.deviceGainDbi
      + 20 * Math.log10(wavelength / (4 * Math.PI * ALPHA_MODEL.users[user].distanceM));
    const noiseDbm = 10 * Math.log10(ALPHA_MODEL.boltzmann * ALPHA_MODEL.temperatureK
      * ALPHA_MODEL.bandwidthHz * 10 ** (ALPHA_MODEL.noiseFigureDb / 10) * 1000);
    const expectedSnrDb = pathLossDb + 10 * Math.log10(0.5 * 1000) - noiseDbm;
    const expectedRate = ALPHA_MODEL.bandwidthHz / 1e6 * Math.log2(1 + 10 ** (expectedSnrDb / 10));
    close(result.communicationSnrDb, expectedSnrDb, 0.001);
    close(result.dataRateMbps, expectedRate, 0.001);
  }
  close(alphaMetrics(0.5, "near", "pedestrian").communicationSnrDb, 52.1, 0.1);
  close(alphaMetrics(0.5, "near", "pedestrian").dataRateMbps, 346, 2);
  close(alphaMetrics(0.5, "far", "pedestrian").communicationSnrDb, 28.6, 0.1);
  close(alphaMetrics(0.5, "far", "pedestrian").dataRateMbps, 190, 2);
});

test("la tasa crece y el radar disminuye al aumentar α; la ley (1−α) se cumple", () => {
  for (const object of ["pedestrian", "car"] as const) {
    for (const user of ["near", "far"] as const) {
      const low = alphaMetrics(0.1, user, object);
      const mid = alphaMetrics(0.5, user, object);
      const high = alphaMetrics(0.9, user, object);
      assert.ok(low.dataRateMbps < mid.dataRateMbps && mid.dataRateMbps < high.dataRateMbps);
      assert.ok(low.radarSnrDb > mid.radarSnrDb && mid.radarSnrDb > high.radarSnrDb);
      close(high.radarSnrDb - mid.radarSnrDb, 10 * Math.log10(0.1 / 0.5), 1e-10);
    }
  }
});

test("referencias radar, sensibilidad de usuario, resolución y extremos son finitos", () => {
  for (const [alpha, expected] of [[0.1, 27.7], [0.5, 25.1], [0.9, 18.1], [0.99, 8.1]] as const) {
    close(alphaMetrics(alpha, "near", "pedestrian").radarSnrDb, expected, 0.1);
  }
  for (const [alpha, expected] of [[0.1, 13.6], [0.5, 11.1], [0.9, 4.1], [0.99, -5.9]] as const) {
    close(alphaMetrics(alpha, "near", "car").radarSnrDb, expected, 0.1);
  }
  const nearGain = alphaMetrics(0.9, "near", "pedestrian").dataRateMbps / alphaMetrics(0.5, "near", "pedestrian").dataRateMbps;
  const farGain = alphaMetrics(0.9, "far", "pedestrian").dataRateMbps / alphaMetrics(0.5, "far", "pedestrian").dataRateMbps;
  assert.ok(farGain > nearGain);
  close((nearGain - 1) * 100, 4.9, 0.1);
  close((farGain - 1) * 100, 8.9, 0.1);
  assert.ok(alphaMetrics(0.5, "near", "pedestrian").communicationSnrDb > alphaMetrics(0.5, "far", "pedestrian").communicationSnrDb);
  assert.ok(alphaMetrics(0.5, "near", "pedestrian").radarSnrDb > alphaMetrics(0.5, "near", "car").radarSnrDb);
  close(alphaMetrics(0.5, "near", "pedestrian").rangeResolutionM, 7.49481145, 1e-7);
  for (const alpha of [0.01, 0.99]) assert.ok(Object.values(alphaMetrics(alpha, "far", "car")).every(Number.isFinite));
  const curve = tradeoffCurve("near", "pedestrian");
  assert.equal(curve.length, 99);
  assert.equal(curve[0].alpha, 0.01);
  assert.equal(curve.at(-1)?.alpha, 0.99);
  assert.ok(curve.every((point, index) => index === 0 || (
    point.dataRateMbps > curve[index - 1].dataRateMbps && point.radarSnrDb < curve[index - 1].radarSnrDb
  )));
});

test("la ficha técnica conserva los supuestos fijados en el modelo α", () => {
  const facts = alphaModelFacts();
  assert.equal(facts.carrierGHz, 5.9);
  assert.equal(facts.bandwidthMHz, 20);
  assert.equal(facts.totalPowerW, 1);
  assert.equal(facts.totalPowerDbm, 30);
  assert.equal(facts.nodeGainDbi, 15);
  assert.equal(facts.deviceGainDbi, 3);
  assert.equal(facts.noiseFigureDb, 6);
  close(facts.rangeResolutionM, 7.49481145, 1e-7);
  close(alphaMetrics(-1, "near", "pedestrian").alpha, 0.01, 0);
  close(alphaMetrics(2, "near", "pedestrian").alpha, 0.99, 0);
});
