export function toCamelCaseStyleKey(key: string): string {
  if (!key || typeof key !== "string") return key;
  // handle vendor prefixes like -webkit-, -moz-, -ms-
  if (key.startsWith("-")) {
    const parts = key.split("-").filter(Boolean);
    if (parts.length === 0) return key;
    const first = parts[0].toLowerCase();
    const rest = parts
      .slice(1)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join("");
    if (first === "ms") return "ms" + rest;
    return first.charAt(0).toUpperCase() + first.slice(1) + rest;
  }

  return key
    .split("-")
    .map((part, i) =>
      i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)
    )
    .join("");
}

export function normalizeStyleObject(styles?: Record<string, any>) {
  if (!styles || typeof styles !== "object") return styles;
  const out: Record<string, any> = {};
  Object.keys(styles).forEach((k) => {
    const val = styles[k];
    const ck = toCamelCaseStyleKey(k);
    out[ck] = val;
  });
  return out;
}

export default normalizeStyleObject;
