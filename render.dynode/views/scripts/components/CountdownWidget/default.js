"use strict";
/// <reference types="../../../types/global" />
function initializeCountdownWidgets() {
    console.log("Initializing CountdownWidgets");
    const countdownWidgets = document.querySelectorAll('[id^="countdown-widget-"]');
    countdownWidgets.forEach((countdownWidget) => {
        const element = countdownWidget;
        // Subscribe this widget to the creative ticker
        const unsubscribe = window.creativeTicker?.subscribe(countdownWidget.id, () => {
            updateCountdownWidget(element);
        }, 1000 // Update every 1000ms (1 second)
        );
        // Store unsubscribe function for cleanup if needed
        element.unsubscribeTicker = unsubscribe;
    });
}
function updateCountdownWidget(element) {
    // Get target datetime from data attribute
    const targetDatetime = element.getAttribute("data-targetdatetime");
    if (!targetDatetime) {
        console.warn(`No data-targetdatetime found for ${element.id}`);
        return;
    }
    // Calculate remaining time
    const targetTime = new Date(targetDatetime).getTime();
    const currentTime = Date.now();
    const remainingTime = targetTime - currentTime;
    if (remainingTime <= 0) {
        // Countdown finished - set all children to 0
        setAllChildrenToZero(element);
        // Optionally unsubscribe when countdown is done
        if (element.unsubscribeTicker) {
            element.unsubscribeTicker();
        }
        return;
    }
    // Update countdown children based on present units
    updateCountdownChildren(element, remainingTime);
}
function updateCountdownChildren(element, remainingMilliseconds) {
    // Find all children with data-name attributes
    const children = element.querySelectorAll("[data-name]");
    // Get list of present units
    const presentUnits = [];
    children.forEach((child) => {
        const dataName = child.getAttribute("data-name");
        if (dataName) {
            presentUnits.push(dataName);
        }
    });
    // Calculate values based on present units
    const values = calculateAdaptiveValues(remainingMilliseconds, presentUnits);
    // Update each child with formatted values
    children.forEach((child) => {
        const dataName = child.getAttribute("data-name");
        if (dataName && values[dataName] !== undefined) {
            // Format value with leading zero for values less than 10
            const formattedValue = formatWithLeadingZero(values[dataName]);
            child.setAttribute("data-value", formattedValue);
        }
    });
}
// Helper function to add leading zeros
function formatWithLeadingZero(value) {
    return value < 10 ? `0${value}` : value.toString();
}
function calculateAdaptiveValues(milliseconds, presentUnits) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    let remainingSeconds = totalSeconds;
    const values = {};
    // Define unit hierarchy (largest to smallest)
    const unitHierarchy = ["days", "hours", "minutes", "seconds"];
    // Filter to only present units in hierarchy order
    const presentUnitHierarchy = unitHierarchy.filter((unit) => presentUnits.includes(unit));
    // Calculate breakdown values for present units
    for (let i = 0; i < presentUnitHierarchy.length; i++) {
        const unit = presentUnitHierarchy[i];
        if (i === 0) {
            // First (largest) unit gets all remaining time converted to its unit
            switch (unit) {
                case "days":
                    values[unit] = Math.floor(remainingSeconds / (24 * 60 * 60));
                    remainingSeconds = remainingSeconds % (24 * 60 * 60);
                    break;
                case "hours":
                    values[unit] = Math.floor(remainingSeconds / (60 * 60));
                    remainingSeconds = remainingSeconds % (60 * 60);
                    break;
                case "minutes":
                    values[unit] = Math.floor(remainingSeconds / 60);
                    remainingSeconds = remainingSeconds % 60;
                    break;
                case "seconds":
                    values[unit] = remainingSeconds;
                    remainingSeconds = 0;
                    break;
            }
        }
        else {
            // Subsequent units get the remainder
            switch (unit) {
                case "hours":
                    values[unit] = Math.floor(remainingSeconds / (60 * 60));
                    remainingSeconds = remainingSeconds % (60 * 60);
                    break;
                case "minutes":
                    values[unit] = Math.floor(remainingSeconds / 60);
                    remainingSeconds = remainingSeconds % 60;
                    break;
                case "seconds":
                    values[unit] = remainingSeconds;
                    remainingSeconds = 0;
                    break;
            }
        }
    }
    // Handle total calculations for specific total units
    presentUnits.forEach((unit) => {
        switch (unit) {
            case "totalDays":
                values[unit] = Math.floor(totalSeconds / (24 * 60 * 60));
                break;
            case "totalHours":
                values[unit] = Math.floor(totalSeconds / (60 * 60));
                break;
            case "totalMinutes":
                values[unit] = Math.floor(totalSeconds / 60);
                break;
            case "totalSeconds":
                values[unit] = totalSeconds;
                break;
        }
    });
    return values;
}
function setAllChildrenToZero(element) {
    const children = element.querySelectorAll("[data-name]");
    children.forEach((child) => {
        child.setAttribute("data-value", "0");
    });
}
// Register the widget with the initializer
if (window.widgetInitializer) {
    window.widgetInitializer.register("CountdownWidgets", initializeCountdownWidgets);
}
