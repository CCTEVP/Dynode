window.creativeTicker = window.creativeTicker || {
  interval: null,
  tickRate: 10, // 10ms tick rate
  lastTick: Date.now(),
  subscribers: new Map(),

  start() {
    if (this.interval) return;
    this.lastTick = Date.now();
    this.interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - this.lastTick;
      this.lastTick = now;

      // Call all subscribers with elapsed time
      this.subscribers.forEach((sub) => {
        sub.elapsed += elapsed;
        if (sub.elapsed >= sub.updateRate) {
          sub.callback();
          sub.elapsed = 0;
        }
      });
    }, this.tickRate);
  },

  subscribe(id, callback, updateRate) {
    this.subscribers.set(id, {
      callback,
      updateRate,
      elapsed: 0,
    });

    // Start ticker if it's not running
    this.start();
    return () => this.subscribers.delete(id);
  },
};

window.widgetInitializer = {
  // Store widget render functions
  renderFunctions: {},

  // Register a widget render function
  register: function (widgetName, renderFunction) {
    this.renderFunctions[widgetName] = renderFunction;
  },

  // Initialize all registered widgets in sequence
  initializeAll: function () {
    console.log("Rendering widgets:");

    // Define the initialization order
    const initOrder = [
      // Base layouts first
      "SlideLayouts",
      "BoxLayouts",
      // Then widgets
      "CardWidgets",
      "TextWidgets",
      "CountdownWidgets",
      // Add other widgets as needed
    ];

    // Initialize in order
    initOrder.forEach((widgetName) => {
      if (this.renderFunctions[widgetName]) {
        console.log(`Rendering ${widgetName}`);
        try {
          this.renderFunctions[widgetName]();
        } catch (error) {
          console.error(`Error initializing ${widgetName}:`, error);
        }
      }
    });

    // Initialize any remaining widgets not in the predefined order
    Object.keys(this.renderFunctions).forEach((widgetName) => {
      if (!initOrder.includes(widgetName)) {
        console.log(`Rendering ${widgetName}`);
        try {
          this.renderFunctions[widgetName]();
        } catch (error) {
          console.error(`Error initializing ${widgetName}:`, error);
        }
      }
    });
  },
};

// Initialize all widgets when the document is ready
document.addEventListener("DOMContentLoaded", function () {
  if (
    window.widgetInitializer &&
    typeof window.widgetInitializer.initializeAll === "function"
  ) {
    window.widgetInitializer.initializeAll();
  } else {
    console.error("widgetInitializer is not defined or missing initializeAll");
  }
});
