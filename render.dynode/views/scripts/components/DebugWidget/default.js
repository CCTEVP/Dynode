"use strict";
/// <reference types="../../../types/global" />
function initializeDebugWidgets() {
    console.log("Initializing DebugWidgets");
    const debugWidgets = document.querySelectorAll('[id^="debug-widget-"]');
    debugWidgets.forEach((debugWidget) => { });
}
if (window.widgetInitializer) {
    window.widgetInitializer.register("DebugWidgets", initializeDebugWidgets);
}
