"use strict";
/// <reference types="../../../types/global" />
function initializeImageWidgets() {
    console.log("Initializing ImageWidgets");
    const imageWidgets = document.querySelectorAll('[id^="image-widget-"]');
    imageWidgets.forEach((imageWidget) => { });
}
if (window.widgetInitializer) {
    window.widgetInitializer.register("ImageWidgets", initializeImageWidgets);
}
