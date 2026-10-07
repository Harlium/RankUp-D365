// Match a form label to a column logical name without suffix collisions.
// `label[id$="name-field-label"]` also matches `accountname-field-label`.

const LOGICAL_NAME_CHAR = /[A-Za-z0-9_]/;

export function fieldLabelSuffix(logicalName: string): string {
  return `${logicalName}-field-label`;
}

/**
 * True when `elementId` belongs to this logical name.
 * An exact id wins. A longer id matches only when the character before the
 * logical name cannot be part of a longer logical name (`-`, `.`, and so on).
 */
export function fieldLabelIdMatches(elementId: string, logicalName: string): boolean {
  if (!elementId || !logicalName) {
    return false;
  }

  const suffix = fieldLabelSuffix(logicalName);
  if (elementId === suffix) {
    return true;
  }
  if (!elementId.endsWith(suffix)) {
    return false;
  }

  const boundaryIndex = elementId.length - suffix.length - 1;
  if (boundaryIndex < 0) {
    return false;
  }

  return !LOGICAL_NAME_CHAR.test(elementId.charAt(boundaryIndex));
}

/**
 * Prefer the exact `{logicalName}-field-label` id, then a delimited longer id.
 */
export function findFieldLabelElement(root: ParentNode, logicalName: string): HTMLElement | null {
  const labels = root.querySelectorAll('label[id]');
  const exactId = fieldLabelSuffix(logicalName);
  let boundaryMatch: HTMLElement | null = null;

  for (const node of Array.from(labels)) {
    const element = node as HTMLElement;
    if (!fieldLabelIdMatches(element.id, logicalName)) {
      continue;
    }
    if (element.id === exactId) {
      return element;
    }
    if (!boundaryMatch) {
      boundaryMatch = element;
    }
  }

  return boundaryMatch;
}
