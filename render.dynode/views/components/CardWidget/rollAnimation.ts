const ROLL_DEFAULTS = {
  direction: "Y",
  speed: "0.5s",
  transition: "cubic-bezier(0.4, 0, 0.2, 1)",
};
/// <reference types="../../../types/global" />

console.log("Card Widget Roll Animation library loaded");

// Initialize the global widgetAnimations object
window.widgetAnimations = window.widgetAnimations || {};
window.widgetAnimations.CardWidget = window.widgetAnimations.CardWidget || {};

// Register the roll animation function for CardWidget

window.widgetAnimations.CardWidget.Roll = function (
  cardWidget: HTMLElement,
  dataValue: string,
  options?: {
    direction?: string;
    speed?: string;
    transition?: string;
  }
) {
  // Check if animation is already running
  if ((cardWidget as any).isAnimating) {
    return;
  }

  // Get current value before clearing
  const currentValue = cardWidget.textContent?.trim() || "0";

  // Don't animate if the value hasn't changed
  if (currentValue === dataValue) {
    return;
  }

  // Mark as animating
  (cardWidget as any).isAnimating = true;

  // Store original styles to restore consistency
  const originalDisplay = cardWidget.style.display;
  const originalAlignItems = cardWidget.style.alignItems;
  const originalJustifyContent = cardWidget.style.justifyContent;

  // Create animation container
  const animationContainer = document.createElement("div");
  animationContainer.className = "card-roll-container";

  // Create current number element (will move)
  const currentElement = document.createElement("div");
  currentElement.className = "card-roll-current";
  currentElement.textContent = currentValue;

  // Create new number element (will come in)
  const newElement = document.createElement("div");
  newElement.className = "card-roll-new";
  newElement.textContent = dataValue;

  // Clear the card widget completely and add animation elements
  cardWidget.innerHTML = "";
  cardWidget.textContent = "";

  animationContainer.appendChild(currentElement);
  animationContainer.appendChild(newElement);
  cardWidget.appendChild(animationContainer);

  // Set CSS variables for direction, speed, and transition
  // Defaults: direction = 'Y', speed = '0.5s', transition = 'cubic-bezier(0.4, 0, 0.2, 1)'
  const direction = (
    options?.direction ||
    cardWidget.getAttribute("data-animation-direction") ||
    ROLL_DEFAULTS.direction
  ).toUpperCase();
  const speed =
    options?.speed ||
    cardWidget.getAttribute("data-animation-speed") ||
    ROLL_DEFAULTS.speed;
  const transition =
    options?.transition ||
    cardWidget.getAttribute("data-animation-transition") ||
    ROLL_DEFAULTS.transition;

  // Set transform variables based on direction (Z directions removed)
  let currentAnim, newTransform, newAnim;
  switch (direction) {
    case "-Y":
      currentAnim = "translateY(100%)";
      newTransform = "translateY(-100%)";
      newAnim = "translateY(0)";
      break;
    case "X":
      currentAnim = "translateX(-100%)";
      newTransform = "translateX(100%)";
      newAnim = "translateX(0)";
      break;
    case "-X":
      currentAnim = "translateX(100%)";
      newTransform = "translateX(-100%)";
      newAnim = "translateX(0)";
      break;
    case "Y":
    default:
      currentAnim = "translateY(-100%)";
      newTransform = "translateY(100%)";
      newAnim = "translateY(0)";
      break;
  }

  cardWidget.style.setProperty("--card-roll-direction", direction);
  cardWidget.style.setProperty("--card-roll-speed", speed);
  cardWidget.style.setProperty("--card-roll-transition", transition);
  cardWidget.style.setProperty("--card-roll-current-anim", currentAnim);
  cardWidget.style.setProperty("--card-roll-new-transform", newTransform);
  cardWidget.style.setProperty("--card-roll-new-anim", newAnim);

  // Force a reflow to ensure elements are rendered in initial state
  void cardWidget.offsetHeight;

  // Add animation class to trigger CSS animation
  requestAnimationFrame(() => {
    cardWidget.classList.add("card-roll-animation");
  });

  // Clean up and ensure consistent styling
  setTimeout(() => {
    cardWidget.classList.remove("card-roll-animation");
    cardWidget.innerHTML = "";

    // Apply the same flex styling as the animation to maintain consistent positioning
    cardWidget.style.display = "flex";
    cardWidget.style.alignItems = "center";
    cardWidget.style.justifyContent = "center";

    // Set final value
    cardWidget.textContent = dataValue;

    // Mark animation as complete
    (cardWidget as any).isAnimating = false;
  }, parseFloat(speed) * 1000 || 500);
};

// Keep the fade animation as is
window.widgetAnimations.CardWidget.fade = function (
  cardWidget: HTMLElement,
  dataValue: string
) {
  cardWidget.style.transition = "opacity 0.3s ease";
  cardWidget.style.opacity = "0";

  setTimeout(() => {
    cardWidget.textContent = dataValue;
    cardWidget.style.opacity = "1";
  }, 150);
};
