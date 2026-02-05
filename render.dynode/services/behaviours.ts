import logger from "./logger";

const TARGET_COMPONENT_PATTERN = /(Layout|Widget)$/i;

type BehaviourComparison = {
  comparison_type?: string;
  value_type?: string;
  values?: unknown[];
};

type BehaviourRule = {
  comparisons?: BehaviourComparison[];
  comparison_type?: string;
  value_type?: string;
  values?: unknown[];
};

type BehaviourDefinition = {
  rules?: BehaviourRule[];
  [key: string]: unknown;
};

type BehaviourBlock = Record<string, BehaviourDefinition | undefined>;

type ElementNode = {
  behaviours?: BehaviourBlock[] | BehaviourBlock;
  styles?: Record<string, string>;
  contents?: Record<string, unknown>[];
  [key: string]: unknown;
};

type ElementMap = Record<string, ElementNode>;

type CreativeLike = {
  elements?: ElementMap[];
  [key: string]: unknown;
};

type ComparisonEvaluator = (
  comparison: string | undefined,
  values: unknown[]
) => boolean;

const COMPARISON_EVALUATORS: Record<string, ComparisonEvaluator> = {
  datetime: evaluateDateComparison,
  date: evaluateDateComparison,
  number: evaluateNumberComparison,
  numeric: evaluateNumberComparison,
  string: evaluateStringComparison,
  text: evaluateStringComparison,
  boolean: evaluateBooleanComparison,
};

export function applyBehavioursToCreative(creative: CreativeLike | undefined) {
  if (!creative?.elements || !Array.isArray(creative.elements)) {
    return creative;
  }

  creative.elements.forEach(processElementMap);
  return creative;
}

function processElementMap(elementMap: Record<string, unknown>) {
  if (!elementMap || typeof elementMap !== "object") {
    return;
  }

  Object.entries(elementMap).forEach(([componentType, rawNode]) => {
    if (!rawNode || typeof rawNode !== "object") {
      return;
    }

    const node = rawNode as ElementNode;

    if (TARGET_COMPONENT_PATTERN.test(componentType)) {
      applyBehaviours(node);
    }

    if (Array.isArray(node.contents)) {
      node.contents.forEach((child) => processElementMap(child));
    }
  });
}

const behaviourHandlers: Record<
  string,
  (node: ElementNode, definition: BehaviourDefinition) => void
> = {
  visibility: applyVisibilityBehaviour,
};

function applyBehaviours(node: ElementNode) {
  const blocks = normalizeBehaviourBlocks(node.behaviours);
  if (blocks.length === 0) {
    return;
  }

  blocks.forEach((block) => {
    Object.entries(block).forEach(([behaviourName, definition]) => {
      if (!definition) {
        return;
      }

      const handler = behaviourHandlers[behaviourName.toLowerCase()];
      if (handler) {
        handler(node, definition);
      } else {
        logger.debug("[behaviours] unsupported behaviour type", {
          behaviourName,
        });
      }
    });
  });
}

function normalizeBehaviourBlocks(
  behaviours: ElementNode["behaviours"]
): BehaviourBlock[] {
  // API stores behaviours as an array of single-key blocks; keep supporting lone objects for safety.
  if (!behaviours) {
    return [];
  }

  if (Array.isArray(behaviours)) {
    return behaviours.filter(
      (block): block is BehaviourBlock =>
        !!block && typeof block === "object" && !Array.isArray(block)
    );
  }

  if (typeof behaviours === "object") {
    return [behaviours];
  }

  return [];
}

function applyVisibilityBehaviour(
  node: ElementNode,
  definition: BehaviourDefinition
) {
  const rules = definition.rules;
  if (!Array.isArray(rules) || rules.length === 0) {
    return;
  }

  const isVisible = rules.every(evaluateRule);

  if (!isVisible) {
    if (!node.styles) {
      node.styles = {};
    }
    node.styles.display = "none";
  }
}

function evaluateRule(rule: BehaviourRule): boolean {
  const comparisons = extractComparisons(rule);
  if (comparisons.length === 0) {
    return true;
  }

  return comparisons.every(evaluateComparison);
}

function extractComparisons(rule: BehaviourRule): BehaviourComparison[] {
  if (Array.isArray(rule.comparisons) && rule.comparisons.length > 0) {
    return rule.comparisons;
  }

  const fallback: BehaviourComparison = {
    comparison_type: rule.comparison_type,
    value_type: rule.value_type,
    values: rule.values,
  };

  if (
    fallback.comparison_type ||
    fallback.value_type ||
    (Array.isArray(fallback.values) && fallback.values.length > 0)
  ) {
    return [fallback];
  }

  return [];
}

function evaluateComparison(comparison: BehaviourComparison): boolean {
  const values = Array.isArray(comparison.values)
    ? comparison.values
    : undefined;

  if (!values) {
    logger.warn("[behaviours] comparison missing values", { comparison });
    return true;
  }

  const evaluatorKey = comparison.value_type
    ? comparison.value_type.toLowerCase()
    : "";

  const evaluator = COMPARISON_EVALUATORS[evaluatorKey];

  if (!evaluator) {
    logger.debug("[behaviours] no evaluator for value type", {
      valueType: comparison.value_type,
    });
    return true;
  }

  return evaluator(comparison.comparison_type?.toLowerCase(), values);
}

function evaluateDateComparison(
  comparison: string | undefined,
  values: unknown[]
): boolean {
  if (values.length < 2) {
    logger.warn("[behaviours] date comparison missing values", {
      comparison,
      values,
    });
    return true;
  }

  const left = coerceDateValue(values[0]);
  const right = coerceDateValue(values[1]);

  if (left === undefined || right === undefined) {
    logger.warn("[behaviours] date comparison parse failure", {
      comparison,
      values,
    });
    return true;
  }

  return executeComparator(comparison, left, right);
}

function evaluateNumberComparison(
  comparison: string | undefined,
  values: unknown[]
): boolean {
  if (values.length < 2) {
    logger.warn("[behaviours] number comparison missing values", {
      comparison,
      values,
    });
    return true;
  }

  const left = coerceNumberValue(values[0]);
  const right = coerceNumberValue(values[1]);

  if (left === undefined || right === undefined) {
    logger.warn("[behaviours] number comparison parse failure", {
      comparison,
      values,
    });
    return true;
  }

  return executeComparator(comparison, left, right);
}

function evaluateStringComparison(
  comparison: string | undefined,
  values: unknown[]
): boolean {
  if (values.length < 2) {
    logger.warn("[behaviours] string comparison missing values", {
      comparison,
      values,
    });
    return true;
  }

  const left = values[0] != null ? String(values[0]) : "";
  const right = values[1] != null ? String(values[1]) : "";

  return executeComparator(comparison, left.localeCompare(right), 0, {
    left,
    right,
  });
}

function evaluateBooleanComparison(
  comparison: string | undefined,
  values: unknown[]
): boolean {
  if (values.length < 2) {
    logger.warn("[behaviours] boolean comparison missing values", {
      comparison,
      values,
    });
    return true;
  }

  const left = coerceBooleanValue(values[0]);
  const right = coerceBooleanValue(values[1]);

  if (left === undefined || right === undefined) {
    logger.warn("[behaviours] boolean comparison parse failure", {
      comparison,
      values,
    });
    return true;
  }

  return executeComparator(comparison, Number(left), Number(right));
}

function executeComparator(
  comparison: string | undefined,
  left: number,
  right: number,
  extras?: Record<string, unknown>
): boolean {
  switch (comparison) {
    case "lt":
      return left < right;
    case "lte":
      return left <= right;
    case "gt":
      return left > right;
    case "gte":
      return left >= right;
    case "eq":
    case "equals":
      return left === right;
    case "neq":
    case "ne":
    case "noteq":
      return left !== right;
    default:
      logger.debug("[behaviours] unsupported comparison operator", {
        comparison,
        left,
        right,
        ...extras,
      });
      return true;
  }
}

function coerceDateValue(value: unknown): number | undefined {
  if (typeof value === "string") {
    if (value.toLowerCase() === "now") {
      return Date.now();
    }
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }

  if (value && typeof value === "object") {
    const maybeDate = (value as { $date?: string | number }).$date;
    if (maybeDate) {
      const parsed = Date.parse(String(maybeDate));
      return Number.isNaN(parsed) ? undefined : parsed;
    }
  }

  return undefined;
}

function coerceNumberValue(value: unknown): number | undefined {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
}

function coerceBooleanValue(value: unknown): boolean | undefined {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }
  return undefined;
}

export default {
  applyBehavioursToCreative,
};
