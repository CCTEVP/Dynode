"use strict";
/**
 * Utility functions for widget formatting
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatWithLeadingZero = formatWithLeadingZero;
// Helper function to add leading zeros for time values
function formatWithLeadingZero(value) {
    return value < 10 ? `0${value}` : value.toString();
}
