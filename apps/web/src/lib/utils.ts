import type { KeyboardEvent } from "react";

export { cn } from "cn"

export function scrollHorizontallyWithArrowKeys(
  event: KeyboardEvent<HTMLElement>,
  target: HTMLElement,
) {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  const maximum = target.scrollWidth - target.clientWidth;
  if (maximum <= 0) return;

  const direction = event.key === "ArrowRight" ? 1 : -1;
  const next = Math.max(0, Math.min(maximum, target.scrollLeft + direction * Math.max(44, target.clientWidth * 0.75)));
  if (next === target.scrollLeft) return;

  event.preventDefault();
  target.scrollLeft = next;
}
