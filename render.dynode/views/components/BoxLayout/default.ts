/// <reference types="../../../types/global" />

function initializeBoxLayouts() {
  console.log("Initializing BoxLayouts");
  const boxLayouts = document.querySelectorAll('[id^="box-layout-"]');

  boxLayouts.forEach((boxLayout) => {
    const element = boxLayout as HTMLElement;

    // Set up MutationObserver to watch for data-value changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-value"
        ) {
          const target = mutation.target as HTMLElement;
          handleDataValueChange(target);
        }
      });
    });

    // Start observing the box layout itself for attribute changes
    observer.observe(element, {
      attributes: true,
      attributeFilter: ["data-value"],
      subtree: false, // Only watch the box layout itself, not children
    });

    // Store observer for cleanup if needed
    (element as any).dataValueObserver = observer;

    // Initial update for any existing data-value
    updateCardWidgetChildren(element);
  });
}

function handleDataValueChange(element: HTMLElement) {
  // The element with the changed data-value is the box layout itself
  updateCardWidgetChildren(element);
}

function updateCardWidgetChildren(boxLayout: HTMLElement) {
  // Get the data-value from the box layout itself
  const dataValue = boxLayout.getAttribute("data-value");

  if (dataValue !== null) {
    // Find text widgets within this box layout
    const cardWidgets = boxLayout.querySelectorAll('[id^="card-widget-"]');

    cardWidgets.forEach((cardWidget) => {
      // Update the card widget's innercard with the data-value
      cardWidget.setAttribute("data-value", dataValue);
    });
  }
}

if (window.widgetInitializer) {
  window.widgetInitializer.register("BoxLayouts", initializeBoxLayouts);
}
