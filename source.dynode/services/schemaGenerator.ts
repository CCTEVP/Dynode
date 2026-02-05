/**
 * Generate a JSON Schema from sample data
 * @param data - Sample data to analyze
 * @returns JSON Schema representation
 */
export function generateSchema(data: any): any {
  if (data === null) {
    return { type: "null" };
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      return { type: "array", items: {} };
    }
    // Use first item as template
    return {
      type: "array",
      items: generateSchema(data[0]),
    };
  }

  const type = typeof data;

  if (type === "object") {
    const properties: Record<string, any> = {};

    for (const key of Object.keys(data)) {
      properties[key] = generateSchema(data[key]);
    }

    return {
      type: "object",
      properties,
      // Don't mark fields as required - API responses may have optional fields
    };
  }

  // Primitive types
  if (type === "string") return { type: "string" };
  if (type === "number") return { type: "number" };
  if (type === "boolean") return { type: "boolean" };

  return {};
}
