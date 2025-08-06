"use strict";
/// <reference types="../../../types/global" />
function initializeTextWidgets() {
    console.log("Initializing TextWidgets");
    const textWidgets = document.querySelectorAll('[id^="text-widget-"]');
    textWidgets.forEach((textWidget) => { });
}
if (window.widgetInitializer) {
    window.widgetInitializer.register("TextWidgets", initializeTextWidgets);
}
