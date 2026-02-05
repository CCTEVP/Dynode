type AnimationFn = (
  cardWidget: HTMLElement,
  dataValue: string,
  options?: {
    direction?: string;
    speed?: string;
    transition?: string;
    scale?: string;
    distance?: string;
  },
) => void;
/// <reference types="../../../types/global" />

function initializeCardWidgets() {
  console.log("Initializing CardWidgets");
  const cardWidgets = document.querySelectorAll('[id^="card-widget-"]');

  cardWidgets.forEach((cardWidget) => {
    const element = cardWidget as HTMLElement;

    // Set up MutationObserver to watch for data-value changes on this card widget
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-value"
        ) {
          const target = mutation.target as HTMLElement;
          updateCardContent(target);
        }
      });
    });

    // Start observing this card widget for attribute changes
    observer.observe(element, {
      attributes: true,
      attributeFilter: ["data-value"],
      subtree: false, // Only watch this card widget itself
    });

    // Store observer for cleanup if needed
    (element as any).dataValueObserver = observer;

    // Initial update for any existing data-value
    updateCardContent(element);
  });
}

function updateCardContent(cardWidget: HTMLElement) {
  const dataValue = cardWidget.getAttribute("data-value");

  if (dataValue !== null) {
    // Skip update if value hasn't changed
    const currentValue = cardWidget.textContent?.trim() || "";
    if (currentValue === dataValue) {
      return;
    }

    const animationType = cardWidget.getAttribute("data-animation-type");
    const animationDirection = cardWidget.getAttribute(
      "data-animation-direction",
    );
    const animationSpeed = cardWidget.getAttribute("data-animation-speed");
    const animationTransition = cardWidget.getAttribute(
      "data-animation-transition",
    );
    const animationScale = cardWidget.getAttribute("data-animation-scale");
    const animationDistance = cardWidget.getAttribute(
      "data-animation-distance",
    );

    // Make case-insensitive comparison
    const animationFunction = animationType
      ? window.widgetAnimations?.CardWidget?.[animationType] ||
        window.widgetAnimations?.CardWidget?.[animationType.toLowerCase()]
      : null;

    if (animationFunction) {
      // Pass options to all animations (they can ignore if not needed)
      (animationFunction as AnimationFn)(cardWidget, dataValue, {
        direction: animationDirection || undefined,
        speed: animationSpeed || undefined,
        transition: animationTransition || undefined,
        scale: animationScale || undefined,
        distance: animationDistance || undefined,
      });
    } else {
      cardWidget.textContent = dataValue;
    }
  }
}

if (window.widgetInitializer) {
  window.widgetInitializer.register("CardWidgets", initializeCardWidgets);
}
