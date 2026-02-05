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

    // Ticker will be started manually via BroadSignPlay() function
    return () => this.subscribers.delete(id);
  },
};

// BroadSignPlay function to start the creative ticker
function BroadSignPlay() {
  console.log("BroadSignPlay() called - Starting creative ticker");
  if (window.creativeTicker) {
    window.creativeTicker.start();

    // Start all widget updates
    startAllWidgetUpdates();
  } else {
    console.error("creativeTicker is not available");
  }
}

// Make function globally available immediately
window.BroadSignPlay = BroadSignPlay;
globalThis.BroadSignPlay = BroadSignPlay;

// Function to start all widget update subscriptions
function startAllWidgetUpdates() {
  console.log("Starting widget update subscriptions");

  // Only target elements with the ticker-widget data attribute
  document.querySelectorAll("[data-ticker-widget]").forEach((element) => {
    // Look for any function that starts with "start" and ends with "Updates"
    Object.getOwnPropertyNames(element).forEach((prop) => {
      if (
        prop.startsWith("start") &&
        prop.endsWith("Updates") &&
        typeof (element as any)[prop] === "function"
      ) {
        console.log(`Starting updates for ${element.id} (${prop})`);
        (element as any)[prop]();
      }
    });
  });
}

// Check for autoplay - URL parameter supersedes all other settings
function shouldAutoplay() {
  // URL parameter always takes priority
  const urlParams = new URLSearchParams(window.location.search);
  const urlAutoplay = urlParams.get("autoplay");
  if (urlAutoplay === "true") return true;
  if (urlAutoplay === "false") return false;

  // Fall back to server-injected autoplay setting (set by template)
  return (window as any).creativeAutoplay === true;
}

window.widgetInitializer = {
  // Store widget render functions
  renderFunctions: {},

  // Register a widget render function
  register: function (widgetName, renderFunction) {
    this.renderFunctions[widgetName] = renderFunction;
  },

  // Initialize all registered widgets in sequence
  initializeAll: function () {
    console.log("Initializing widgets:");

    // Define the initialization order
    const initOrder = [
      // Base layouts first
      "SlideLayouts",
      "BoxLayouts",
      // Then widgets
      "CardWidgets",
      "TextWidgets",
      "ClockWidgets",
      "CountdownWidgets",
      // Add other widgets as needed
    ];

    // Initialize in order
    initOrder.forEach((widgetName) => {
      if (this.renderFunctions[widgetName]) {
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
        console.log(`Initializing ${widgetName}`);
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

    // Only start ticker automatically if autoplay=true
    if (shouldAutoplay()) {
      console.log("Autoplay enabled - Starting ticker automatically");
      if (window.creativeTicker) {
        window.creativeTicker.start();
        startAllWidgetUpdates();
      }
    } else {
      console.log(
        "Autoplay disabled - Ticker paused. Call BroadSignPlay() to start."
      );
    }
  } else {
    console.error("widgetInitializer is not defined or missing initializeAll");
  }
});
