"use strict";
/// <reference types="../../../types/global" />
function initializeClockWidgets() {
    console.log("Initializing ClockWidgets");
    const clockWidgets = document.querySelectorAll('[id^="clock-widget-"]');
    clockWidgets.forEach((clockWidget) => {
        const element = clockWidget;
        // Mark as a ticker widget
        element.setAttribute("data-ticker-widget", "true");
        // Store the subscription logic to be called when ticker starts
        element.startClockUpdates = () => {
            // Subscribe this widget to the creative ticker
            const unsubscribe = window.creativeTicker?.subscribe(clockWidget.id, () => {
                updateClockWidget(element);
            }, 1000 // Update every 1000ms (1 second)
            );
            // Store unsubscribe function for cleanup if needed
            element.unsubscribeTicker = unsubscribe;
        };
    });
}
function updateClockWidget(element) {
    // Get timezone offset from data attribute, default to 0 (GMT)
    const timeZoneStr = element.getAttribute("data-timezone") || "0";
    try {
        // Parse timezone as numeric offset from GMT (e.g., 0, +5, -3)
        let timeZoneOffset = parseFloat(timeZoneStr);
        if (isNaN(timeZoneOffset)) {
            console.warn(`Invalid timezone offset "${timeZoneStr}" for ${element.id}, using GMT+0`);
            timeZoneOffset = 0; // Default to GMT+0
        }
        // Get current server time and calculate the target timezone time
        const now = new Date();
        // Convert to UTC first, then apply the desired timezone offset
        // getTimezoneOffset() returns minutes, convert to milliseconds
        const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
        // Add the target timezone offset (in hours, converted to milliseconds)
        const targetTime = new Date(utcTime + timeZoneOffset * 3600000);
        const hours = targetTime.getHours();
        const minutes = targetTime.getMinutes();
        const seconds = targetTime.getSeconds();
        // Update clock children with time values
        updateClockChildren(element, { hours, minutes, seconds });
    }
    catch (error) {
        console.error(`Error calculating time for ${element.id}:`, error);
        // Fallback to local time if everything fails
        try {
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const seconds = now.getSeconds();
            updateClockChildren(element, { hours, minutes, seconds });
        }
        catch (fallbackError) {
            console.error(`Complete fallback failed for ${element.id}:`, fallbackError);
        }
    }
}
function updateClockChildren(element, timeValues) {
    // Find all children with data-name attributes
    const children = element.querySelectorAll("[data-name]");
    // Update each child with formatted time values
    children.forEach((child) => {
        const dataName = child.getAttribute("data-name");
        if (!dataName)
            return;
        let value = null;
        const partName = dataName.toLowerCase();
        if (partName.includes("hour")) {
            value = timeValues.hours;
        }
        else if (partName.includes("min")) {
            value = timeValues.minutes;
        }
        else if (partName.includes("sec")) {
            value = timeValues.seconds;
        }
        if (value !== null) {
            // Format value with leading zero for values less than 10
            const formattedValue = value < 10 ? `0${value}` : value.toString();
            child.setAttribute("data-value", formattedValue);
        }
    });
}
// Register the widget with the initializer
if (window.widgetInitializer) {
    window.widgetInitializer.register("ClockWidgets", initializeClockWidgets);
}
