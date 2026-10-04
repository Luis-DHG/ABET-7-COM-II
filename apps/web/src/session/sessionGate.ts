export function createSessionGate() {
  let generation = 0;
  return {
    async run<T>(load: () => Promise<T>) {
      const current = ++generation;
      const value = await load();
      return { applied: current === generation, value };
    },
    notifyExternalUpdate(_value?: unknown) {
      generation++;
    },
  };
}
