import type { Camera, Sigma } from "sigma";

const reducedDuration = 0.01;
const resetState = { x: 0.5, y: 0.5, ratio: 1, angle: 0 };

export function applyMapMotion(
  renderer: Pick<Sigma, "getCamera" | "setSettings">,
  normalDuration: number,
  reduced: boolean,
  originalInertiaRatio: number,
) {
  const duration = reduced ? reducedDuration : normalDuration;
  renderer.setSettings({
    zoomDuration: duration,
    doubleClickZoomingDuration: duration,
    inertiaDuration: duration,
    inertiaRatio: reduced ? 0 : originalInertiaRatio,
  });
  const camera = renderer.getCamera();
  if (reduced && camera.isAnimated()) {
    // Reemplazar la animación cancela el frame anterior mediante la API pública.
    void camera.animate(camera.getState(), { duration: reducedDuration });
  }
}

export function resetMapCamera(
  camera: Pick<Camera, "isAnimated" | "animate" | "setState" | "animatedReset">,
  normalDuration: number,
  reduced: boolean,
) {
  if (!reduced) {
    void camera.animatedReset({ duration: normalDuration });
  } else if (camera.isAnimated()) {
    void camera.animate(resetState, { duration: reducedDuration });
  } else {
    camera.setState(resetState);
  }
}
