/**
 * Configuration Validation
 * Validates required environment variables on startup
 * Fails fast if critical configuration is missing
 */

import logger from "../services/logger.js";

/**
 * Required environment variables for production
 */
const REQUIRED_ENV_VARS = ["AUTH_SECRET", "NODE_ENV"];

/**
 * Optional but recommended environment variables
 */
const RECOMMENDED_ENV_VARS = [
  "PUBLIC_BASE_URL",
  "ORIGIN_ALLOWLIST",
  "LOG_LEVEL",
  "REDIS_URL",
];

/**
 * Validate environment variable is a valid positive integer
 * @param {string} name - Environment variable name
 * @param {string} value - Environment variable value
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {boolean} True if valid
 */
function validatePositiveInteger(
  name,
  value,
  min = 1,
  max = Number.MAX_SAFE_INTEGER,
) {
  if (!value) return false;

  const num = parseInt(value, 10);
  if (isNaN(num) || num < min || num > max) {
    logger.error(`Invalid ${name}: must be integer between ${min} and ${max}`, {
      value,
      parsed: num,
    });
    return false;
  }

  return true;
}

/**
 * Validate environment variable is a valid URL
 * @param {string} name - Environment variable name
 * @param {string} value - Environment variable value
 * @returns {boolean} True if valid
 */
function validateUrl(name, value) {
  if (!value) return false;

  try {
    new URL(value);
    return true;
  } catch (error) {
    logger.error(`Invalid ${name}: must be valid URL`, { value });
    return false;
  }
}

/**
 * Validate AUTH_SECRET is sufficiently strong
 * @param {string} secret - Auth secret to validate
 * @returns {boolean} True if valid
 */
function validateAuthSecret(secret) {
  if (!secret) {
    logger.error("AUTH_SECRET is required but not set");
    return false;
  }

  if (secret.length < 32) {
    logger.error("AUTH_SECRET is too short (minimum 32 characters)", {
      length: secret.length,
    });
    return false;
  }

  // Check for default/example secrets
  const forbiddenSecrets = [
    "your-secret-key-here",
    "change-me",
    "default",
    "secret",
    "12345",
  ];

  if (
    forbiddenSecrets.some((forbidden) =>
      secret.toLowerCase().includes(forbidden),
    )
  ) {
    logger.error(
      "AUTH_SECRET appears to be a default/example value - must be changed",
    );
    return false;
  }

  return true;
}

/**
 * Validate all environment configuration
 * @returns {boolean} True if all required config is valid
 */
export function validateConfig() {
  logger.info("Validating environment configuration...");

  let hasErrors = false;
  const warnings = [];

  // Check required variables
  for (const varName of REQUIRED_ENV_VARS) {
    if (!process.env[varName]) {
      logger.error(`Required environment variable missing: ${varName}`);
      hasErrors = true;
    }
  }

  // Validate AUTH_SECRET strength
  if (process.env.AUTH_SECRET && !validateAuthSecret(process.env.AUTH_SECRET)) {
    hasErrors = true;
  }

  // Validate PORT is a valid integer
  if (
    process.env.PORT &&
    !validatePositiveInteger("PORT", process.env.PORT, 1, 65535)
  ) {
    hasErrors = true;
  }

  // Validate PORT_ENV is a valid integer if set
  if (
    process.env.PORT_ENV &&
    !validatePositiveInteger("PORT_ENV", process.env.PORT_ENV, 1, 65535)
  ) {
    hasErrors = true;
  }

  // Validate PUBLIC_BASE_URL format if set
  if (
    process.env.PUBLIC_BASE_URL &&
    !validateUrl("PUBLIC_BASE_URL", process.env.PUBLIC_BASE_URL)
  ) {
    hasErrors = true;
  }

  // Validate numeric configurations
  const numericConfigs = {
    HEARTBEAT_INTERVAL_MS: { min: 1000, max: 300000 },
    IDLE_TIMEOUT_MS: { min: 0, max: 3600000 },
    MAX_CONN_AGE: { min: 0, max: 86400000 },
    MAX_PAYLOAD_BYTES: { min: 1024, max: 10485760 },
    POST_CONTENT_MAX_BYTES: { min: 1024, max: 10485760 },
  };

  for (const [name, { min, max }] of Object.entries(numericConfigs)) {
    if (
      process.env[name] &&
      !validatePositiveInteger(name, process.env[name], min, max)
    ) {
      hasErrors = true;
    }
  }

  // Check recommended variables
  for (const varName of RECOMMENDED_ENV_VARS) {
    if (!process.env[varName]) {
      warnings.push(`Recommended environment variable not set: ${varName}`);
    }
  }

  // Special validation for ORIGIN_ALLOWLIST
  if (
    !process.env.ORIGIN_ALLOWLIST ||
    process.env.ORIGIN_ALLOWLIST.trim() === ""
  ) {
    warnings.push(
      "ORIGIN_ALLOWLIST is empty - CORS will allow ALL origins (not recommended for production)",
    );
  }

  // Special validation for production environment
  if (process.env.NODE_ENV === "production") {
    // In production, recommend Redis for session storage
    if (!process.env.REDIS_URL) {
      warnings.push(
        "REDIS_URL not set - using in-memory sessions (not recommended for production)",
      );
    }

    // In production, require ORIGIN_ALLOWLIST
    if (
      !process.env.ORIGIN_ALLOWLIST ||
      process.env.ORIGIN_ALLOWLIST.trim() === ""
    ) {
      logger.error("ORIGIN_ALLOWLIST is required in production");
      hasErrors = true;
    }

    // Check for hardcoded tokens environment variables
    const tokenVars = [
      "TOKEN_SCREEN",
      "TOKEN_ADVERTISER",
      "TOKEN_CONTROL",
      "TOKEN_MONITOR",
    ];
    const missingTokens = tokenVars.filter((v) => !process.env[v]);
    if (missingTokens.length > 0) {
      logger.warn(
        "Some token environment variables not set, will use hardcoded tokens:",
        {
          missing: missingTokens,
        },
      );
      warnings.push(
        "Consider setting all token environment variables: " +
          missingTokens.join(", "),
      );
    }
  }

  // Log all warnings
  warnings.forEach((warning) => logger.warn(warning));

  if (hasErrors) {
    logger.error("Configuration validation failed - cannot start server");
    return false;
  }

  logger.info("Configuration validation passed", {
    warnings: warnings.length,
  });

  return true;
}

/**
 * Get validated numeric config value with bounds checking
 * @param {string} name - Environment variable name
 * @param {number} defaultValue - Default value if not set
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {number} Validated value
 */
export function getNumericConfig(
  name,
  defaultValue,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
) {
  const value = process.env[name];

  if (!value) {
    return defaultValue;
  }

  const num = parseInt(value, 10);

  if (isNaN(num)) {
    logger.warn(`Invalid ${name}: not a number, using default`, {
      value,
      default: defaultValue,
    });
    return defaultValue;
  }

  if (num < min || num > max) {
    logger.warn(`Invalid ${name}: out of bounds, using default`, {
      value: num,
      min,
      max,
      default: defaultValue,
    });
    return defaultValue;
  }

  return num;
}

export default { validateConfig, getNumericConfig };
