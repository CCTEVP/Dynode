"use strict";
/// <reference types="../../../types/global" />
console.log("Card Widget Roll Animation library loaded");
// Initialize the global widgetAnimations object
window.widgetAnimations = window.widgetAnimations || {};
window.widgetAnimations.CardWidget = window.widgetAnimations.CardWidget || {};
// Register the roll animation function for CardWidget
window.widgetAnimations.CardWidget.Roll = function (cardWidget, dataValue) {
    // Check if animation is already running
    if (cardWidget.isAnimating) {
        return;
    }
    // Get current value before clearing
    const currentValue = cardWidget.textContent?.trim() || "0";
    // Don't animate if the value hasn't changed
    if (currentValue === dataValue) {
        return;
    }
    // Mark as animating
    cardWidget.isAnimating = true;
    // Store original styles to restore consistency
    const originalDisplay = cardWidget.style.display;
    const originalAlignItems = cardWidget.style.alignItems;
    const originalJustifyContent = cardWidget.style.justifyContent;
    // Create animation container
    const animationContainer = document.createElement("div");
    animationContainer.className = "card-roll-container";
    // Create current number element (will move up)
    const currentElement = document.createElement("div");
    currentElement.className = "card-roll-current";
    currentElement.textContent = currentValue;
    // Create new number element (will come from below)
    const newElement = document.createElement("div");
    newElement.className = "card-roll-new";
    newElement.textContent = dataValue;
    // Clear the card widget completely and add animation elements
    cardWidget.innerHTML = "";
    cardWidget.textContent = "";
    animationContainer.appendChild(currentElement);
    animationContainer.appendChild(newElement);
    cardWidget.appendChild(animationContainer);
    // Force a reflow to ensure elements are rendered in initial state
    void cardWidget.offsetHeight;
    // Add animation class to trigger CSS animation
    requestAnimationFrame(() => {
        cardWidget.classList.add("card-roll-animation");
    });
    // Clean up and ensure consistent styling
    setTimeout(() => {
        // Clear everything
        cardWidget.classList.remove("card-roll-animation");
        cardWidget.innerHTML = "";
        // Apply the same flex styling as the animation to maintain consistent positioning
        cardWidget.style.display = "flex";
        cardWidget.style.alignItems = "center";
        cardWidget.style.justifyContent = "center";
        // Set final value
        cardWidget.textContent = dataValue;
        // Mark animation as complete
        cardWidget.isAnimating = false;
    }, 500);
};
// Keep the fade animation as is
window.widgetAnimations.CardWidget.fade = function (cardWidget, dataValue) {
    cardWidget.style.transition = "opacity 0.3s ease";
    cardWidget.style.opacity = "0";
    setTimeout(() => {
        cardWidget.textContent = dataValue;
        cardWidget.style.opacity = "1";
    }, 150);
};
