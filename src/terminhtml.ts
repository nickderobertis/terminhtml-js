import {
  getElementFromSelectorOrElement,
  stringHasHTMLElements,
} from "./dom-utils";
import { LineData, Termynal, TermynalOptions } from "./termynal";

const carriageReturnChar = "\r";

/*
 * Custom options for TerminHTML
 */
export type TerminHTMLOptions = {
  /**
   * Delay before animation, in ms.
   */
  startDelay?: number;
  /**
   * Delay between each typed character, in ms.
   */
  typeDelay?: number;
  /**
   * Delay between each line, in ms.
   */
  lineDelay?: number;
  /**
   * Character to use for cursor, defaults to ▋.
   */
  cursor?: string;
  /**
   * Initialise the animation now rather than waiting for it to come into view.
   */
  initNow: boolean;
  /**
   * The literal string that starts a new prompt
   */
  promptLiteralStart: string;
  /**
   * The literal string that starts a new custom prompt
   */
  customPromptLiteralStart: string;
  /**
   * Enable automatic scrolling to the bottom of the terminal until the
   * user scrolls up.
   */
  autoScroll: boolean;
};

/**
 * Default options for TerminHTML. The other options' defaults are
 * set internally by Termnyal.
 */
const defaultOptions: TerminHTMLOptions = {
  promptLiteralStart: "$ ",
  customPromptLiteralStart: "# ",
  initNow: false,
  autoScroll: true,
};

export class TerminHTML {
  container: HTMLElement;
  options: TerminHTMLOptions;
  private termynal: Termynal;

  constructor(
    container: string | HTMLElement = "#termynal",
    options: Partial<TerminHTMLOptions> = {}
  ) {
    this.container = getElementFromSelectorOrElement(container);
    this.options = { ...defaultOptions, ...options };
    const { initNow, ...rest } = options;

    // Initialize Termynal
    const lineData = this._createLineData();
    const termynalOptions: TermynalOptions = {
      ...rest,
      noInit: !initNow,
    };
    this.termynal = new Termynal(container, lineData, termynalOptions);
  }

  init() {
    this.termynal.init();
  }

  _createLineData(): LineData[] {
    const lines = this.container.innerHTML.split("\n");
    const lineData: LineData[] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith("// ")) {
        lineData.push({
          value: "💬 " + line.replace("// ", "").trimEnd(),
          class: "termynal-comment",
          delay: 0,
        });
      } else if (textContentStartsWith(line, this.options.promptLiteralStart)) {
        const value = createTermynalValueFromPossiblyHTMLString(line, {
          replacements: [
            { searchValue: this.options.promptLiteralStart, replaceValue: "" },
          ],
          type: "input",
        });
        lineData.push({
          type: "input",
          value,
        });
      } else if (
        textContentStartsWith(line, this.options.customPromptLiteralStart)
      ) {
        const promptStart = line.indexOf(this.options.promptLiteralStart);
        if (promptStart === -1) {
          console.error("Custom prompt found but no end delimiter", line);
        }
        const prompt = line
          .slice(0, promptStart)
          .replace(this.options.customPromptLiteralStart, "");
        const value = createTermynalValueFromPossiblyHTMLString(
          line.slice(promptStart + this.options.promptLiteralStart.length),
          {
            type: "input",
            prompt,
          }
        );
        lineData.push({
          type: "input",
          value,
          prompt,
        });
      }
      // TODO: need a better check for carriage return. This could still match
      //  if it is in the middle of the line. I can't use the approach used for
      //  prompts because once I assign the value to innerHTML, the carriage
      //  return \r becomes a line feed \n.
      else if (line.indexOf("\r") !== -1) {
        const value = createTermynalValueFromPossiblyHTMLString(line, {
          replacements: [{ searchValue: carriageReturnChar, replaceValue: "" }],
          carriageReturn: true,
        });
        lineData.push({
          value,
          carriageReturn: true,
        });
      } else {
        lineData.push({
          value: line,
        });
      }
    }
    return lineData;
  }
}

function textContentStartsWith(elementString: string, string: string): boolean {
  const textContent =
    getTextContentFromStringPossiblyContainingHTML(elementString);
  return textContent.startsWith(string);
}

function textContentEndsWith(elementString: string, string: string): boolean {
  const textContent =
    getTextContentFromStringPossiblyContainingHTML(elementString);
  return textContent.endsWith(string);
}

function getTextContentFromStringPossiblyContainingHTML(
  string: string
): string {
  if (!stringHasHTMLElements(string)) {
    // Not HTML, the string itself is text content
    return string;
  }

  // Create DOM node and then extract text content
  const div = document.createElement("div");
  // Content might be HTML with extra spacing around it, so trim it
  // But need to check that HTML is really the first content. If it is not,
  // this is a mixed text and HTML string and we need to treat it as text first
  const trimString = string.trim();
  const useString = trimString.startsWith("<") ? trimString : string;
  div.innerHTML = useString;
  return div.textContent ?? "";
}

type Replacement = {
  searchValue: string | RegExp;
  replaceValue: string;
};

type CreateTermynalValueOptions = {
  replacements?: Replacement[];
  type?: "input";
  prompt?: string;
  carriageReturn?: boolean;
};

function createTermynalValueFromPossiblyHTMLString(
  string: string,
  options: CreateTermynalValueOptions = {}
): string {
  const replacements = options.replacements ?? [];
  if (!stringHasHTMLElements(string)) {
    // Not HTML, just do replacements in the string as
    // other options will be handled by passing directly to Termynal
    return applyReplacements(string, replacements).trimEnd();
  }

  // Create DOM node, do replacements on text content, add necessary
  // attributes and then stringify
  const div = document.createElement("div");
  div.innerHTML = string;
  const elem = div.firstElementChild;
  if (!elem) {
    throw new Error("No element found in string");
  }

  replaceTextInElement(elem, replacements);
  if (options.type === "input") {
    elem.setAttribute("data-ty", "input");
  }
  if (options.prompt) {
    elem.setAttribute("data-ty-prompt", options.prompt);
  }
  if (options.carriageReturn) {
    elem.setAttribute("data-ty-carriageReturn", "true");
  }
  return elem.outerHTML;
}

function applyReplacements(
  string: string,
  replacements: Replacement[]
): string {
  return replacements.reduce(
    (acc, replacement) =>
      acc.replace(replacement.searchValue, replacement.replaceValue),
    string
  );
}

function replaceTextInElement(
  element: ChildNode,
  replacements: Replacement[]
): void {
  for (const childElem of element.childNodes) {
    if (childElem.childNodes.length > 0) {
      // Not the bottom of the tree yet, recurse
      replaceTextInElement(childElem, replacements);
    } else {
      // No child elements, replace text content
      const textContent = childElem.textContent;
      childElem.textContent = applyReplacements(
        textContent ?? "",
        replacements
      );
    }
  }
}
