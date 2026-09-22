import assert from "node:assert/strict";
import test from "node:test";
import { AppError } from "./errors.js";
import { decodeCursor, encodeCursor } from "./cursor.js";

test("el cursor conserva fecha e identificador", () => {
  const original = { createdAt: new Date("2026-09-21T12:00:00.000Z"), id: "76c1a339-174c-4f11-8122-246f56f0c4f7" };
  assert.deepEqual(decodeCursor(encodeCursor(original)), original);
});

test("rechaza cursores manipulados", () => {
  assert.throws(() => decodeCursor("not-a-cursor"), (error) => error instanceof AppError && error.code === "INVALID_CURSOR");
});
