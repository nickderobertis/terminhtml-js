/**
 * termynal.js
 * A lightweight, modern and extensible animated terminal window, using
 * async/await.
 *
 * @author Ines Montani <ines@ines.io>
 * @version 0.0.1
 * @license MIT
 */

import {
  getElementFromSelectorOrElement,
  stringHasHTMLElements,
} from "./dom-utils";

export type LineData = Partial<{
  value: string;
  class: string;
  delay: number;
  prompt: string;
  type: "input" | "progress";
  carriageReturn: boolean;
}>;

/*
 * Custom options for termynal.js
 */
export type TermynalOptions = Partial<{
  /**
   * Prefix to use for data attributes.
   */
  prefix: string;
  /**
   * Delay before animation, in ms.
   */
  startDelay: number;
  /**
   * Delay between each typed character, in ms.
   */
  typeDelay: number;
  /**
   * Delay between each line, in ms.
   */
  lineDelay: number;
  /**
   * Number of characters displayed as progress bar.
   */
  progressLength: number;
  /**
   * Character to use for progress bar, defaults to █.
   */
  progressChar: string;
  /**
   * Max percent of progress.
   */
  progressPercent: number;
  /**
   * Character to use for cursor, defaults to ▋.
   */
  cursor: string;
  /**
   * Dynamically loaded line data objects.
   */
  lineData: LineData[];
  /**
   * Don't initialise the animation.
   */
  noInit: boolean;
  /**
   * Enable automatic scrolling to the bottom of the terminal until the
   * user scrolls up.
   */
  autoScroll: boolean;
}>;

const autoScrollBottomBufferPx = 5;

/** Generate a terminal widget. */
export class Termynal {
  container: HTMLElement;
  /**
   * The prefix for attributes to control Termynal, including data-.
   * Defaults to "data-ty".
   */
  pfx: string;
  /**
   * The custom part of the prefix for attributes to control Termynal, excluding data-.
   * Defaults to "ty".
   */
  customPfx: string;
  originalStartDelay: number;
  originalTypeDelay: number;
  originalLineDelay: number;
  progressLength: number;
  progressChar: string;
  progressPercent: number;
  cursor: string;
  lines: HTMLElement[];
  startDelay = 600;
  typeDelay = 90;
  lineDelay = 1500;
  autoScroll: boolean;
  origAutoScroll: boolean;
  speedControlElement?: HTMLSpanElement;
  speedMultiplier = 1;

  /**
   *
   * @param container Query selector or container element.
   * @param options Custom settings.
   */
  constructor(
    container: string | HTMLElement = "#termynal",
    options: TermynalOptions = {}
  ) {
    this.container = getElementFromSelectorOrElement(container);
    this.customPfx = options.prefix ?? "ty";
    this.pfx = `data-${this.customPfx}`;
    this.originalStartDelay =
      options.startDelay ||
      parseFloat(this.container.getAttribute(`${this.pfx}-startDelay`) ?? "") ||
      600;
    this.originalTypeDelay =
      options.typeDelay ||
      parseFloat(this.container.getAttribute(`${this.pfx}-typeDelay`) ?? "") ||
      90;
    this.originalLineDelay =
      options.lineDelay ||
      parseFloat(this.container.getAttribute(`${this.pfx}-lineDelay`) ?? "") ||
      1500;
    this.progressLength =
      options.progressLength ||
      parseFloat(
        this.container.getAttribute(`${this.pfx}-progressLength`) || ""
      ) ||
      40;
    this.progressChar =
      options.progressChar ||
      this.container.getAttribute(`${this.pfx}-progressChar`) ||
      "█";
    this.progressPercent =
      options.progressPercent ||
      parseFloat(
        this.container.getAttribute(`${this.pfx}-progressPercent`) ?? ""
      ) ||
      100;
    this.cursor =
      options.cursor ||
      this.container.getAttribute(`${this.pfx}-cursor`) ||
      "▋";
    this.autoScroll =
      typeof options.autoScroll === "undefined" ? true : options.autoScroll;
    this.origAutoScroll = this.autoScroll;
    this.lines = this.lineDataToElements(options.lineData || []);
    this.loadLines();
    this.container.innerHTML = "";
    if (!options.noInit) this.init();
  }

  loadLines(): void {
    // Load all the lines and create the container so that the size is fixed
    // Otherwise it would be changing and the user viewport would be constantly
    // moving as she/he scrolls
    const speedControl = this._generateSpeedControl();
    speedControl.style.visibility = "hidden";
    this.container.appendChild(speedControl);
    for (const line of this.lines) {
      line.style.visibility = "hidden";
      this.container.appendChild(line);
    }
    const restart = this.generateRestart();
    restart.style.visibility = "hidden";
    this.container.appendChild(restart);
    this.container.setAttribute("data-termynal", "");
  }

  // TODO: If user calls init multiple times, multiple start processes will be running
  //  at the same time overriding each others' output.
  /**
   * Initialise the widget, get lines, clear container and start animation.
   */
  init(): void {
    /**
     * Calculates width and height of Termynal container.
     * If container is empty and lines are dynamically loaded, defaults to browser `auto` or CSS.
     */
    const containerStyle = getComputedStyle(this.container);
    const width =
      containerStyle.width !== "0px" ? containerStyle.width : undefined;
    if (width) {
      this.container.style.width = width;
    }
    const minHeight =
      containerStyle.minHeight !== "0px" ? containerStyle.height : undefined;
    if (minHeight) {
      this.container.style.minHeight = minHeight;
    }

    this.container.setAttribute("data-termynal", "");
    this.container.innerHTML = "";
    for (const line of this.lines) {
      line.style.visibility = "visible";
    }
    this.start().catch(e => console.error(e));
  }

  private _scrollToBottom(): void {
    if (this.autoScroll) {
      this.container.scrollTop = this.container.scrollHeight;
    }
  }

  private _toggleAutoScrollBasedOnUserInteraction(): void {
    // Check if scroll height is not at bottom. If so, this means the user
    // has scrolled up and we should not keep sticking the scroll to the bottom.
    if (!this._isAtBottom()) {
      this.autoScroll = false;
    } else {
      // User has not interacted with the terminal or put it back on the bottom,
      // go back to the originally set behavior
      this.autoScroll = this.origAutoScroll;
    }
  }

  private _distanceFromBottom(): number {
    return (
      this.container.scrollHeight -
      this.container.scrollTop -
      this.container.clientHeight
    );
  }

  private _isAtBottom(): boolean {
    return this._distanceFromBottom() <= autoScrollBottomBufferPx;
  }

  /**
   * Start the animation and render the lines depending on their data attributes.
   */
  async start(): Promise<void> {
    this.addFinish();
    await this._wait(this.startDelay);

    for (const line of this.lines) {
      const type = line.getAttribute(this.pfx);
      const delay = line.getAttribute(`${this.pfx}-delay`) || this.lineDelay;
      const carriageReturn = !!line.getAttribute(`${this.pfx}-carriageReturn`);

      this._toggleAutoScrollBasedOnUserInteraction();

      if (type == "input") {
        line.setAttribute(`${this.pfx}-cursor`, this.cursor);
        await this.type(line);
        await this._wait(delay);
      } else if (type == "progress") {
        await this.progress(line);
        await this._wait(delay);
      } else {
        this.container.appendChild(line);
        this._scrollToBottom();
        await this._wait(delay);
      }

      // TODO: Shouldn't handle carriage return on last line
      if (carriageReturn) {
        this.container.removeChild(line);
      }

      line.removeAttribute(`${this.pfx}-cursor`);
    }
    this.addRestart();
    if (this.speedControlElement) {
      this.speedControlElement.style.visibility = "hidden";
    }
    this.lineDelay = this.originalLineDelay;
    this.typeDelay = this.originalTypeDelay;
    this.startDelay = this.originalStartDelay;
  }

  generateRestart(): HTMLAnchorElement {
    const restart = document.createElement("a");
    restart.onclick = e => {
      e.preventDefault();
      this.container.innerHTML = "";
      this.init();
    };
    restart.href = "#";
    restart.setAttribute("data-terminal-control", "");
    restart.innerHTML = "restart ↻";
    return restart;
  }

  private _generateSpeedControl(): HTMLSpanElement {
    const speedControlContainer = document.createElement("span");
    speedControlContainer.setAttribute(
      "data-terminal-speed-control-container",
      ""
    );
    const speedControl = document.createElement("span");
    speedControl.setAttribute("data-terminal-speed-control", "");
    const slowDown = document.createElement("a");
    const label = document.createElement("span");
    slowDown.onclick = e => {
      e.preventDefault();
      console.log("slow down");
      this.speedMultiplier = this.speedMultiplier / 2;
      label.innerHTML = `${this.speedMultiplier}x`;
    };
    slowDown.innerHTML = "◄";
    slowDown.setAttribute("data-terminal-control", "");
    speedControl.appendChild(slowDown);
    label.innerHTML = `${this.speedMultiplier}x`;
    speedControl.appendChild(label);
    const speedUp = document.createElement("a");
    speedUp.onclick = e => {
      e.preventDefault();
      console.log("speed up");
      this.speedMultiplier = this.speedMultiplier * 2;
      label.innerHTML = `${this.speedMultiplier}x`;
    };
    speedUp.innerHTML = "►";
    speedUp.setAttribute("data-terminal-control", "");
    speedControl.appendChild(speedUp);
    speedControlContainer.appendChild(speedControl);
    this.speedControlElement = speedControlContainer;
    return speedControlContainer;
  }

  addRestart() {
    const restart = this.generateRestart();
    this.container.appendChild(restart);
  }

  addFinish() {
    const finish = this._generateSpeedControl();
    this.container.appendChild(finish);
  }

  /**
   * Animate a typed line.
   * @param line - The line element to render.
   */
  async type(line: HTMLElement): Promise<void> {
    const chars = [...(line.textContent || "")];
    line.textContent = "";
    this.container.appendChild(line);
    this._scrollToBottom();

    for (const char of chars) {
      const delay =
        line.getAttribute(`${this.pfx}-typeDelay`) || this.typeDelay;
      await this._wait(delay);
      line.textContent += char;
    }
  }

  /**
   * Animate a progress bar.
   * @param line - The line element to render.
   */
  async progress(line: HTMLElement): Promise<void> {
    const progressLength =
      parseFloat(line.getAttribute(`${this.pfx}-progressLength`) ?? "") ||
      this.progressLength;
    const progressChar =
      line.getAttribute(`${this.pfx}-progressChar`) || this.progressChar;
    const chars = progressChar.repeat(progressLength);
    const progressPercent =
      line.getAttribute(`${this.pfx}-progressPercent`) || this.progressPercent;
    line.textContent = "";
    this.container.appendChild(line);

    for (let i = 1; i < chars.length + 1; i++) {
      await this._wait(this.typeDelay);
      const percent = Math.round((i / chars.length) * 100);
      line.textContent = `${chars.slice(0, i)} ${percent}%`;
      if (percent > progressPercent) {
        break;
      }
    }
  }

  /**
   * Helper function for animation delays, called with `await`.
   * @param time - Timeout, in ms.
   */
  _wait(time: number | string): Promise<void> {
    const useTime = typeof time === "string" ? parseFloat(time) : time;
    const multipliedTime = useTime / this.speedMultiplier;
    return new Promise(resolve => setTimeout(resolve, multipliedTime));
  }

  /**
   * Converts line data objects into line elements.
   *
   * @param lineData - Dynamically loaded lines.
   * @returns Array of line elements.
   */
  lineDataToElements(lineData: LineData[]): HTMLElement[] {
    return lineData.map(line => {
      const div = document.createElement("div");
      const useValue = line.value ?? "";
      div.innerHTML = stringIsHTMLElementWithRelevantData(
        useValue,
        this.customPfx
      )
        ? useValue
        : `<span ${this._attributes(line)}>${useValue}</span>`;

      return div.firstElementChild as HTMLElement;
    });
  }

  /**
   * Helper function for generating attributes string.
   *
   * @param line - Line data object.
   * @returns {string} - String of attributes.
   */
  _attributes(line: Record<string, any>): string {
    let attrs = "";
    for (const prop in line) {
      attrs += this.pfx;

      if (prop === "type") {
        const attrValue: string = line[prop];
        attrs += `="${attrValue}" `;
      } else if (prop !== "value") {
        const attrValue: string = line[prop];
        attrs += `-${prop}="${attrValue}" `;
      }
    }

    return attrs;
  }
}

function camelCase(str: string): string {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
    if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
    return index === 0 ? match.toLowerCase() : match.toUpperCase();
  });
}

function stringIsHTMLElementWithRelevantData(
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
  const camelCasePrefix = camelCase(prefix);
  for (const prop in element.dataset) {
    if (prop.startsWith(camelCasePrefix)) {
      return true;
    }
  }
  return false;
}
