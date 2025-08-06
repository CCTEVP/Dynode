"use strict";
/// <reference types="../../../types/global" />
function initializeSlideLayouts() {
    console.log("Initializing SlideLayouts");
    const slideLayouts = document.querySelectorAll('[id^="slide-layout-"]');
    slideLayouts.forEach((slideWidget) => { });
}
if (window.widgetInitializer) {
    window.widgetInitializer.register("SlideLayouts", initializeSlideLayouts);
}
