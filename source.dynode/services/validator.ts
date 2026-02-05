import Ajv, { JSONSchemaType } from "ajv";
import logger from "./logger";

const ajv = new Ajv({ allErrors: true });

/**
 * Validates response data against a JSON Schema pattern
 * @param data - The response data to validate
 * @param pattern - JSON Schema pattern object
 * @returns true if validation passes, false otherwise
 */
export function validateResponse(data: any, pattern: any): boolean {
  try {
    const validate = ajv.compile(pattern);
    const valid = validate(data);

    if (!valid) {
      logger.warn("Response validation failed:", {
        errors: validate.errors,
        data: JSON.stringify(data).substring(0, 200),
      });
    }

    return valid;
  } catch (error) {
    logger.error("Error compiling or validating schema:", error);
    return false;
  }
}

export default { validateResponse };
