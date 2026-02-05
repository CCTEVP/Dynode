/**
 * Duration Parsing Utilities
 * Refactored from complex room handler logic for better maintainability
 */

/**
 * Parse duration value with optional multiplier
 * @param {number|string} value - Duration value
 * @param {number} multiplier - Multiplier to apply (default 1)
 * @returns {number|null} Duration in milliseconds or null if invalid
 */
export function parseDuration(value, multiplier = 1) {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value * multiplier : null;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed * multiplier : null;
  }

  return null;
}

/**
 * Common duration field names to check
 */
const DURATION_FIELDS = {
  milliseconds: ["expectedSlotDurationMs", "durationMs", "lengthMs"],
  seconds: [
    "expectedSlotDurationSeconds",
    "maxDurationSeconds",
    "durationSeconds",
    "duration",
    "length",
  ],
};

/**
 * Extract duration from direct fields
 * @param {Object} source - Source object
 * @returns {number|null} Duration in milliseconds or null
 */
function extractFromDirectFields(source) {
  if (!source || typeof source !== "object") {
    return null;
  }

  // Try millisecond fields first
  for (const field of DURATION_FIELDS.milliseconds) {
    if (source[field] !== undefined) {
      const parsed = parseDuration(source[field], 1);
      if (parsed !== null) return parsed;
    }
  }

  // Try second fields
  for (const field of DURATION_FIELDS.seconds) {
    if (source[field] !== undefined) {
      const parsed = parseDuration(source[field], 1000);
      if (parsed !== null) return parsed;
    }
  }

  return null;
}

/**
 * Extract duration from nested metadata/data objects
 * @param {Object} source - Source object
 * @returns {number|null} Duration in milliseconds or null
 */
function extractFromNested(source) {
  if (!source || typeof source !== "object") {
    return null;
  }

  // Check metadata object
  if (source.metadata && typeof source.metadata === "object") {
    const fromMetadata = extractFromDirectFields(source.metadata);
    if (fromMetadata !== null) return fromMetadata;
  }

  // Check data object
  if (source.data && typeof source.data === "object") {
    const fromData = extractFromDirectFields(source.data);
    if (fromData !== null) return fromData;
  }

  return null;
}

/**
 * Recursively search for duration fields
 * @param {Object} source - Source object
 * @param {Set} visited - Visited objects to prevent circular references
 * @returns {number|null} Duration in milliseconds or null
 */
function recursiveFindDuration(source, visited = new Set()) {
  if (!source || typeof source !== "object") {
    return null;
  }

  // Prevent circular references
  if (visited.has(source)) {
    return null;
  }
  visited.add(source);

  // Try direct fields first
  const direct = extractFromDirectFields(source);
  if (direct !== null) return direct;

  // Handle arrays
  if (Array.isArray(source)) {
    for (const item of source) {
      const nested = recursiveFindDuration(item, visited);
      if (nested !== null) return nested;
    }
    return null;
  }

  // Search through object properties
  for (const [key, value] of Object.entries(source)) {
    if (value === null || value === undefined) {
      continue;
    }

    // If the key contains "duration", try to parse it with appropriate multiplier
    if (/duration/i.test(key)) {
      const keyLower = key.toLowerCase();
      const hasMsHint = /ms|millisecond/.test(keyLower);
      const hasSecondsHint = /second/.test(keyLower);

      let multiplier = 1;

      // Determine multiplier based on key name
      if (hasSecondsHint || (!hasMsHint && keyLower.includes("duration"))) {
        multiplier = 1000;

        // If value is large (>=1000), assume it's already in milliseconds
        const numericValue =
          typeof value === "number" ? value : Number.parseFloat(value ?? "NaN");
        if (Number.isFinite(numericValue) && numericValue >= 1000) {
          multiplier = 1;
        }
      }

      const parsed = parseDuration(value, multiplier);
      if (parsed !== null) return parsed;
    }

    // Recursively check nested objects
    if (typeof value === "object") {
      const nested = recursiveFindDuration(value, visited);
      if (nested !== null) return nested;
    }
  }

  return null;
}

/**
 * Extract duration from a source object with comprehensive fallback strategy
 * @param {Object} source - Source object (context, metadata, etc.)
 * @returns {number|null} Duration in milliseconds or null
 */
export function extractDurationFromSource(source) {
  if (!source || typeof source !== "object") {
    return null;
  }

  // 1. Try direct expectedSlotDurationMs field
  const direct = parseDuration(source.expectedSlotDurationMs);
  if (direct !== null) return direct;

  // 2. Try nested metadata/data objects
  const nested = extractFromNested(source);
  if (nested !== null) return nested;

  // 3. Try recursive search through all fields
  const recursive = recursiveFindDuration(source);
  if (recursive !== null) return recursive;

  return null;
}

/**
 * Resolve duration from multiple context sources
 * Priority: processed > original > socket metadata > auth payload
 * @param {Object} context - Context object with multiple potential sources
 * @returns {number|null} Duration in milliseconds or null
 */
export function resolveDurationMs(context) {
  if (!context) return null;

  // Build list of sources in priority order
  const candidates = [
    context.processed,
    context.original,
    context.socket?.radioMetadata,
  ];

  // Try each candidate
  for (const candidate of candidates) {
    if (candidate) {
      const duration = extractDurationFromSource(candidate);
      if (duration !== null) return duration;
    }
  }

  // Try socket metadata specifically
  if (context.socket?.radioMetadata?.metadata?.expectedSlotDurationMs) {
    const socketDuration = parseDuration(
      context.socket.radioMetadata.metadata.expectedSlotDurationMs,
    );
    if (socketDuration !== null) return socketDuration;
  }

  // Try auth payload as last resort
  if (context.authPayload?.metadata?.expectedSlotDurationMs) {
    const authDuration = parseDuration(
      context.authPayload.metadata.expectedSlotDurationMs,
    );
    if (authDuration !== null) return authDuration;
  }

  return null;
}

/**
 * Format duration in human-readable format
 * @param {number} milliseconds - Duration in milliseconds
 * @returns {string} Formatted duration string
 */
export function formatDuration(milliseconds) {
  if (!Number.isFinite(milliseconds) || milliseconds < 0) {
    return "0s";
  }

  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

export default {
  parseDuration,
  extractDurationFromSource,
  resolveDurationMs,
  formatDuration,
};
