export async function fetchCreativeById(creativeId: string) {
  const response = await fetch(
    `https://localhost:3000/data/creatives/${encodeURIComponent(creativeId)}`,
    {
    }
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch creative: ${response.statusText}`);
  }
  return response.json();
}
export async function fetchCreatives() {
  const response = await fetch("https://localhost:3000/data/creatives", {
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch creatives: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Recursively collects all elements (with their widget type) from the creative,
 * flattening the tree structure. Each element will include its widget type and path.
 */
function collectElementsRecursively(
  elements: any[],
  parentPath: string[] = []
): Array<{ widgetType: string; data: any; path: string[] }> {
  const collected: Array<{ widgetType: string; data: any; path: string[] }> =
    [];

  elements.forEach((element, idx) => {
    // Each element is an object with a single key (widget type)
    const [widgetType] = Object.keys(element);
    const data = element[widgetType];
    const currentPath = [...parentPath, data.identifier || widgetType || idx];

    collected.push({ widgetType, data, path: currentPath });

    // If this element has children in "contents", recurse
    if (Array.isArray(data.contents) && data.contents.length > 0) {
      data.contents.forEach((child: any) => {
        collected.push(...collectElementsRecursively([child], currentPath));
      });
    }
  });

  return collected;
}

/**
 * Fetches a creative by ID and returns:
 * - root: the creative object without the 'elements' field
 * - elements: a flat array of all elements (including nested ones), each with widgetType, data, and path
 */
export async function fetchCreativeWithAllElementsFlat(creativeId: string) {
  const creative = await fetchCreativeById(creativeId);

  // Separate elements from the root object
  const { elements = [], ...root } = creative;

  // Recursively collect all elements (flat)
  const flatElements = collectElementsRecursively(elements);

  return {
    root,
    elements: flatElements,
  };
}

/**
 * Fetches a creative by ID and returns an object with:
 * - root: the creative object without the 'elements' field
 * - elements: an array of element objects (from creative.elements)
 */
export async function fetchCreativeWithElementsSeparated(creativeId: string) {
  const creative = await fetchCreativeById(creativeId);

  // Separate elements from the root object
  const { elements = [], ...root } = creative;

  return {
    root,
    elements,
  };
}
