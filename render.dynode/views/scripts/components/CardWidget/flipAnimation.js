"use strict";
const FLIP_DEFAULTS = {
    direction: "Y",
    speed: "0.5s",
    transition: "ease",
};
window.widgetAnimations = window.widgetAnimations || {};
window.widgetAnimations.CardWidget = window.widgetAnimations.CardWidget || {};
window.widgetAnimations.CardWidget.Flip = function (cardWidget, dataValue, options) {
    const direction = (options?.direction ||
        cardWidget.getAttribute("data-animation-direction") ||
        FLIP_DEFAULTS.direction).toUpperCase();
    const speed = options?.speed ||
        cardWidget.getAttribute("data-animation-speed") ||
        FLIP_DEFAULTS.speed;
    const transition = options?.transition ||
        cardWidget.getAttribute("data-animation-transition") ||
        FLIP_DEFAULTS.transition;
    cardWidget.classList.add("card-flip", "card-flip-3d");
    cardWidget.style.transformStyle = "preserve-3d";
    cardWidget.style.transition = `transform ${speed} ${transition}`;
    // Start flip to 90deg (halfway)
    switch (direction) {
        case "X":
            cardWidget.style.transform = "rotateX(90deg)";
            break;
        case "-X":
            cardWidget.style.transform = "rotateX(-90deg)";
            break;
        case "Y":
            cardWidget.style.transform = "rotateY(90deg)";
            break;
        case "-Y":
            cardWidget.style.transform = "rotateY(-90deg)";
            break;
        case "Z":
            cardWidget.style.transform = "rotateZ(90deg)";
            break;
        case "-Z":
            cardWidget.style.transform = "rotateZ(-90deg)";
            break;
        default:
            cardWidget.style.transform = "rotateY(90deg)";
            break;
    }
    // At halfway, swap value and continue to 180deg
    setTimeout(() => {
        cardWidget.textContent = dataValue;
        cardWidget.style.transition = "none";
        switch (direction) {
            case "X":
                cardWidget.style.transform = "rotateX(-90deg)";
                break;
            case "-X":
                cardWidget.style.transform = "rotateX(90deg)";
                break;
            case "Y":
                cardWidget.style.transform = "rotateY(-90deg)";
                break;
            case "-Y":
                cardWidget.style.transform = "rotateY(90deg)";
                break;
            case "Z":
                cardWidget.style.transform = "rotateZ(-90deg)";
                break;
            case "-Z":
                cardWidget.style.transform = "rotateZ(90deg)";
                break;
            default:
                cardWidget.style.transform = "rotateY(-90deg)";
                break;
        }
        // Force reflow to apply the style immediately
        void cardWidget.offsetWidth;
        cardWidget.style.transition = `transform ${speed} ${transition}`;
        cardWidget.style.transform = "none";
    }, parseFloat(speed) * 500);
};
