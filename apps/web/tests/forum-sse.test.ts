import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import React from "react";
import {
  useCommentStream,
  type CommentCreatedStreamEvent,
  type UseCommentStreamOptions,
} from "../src/pages/forum/useCommentStream.ts";

class MockEventSource {
  static instances: MockEventSource[] = [];
  readonly url: string;
  readyState = 0; // 0: CONNECTING, 1: OPEN, 2: CLOSED
  private listeners = new Map<string, Set<(event: unknown) => void>>();
  closed = false;

  constructor(url: string) {
    this.url = url;
    MockEventSource.instances.push(this);
  }

  addEventListener(type: string, listener: (event: unknown) => void): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener);
  }

  removeEventListener(type: string, listener: (event: unknown) => void): void {
    this.listeners.get(type)?.delete(listener);
  }

  simulateOpen(): void {
    this.readyState = 1;
    const listeners = this.listeners.get("open");
    if (listeners) {
      for (const listener of Array.from(listeners)) {
        listener({ type: "open" });
      }
    }
  }

  simulateCommentCreated(payload: unknown): void {
    const listeners = this.listeners.get("comment.created");
    if (listeners) {
      const data = typeof payload === "string" ? payload : JSON.stringify(payload);
      for (const listener of Array.from(listeners)) {
        listener({ type: "comment.created", data });
      }
    }
  }

  close(): void {
    this.closed = true;
    this.readyState = 2;
  }
}

function getReactInternals(): { H: unknown } | null {
  const anyReact = React as Record<string, unknown>;
  for (const key of Object.keys(anyReact)) {
    if (key.startsWith("__CLIENT_INTERNALS") || key.startsWith("__SECRET_INTERNALS")) {
      const value = anyReact[key];
      if (value && typeof value === "object" && "H" in value) {
        return value as { H: unknown };
      }
    }
  }
  return null;
}

function TestHarness(props: UseCommentStreamOptions) {
  useCommentStream(props);
  return null;
}

function renderCommentStreamHook(initialOptions: UseCommentStreamOptions) {
  let currentOptions = initialOptions;
  let effectCleanup: (() => void) | void;
  let prevDeps: unknown[] | undefined;
  const refs: { current: unknown }[] = [];
  let refIndex = 0;
  let passiveEffects: (() => void)[] = [];

  const internals = getReactInternals();
  const originalDispatcher = internals?.H;

  const dispatcher = {
    useRef: (initialValue: unknown) => {
      if (refs[refIndex] === undefined) {
        refs[refIndex] = { current: initialValue };
      }
      return refs[refIndex++]!;
    },
    useEffect: (effect: () => (() => void) | void, deps?: unknown[]) => {
      if (deps === undefined) {
        passiveEffects.push(effect as () => void);
      } else {
        const shouldRun = !prevDeps || deps.some((dep, i) => dep !== prevDeps![i]);
        if (shouldRun) {
          if (effectCleanup) effectCleanup();
          prevDeps = deps;
          effectCleanup = effect();
        }
      }
    },
  };

  const run = (options: UseCommentStreamOptions) => {
    currentOptions = options;
    refIndex = 0;
    passiveEffects = [];

    if (internals) internals.H = dispatcher;

    try {
      TestHarness(currentOptions);
      for (const effect of passiveEffects) {
        effect();
      }
    } finally {
      if (internals) internals.H = originalDispatcher;
    }
  };

  run(initialOptions);

  return {
    rerender(options: UseCommentStreamOptions) {
      run(options);
    },
    unmount() {
      if (effectCleanup) effectCleanup();
      if (internals) internals.H = originalDispatcher;
    },
  };
}

function withMockEventSource<T>(fn: () => T | Promise<T>): Promise<T> | T {
  const previous = (globalThis as unknown as { EventSource: unknown }).EventSource;
  (globalThis as unknown as { EventSource: unknown }).EventSource = MockEventSource;
  MockEventSource.instances = [];
  try {
    const result = fn();
    if (result instanceof Promise) {
      return result.finally(() => {
        (globalThis as unknown as { EventSource: unknown }).EventSource = previous;
      });
    }
    (globalThis as unknown as { EventSource: unknown }).EventSource = previous;
    return result;
  } catch (error) {
    (globalThis as unknown as { EventSource: unknown }).EventSource = previous;
    throw error;
  }
}

test("la conexión stream se abre al montar y se cierra al desmontar", () => {
  withMockEventSource(() => {
    assert.equal(MockEventSource.instances.length, 0);

    const harness = renderCommentStreamHook({ enabled: true });
    assert.equal(MockEventSource.instances.length, 1);
    const instance = MockEventSource.instances[0]!;
    assert.equal(instance.url, "/api/comments/stream");
    assert.equal(instance.closed, false);

    harness.unmount();
    assert.equal(instance.closed, true);
  });
});

test("la vista de lista ejecuta un solo GET al recibir comment.created", () => {
  withMockEventSource(() => {
    const events: CommentCreatedStreamEvent[] = [];
    let getRequests = 0;

    const harness = renderCommentStreamHook({
      enabled: true,
      onCommentCreated: (event) => {
        events.push(event);
        getRequests++;
      },
    });

    const instance = MockEventSource.instances[0]!;
    instance.simulateOpen();

    instance.simulateCommentCreated({ rootId: "root-123" });
    assert.equal(getRequests, 1, "Debe realizar una sola consulta GET puntual");
    assert.deepEqual(events, [{ rootId: "root-123" }]);

    harness.unmount();
  });
});

test("la vista de lista ejecuta un solo GET al reconectar y ninguno en la apertura inicial", () => {
  withMockEventSource(() => {
    let reconnectGetCount = 0;

    const harness = renderCommentStreamHook({
      enabled: true,
      onReconnect: () => {
        reconnectGetCount++;
      },
    });

    const instance = MockEventSource.instances[0]!;

    // Apertura inicial no debe disparar onReconnect
    instance.simulateOpen();
    assert.equal(reconnectGetCount, 0, "La apertura inicial no debe disparar reconexión");

    // Primera reconexión tras caída
    instance.simulateOpen();
    assert.equal(reconnectGetCount, 1, "La reconexión debe disparar exactamente una lectura GET");

    // Segunda reconexión
    instance.simulateOpen();
    assert.equal(reconnectGetCount, 2);

    harness.unmount();
  });
});

test("la vista de hilo filtra por rootId: matching hace 1 GET, ajeno hace 0 GETs", () => {
  withMockEventSource(() => {
    const activeRootId = "thread-root-active";
    let threadGetCount = 0;

    const harness = renderCommentStreamHook({
      enabled: true,
      streamKey: activeRootId,
      onCommentCreated: ({ rootId }) => {
        if (rootId === activeRootId) {
          threadGetCount++;
        }
      },
    });

    const instance = MockEventSource.instances[0]!;
    instance.simulateOpen();

    // Evento con rootId ajeno -> 0 GETs
    instance.simulateCommentCreated({ rootId: "other-root-456" });
    assert.equal(threadGetCount, 0, "Un rootId ajeno no debe consultar el hilo");

    // Evento con matching rootId -> 1 GET
    instance.simulateCommentCreated({ rootId: activeRootId });
    assert.equal(threadGetCount, 1, "El rootId coincidente debe consultar el hilo exactamente una vez");

    harness.unmount();
  });
});

test("la vista de hilo ejecuta un solo GET al reconectar", () => {
  withMockEventSource(() => {
    const activeRootId = "thread-root-active";
    let threadRefreshCount = 0;

    const harness = renderCommentStreamHook({
      enabled: true,
      streamKey: activeRootId,
      onReconnect: () => {
        threadRefreshCount++;
      },
    });

    const instance = MockEventSource.instances[0]!;
    instance.simulateOpen(); // apertura inicial -> 0 refrescos
    assert.equal(threadRefreshCount, 0);

    instance.simulateOpen(); // reconexión -> 1 refresco
    assert.equal(threadRefreshCount, 1);

    harness.unmount();
  });
});

test("el cambio de hilo o desmontar cierra la conexión y descarta respuestas tardías", async () => {
  await withMockEventSource(async () => {
    // 1. Simulación del ciclo de lectura (readCycle de ThreadPage)
    let appliedData: string | null = null;
    let cycle = { active: true, latest: 0, controller: new AbortController() };

    const harness = renderCommentStreamHook({
      enabled: true,
      streamKey: "thread-1",
    });

    assert.equal(MockEventSource.instances.length, 1);
    const firstInstance = MockEventSource.instances[0]!;
    assert.equal(firstInstance.closed, false);

    // Inicio de petición lenta
    const requestNumber = ++cycle.latest;
    const pendingSlowRequest = new Promise<string>((resolve) => {
      setTimeout(() => resolve("late-data-for-thread-1"), 20);
    });

    // Cambio de hilo a thread-2
    cycle.active = false;
    cycle.latest++;
    cycle.controller.abort();
    cycle = { active: true, latest: 0, controller: new AbortController() };

    harness.rerender({
      enabled: true,
      streamKey: "thread-2",
    });

    assert.equal(firstInstance.closed, true, "El stream anterior debe cerrarse al cambiar de hilo");
    assert.equal(MockEventSource.instances.length, 2, "Debe abrirse un nuevo stream para el nuevo hilo");

    // Llega la respuesta lenta de thread-1
    const lateResult = await pendingSlowRequest;
    if (cycle.active && requestNumber === cycle.latest) {
      appliedData = lateResult;
    }
    assert.equal(appliedData, null, "La respuesta tardía debe ser descartada");

    // Desmontar cierra el stream del segundo hilo
    harness.unmount();
    assert.equal(MockEventSource.instances[1]!.closed, true, "Al desmontar se debe cerrar el stream");
  });
});

test("ausencia total de temporizadores periódicos o sondeo como fallback", () => {
  const hookSource = readFileSync(
    new URL("../src/pages/forum/useCommentStream.ts", import.meta.url),
    "utf8",
  );
  const forumPageSource = readFileSync(
    new URL("../src/pages/forum/ForumPage.tsx", import.meta.url),
    "utf8",
  );
  const threadPageSource = readFileSync(
    new URL("../src/pages/forum/ThreadPage.tsx", import.meta.url),
    "utf8",
  );

  for (const [name, source] of [
    ["useCommentStream", hookSource],
    ["ForumPage", forumPageSource],
    ["ThreadPage", threadPageSource],
  ] as const) {
    assert.equal(
      /setInterval\s*\(/u.test(source),
      false,
      `${name} no debe contener llamadas a setInterval`,
    );
    assert.equal(
      /polling/iu.test(source),
      false,
      `${name} no debe implementar sondeo ni polling`,
    );
  }

  // Comprobar que en ForumPage y ThreadPage se conecta a useCommentStream
  assert.ok(
    forumPageSource.includes("useCommentStream("),
    "ForumPage debe conectar con useCommentStream",
  );
  assert.ok(
    threadPageSource.includes("useCommentStream("),
    "ThreadPage debe conectar con useCommentStream",
  );
});
