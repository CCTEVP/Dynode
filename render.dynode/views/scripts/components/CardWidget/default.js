"use strict";
/// <reference types="../../../types/global" />
function initializeCardWidgets() {
    console.log("Initializing CardWidgets");
    const cardWidgets = document.querySelectorAll('[id^="card-widget-"]');
    cardWidgets.forEach((cardWidget) => {
        const element = cardWidget;
        // Set up MutationObserver to watch for data-value changes on this card widget
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === "attributes" &&
                    mutation.attributeName === "data-value") {
                    const target = mutation.target;
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
        element.dataValueObserver = observer;
        // Initial update for any existing data-value
        updateCardContent(element);
    });
}
function updateCardContent(cardWidget) {
    const dataValue = cardWidget.getAttribute("data-value");
    if (dataValue !== null) {
        const animationType = cardWidget.getAttribute("data-animation");
        // Make case-insensitive comparison
        const animationFunction = animationType
            ? window.widgetAnimations?.CardWidget?.[animationType] ||
                window.widgetAnimations?.CardWidget?.[animationType.toLowerCase()]
            : null;
        if (animationFunction) {
            animationFunction(cardWidget, dataValue);
        }
        else {
            cardWidget.textContent = dataValue;
        }
    }
}
if (window.widgetInitializer) {
    window.widgetInitializer.register("CardWidgets", initializeCardWidgets);
}
