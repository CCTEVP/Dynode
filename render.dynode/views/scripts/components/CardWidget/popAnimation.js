"use strict";
const POP_DEFAULTS = {
    scale: "1.2",
    speed: "0.3s",
    transition: "ease",
};
window.widgetAnimations = window.widgetAnimations || {};
window.widgetAnimations.CardWidget = window.widgetAnimations.CardWidget || {};
window.widgetAnimations.CardWidget.Pop = function (cardWidget, dataValue, options) {
    const scale = options?.scale ||
        cardWidget.getAttribute("data-animation-scale") ||
        POP_DEFAULTS.scale;
    const speed = options?.speed ||
        cardWidget.getAttribute("data-animation-speed") ||
        POP_DEFAULTS.speed;
    const transition = options?.transition ||
        cardWidget.getAttribute("data-animation-transition") ||
        POP_DEFAULTS.transition;
    cardWidget.classList.add("card-pop");
    cardWidget.style.transition = `transform ${speed} ${transition}`;
    cardWidget.style.transform = `scale(${scale})`;
    setTimeout(() => {
        cardWidget.textContent = dataValue;
        cardWidget.style.transform = "scale(1)";
    }, parseFloat(speed) * 500);
};
