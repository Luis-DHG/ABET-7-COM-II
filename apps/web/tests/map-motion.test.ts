import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";

type State = { x: number; y: number; ratio: number; angle: number };
type Settings = { zoomDuration: number; doubleClickZoomingDuration: number; inertiaDuration: number; inertiaRatio: number };
type Call = { method: string; state?: State; duration?: number };
const resetTarget: State = { x: 0.5, y: 0.5, ratio: 1, angle: 0 };

function cameraDouble(active = false) {
  let state: State = { x: 0.2, y: 0.7, ratio: 1.8, angle: 0.3 };
  const calls: Call[] = [];
  const camera = {
    isAnimated: () => active,
    getState: () => ({ ...state }),
    setState(target: State) { calls.push({ method: "setState", state: { ...target } }); state = { ...target }; },
    animate(target: State, options: { duration: number }) {
      calls.push({ method: "animate", state: { ...target }, duration: options.duration });
      state = { ...target }; active = false;
      return Promise.resolve();
    },
    animatedReset(options: { duration: number }) {
      calls.push({ method: "animatedReset", duration: options.duration });
      state = { ...resetTarget }; active = false;
      return Promise.resolve();
    },
  };
  return { camera, calls };
}

test("la política pública de cámara conserva reset y resuelve reduce en curso sin duración cero", async () => {
  const url = new URL("../src/lib/mapMotion.ts", import.meta.url);
  assert.ok(existsSync(url), "Falta src/lib/mapMotion.ts: debe ofrecer applyMapMotion y resetMapCamera");
  const { applyMapMotion, resetMapCamera } = await import(url.href);
  assert.equal(typeof applyMapMotion, "function", "Debe exportarse applyMapMotion");
  assert.equal(typeof resetMapCamera, "function", "Debe exportarse resetMapCamera");

  const normalDuration = 160; // Valor normal obtenido por el caller desde CSS.
  const originalInertiaRatio = 3;
  const running = cameraDouble(true);
  const originalState = running.camera.getState();
  let settings: Settings;
  const renderer = { setSettings(next: Settings) { settings = { ...next }; }, getCamera: () => running.camera };
  const normal = { zoomDuration: 160, doubleClickZoomingDuration: 160, inertiaDuration: 160, inertiaRatio: 3 };
  applyMapMotion(renderer, normalDuration, false, originalInertiaRatio);
  assert.deepEqual(settings!, normal);
  assert.deepEqual(running.calls, []);

  applyMapMotion(renderer, normalDuration, true, originalInertiaRatio);
  assert.equal(settings!.inertiaRatio, 0);
  for (const value of [settings!.zoomDuration, settings!.doubleClickZoomingDuration, settings!.inertiaDuration]) {
    assert.ok(Number.isFinite(value) && value > 0 && value <= 1, "Reduce debe usar duraciones finitas, positivas y <=1 ms");
  }
  assert.equal(running.calls.length, 1);
  assert.equal(running.calls[0].method, "animate", "setState aislado no resuelve una animación pendiente");
  assert.deepEqual(running.calls[0].state, originalState);
  assert.ok(Number.isFinite(running.calls[0].duration) && running.calls[0].duration! > 0 && running.calls[0].duration! <= 1);
  assert.deepEqual(running.camera.getState(), originalState);
  applyMapMotion(renderer, normalDuration, false, originalInertiaRatio);
  assert.deepEqual(settings!, normal, "Volver a normal restaura la inercia original, no la reducida");
  assert.equal(running.calls.length, 1);

  const normalReset = cameraDouble();
  resetMapCamera(normalReset.camera, normalDuration, false);
  assert.deepEqual(normalReset.calls, [{ method: "animatedReset", duration: 160 }]);
  assert.deepEqual(normalReset.camera.getState(), resetTarget);

  const idleReducedReset = cameraDouble();
  resetMapCamera(idleReducedReset.camera, normalDuration, true);
  assert.deepEqual(idleReducedReset.calls, [{ method: "setState", state: resetTarget }]);
  assert.deepEqual(idleReducedReset.camera.getState(), resetTarget);

  const activeReducedReset = cameraDouble(true);
  resetMapCamera(activeReducedReset.camera, normalDuration, true);
  assert.equal(activeReducedReset.calls.length, 1);
  const call = activeReducedReset.calls[0];
  assert.equal(call.method, "animate");
  assert.deepEqual(call.state, resetTarget);
  assert.ok(Number.isFinite(call.duration) && call.duration! > 0 && call.duration! <= 1);
  assert.ok(Object.values(call.state!).every(Number.isFinite));
  assert.deepEqual(activeReducedReset.camera.getState(), resetTarget);
});
