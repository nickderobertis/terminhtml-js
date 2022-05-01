import { getElementFromSelectorOrElement } from "./dom-utils";
import { LineData, Termynal, TermynalOptions } from "./termynal";

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
};

/**
 * Default options for TerminHTML. The other options' defaults are
 * set internally by Termnyal.
 */
const defaultOptions: TerminHTMLOptions = {
  promptLiteralStart: "$ ",
  customPromptLiteralStart: "# ",
  initNow: false,
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
      lineData,
    };
    this.termynal = new Termynal(container, termynalOptions);
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
      } else if (line.startsWith(this.options.promptLiteralStart)) {
        lineData.push({
          type: "input",
          value: line.replace(this.options.promptLiteralStart, "").trimEnd(),
        });
      } else if (line.startsWith(this.options.customPromptLiteralStart)) {
        const promptStart = line.indexOf(this.options.promptLiteralStart);
        if (promptStart === -1) {
          console.error("Custom prompt found but no end delimiter", line);
        }
        const prompt = line
          .slice(0, promptStart)
          .replace(this.options.customPromptLiteralStart, "");
        let value = line.slice(
          promptStart + this.options.promptLiteralStart.length
        );
        lineData.push({
          type: "input",
          value,
          prompt,
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
