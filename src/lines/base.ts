import { stringHasHTMLElements } from "../dom-utils";

export type LineData = Partial<{
  value: string;
  class: string;
  delay: number;
  prompt: string;
  type: "input";
  carriageReturn: boolean;
}>;

export function lineDataToBasicElement(
  line: LineData,
  customPfx = "ty"
): HTMLElement {
  const pfx = `data-${customPfx}`;
  const div = document.createElement("div");
  const useValue = line.value ?? "";
  div.innerHTML = _stringIsHTMLElementWithRelevantData(useValue, customPfx)
    ? useValue
    : `<span ${_attributes(line, pfx)}>${useValue}</span>`;

  return div.firstElementChild as HTMLElement;
}

/**
 * Helper function for generating attributes string.
 *
 * @param line - Line data object.
 * @returns {string} - String of attributes.
 */
function _attributes(line: Record<string, any>, pfx: string): string {
  const attrValuePairs: string[][] = [];

  for (const key in line) {
    if (["value", "type"].indexOf(key) !== -1) {
      // Value handled outside of this function. Type handled below.
      continue;
    }
    const value = line[key];
    if (value === undefined) {
      continue;
    }
    attrValuePairs.push([pfx + "-" + key, value]);
  }

  const valueForPlainPfxAttr: string = line.type ?? "";
  const attributesFromData = attrValuePairs.map(
    pair => `${pair[0]}="${pair[1]}"`
  );
  const alwaysAttributes = [`data-ty=${valueForPlainPfxAttr}`];

  return [...alwaysAttributes, ...attributesFromData].join(" ");
}

function _stringIsHTMLElementWithRelevantData(
  string: string,
  prefix: string
): boolean {
  if (!stringHasHTMLElements(string)) {
    return false;
  }
  const container = document.createElement("div");
  container.innerHTML = string;
  const element = container.firstElementChild as HTMLElement;
  if (!element) {
    // This must have been an incomplete HTML element, e.g. </span>
    console.warn(
      `Detected incomplete HTML element ${string} on its own line. Keep HTML blocks on the same line`
    );
    return false;
  }
  const camelCasePrefix = _camelCase(prefix);
  for (const prop in element.dataset) {
    if (prop.startsWith(camelCasePrefix)) {
      return true;
    }
  }
  return false;
}

function _camelCase(str: string): string {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
    if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
    return index === 0 ? match.toLowerCase() : match.toUpperCase();
  });
}
