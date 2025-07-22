// Add this at the top of your file or in a global .d.ts file

declare global {
  interface Window {
    creativeTicker?: {
      interval: ReturnType<typeof setInterval> | null;
      tickRate: number;
      lastTick: number;
      subscribers: Map<
        string,
        {
          callback: () => void;
          updateRate: number;
          elapsed: number;
        }
      >;
      start: () => void;
      subscribe: (
        id: string,
        callback: () => void,
        updateRate: number
      ) => () => void;
    };

    widgetInitializer?: {
      renderFunctions: Record<string, () => void>;
      register: (widgetName: string, renderFunction: () => void) => void;
      initializeAll: () => void;
    };
  }
}
export {};
