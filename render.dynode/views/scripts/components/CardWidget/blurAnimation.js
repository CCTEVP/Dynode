"use strict";
const BLUR_DEFAULTS = {
    distance: "8px",
    speed: "0.4s",
    transition: "ease",
};
// Re-export generic Blur for explicit import
window.widgetAnimations = window.widgetAnimations || {};
window.widgetAnimations.CardWidget = window.widgetAnimations.CardWidget || {};
window.widgetAnimations.CardWidget.Blur = function (cardWidget, dataValue, options) {
    const distance = options?.distance ||
        cardWidget.getAttribute("data-animation-distance") ||
        BLUR_DEFAULTS.distance;
    const speed = options?.speed ||
        cardWidget.getAttribute("data-animation-speed") ||
        BLUR_DEFAULTS.speed;
    const transition = options?.transition ||
        cardWidget.getAttribute("data-animation-transition") ||
        BLUR_DEFAULTS.transition;
    console.log("[BlurAnimation] Running", {
        distance,
        speed,
        transition,
        dataValue,
        cardWidget,
    });
    cardWidget.classList.add("card-blur");
    cardWidget.style.transition = `filter ${speed} ${transition}`;
    cardWidget.style.filter = `blur(${distance})`;
    setTimeout(() => {
        console.log("[BlurAnimation] Setting value and removing blur", {
            dataValue,
        });
        cardWidget.textContent = dataValue;
        cardWidget.style.filter = "blur(0px)";
    }, parseFloat(speed) * 500);
};
