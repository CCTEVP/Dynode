/**
 * Utility functions for widget formatting
 */

// Helper function to add leading zeros for time values
export function formatWithLeadingZero(value: number): string {
  return value < 10 ? `0${value}` : value.toString();
}
