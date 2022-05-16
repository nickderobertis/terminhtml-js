import { createEventListenerToToggleCopyToClipboardVisibility } from "./copy-button";
import { getElementFromSelectorOrElement } from "./dom-utils";
import { prepareEmptyInputLine } from "./prepare-input-line";
import type { LineData } from "./lines";
import { createElementFromLineData } from "./lines";
import { createTopBar, linesToCopyText } from "./top-bar";
import {
  transformLineForDisplay,
  TransformLineForDisplayOptions,
} from "./line-display";
import { BottomBar, createBottomBar } from "./bottom-bar";

/*
 * Custom options for Termynal
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
   * Character to use for cursor, defaults to ▋.
   */
  cursor: string;
  /**
   * Don't initialise the animation.
   */
  noInit: boolean;
  /**
   * Enable automatic scrolling to the bottom of the terminal until the
   * user scrolls up.
   */
  autoScroll: boolean;
  /**
   * Element containing TerminHTML or user-provided branding
   */
  brandingElement: HTMLElement;
}>;

const autoScrollBottomBufferPx = 5;

/** Generate a terminal widget. */
export class Termynal {
  /**
   * Outer container for the terminal to where all styling extends.
   */
  container: HTMLElement;
  /**
   * Inner container element for only the printed lines.
   */
  linesContainer: HTMLElement;
  /**
   * Element for the top bar of the terminal.
   */
  topBar: HTMLElement;
  /**
   * Bottom bar of the terminal: contains the element and functions to control it.
   */
  bottomBar: BottomBar;
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
  cursor: string;
  lines: HTMLElement[];
  startDelay = 600;
  typeDelay = 90;
  lineDelay = 1500;
  autoScroll: boolean;
  origAutoScroll: boolean;
  speedMultiplier = 1;
  copyText: string;

  /**
   *
   * @param container Query selector or container element.
   * @param options Custom settings.
   */
  constructor(
    container: string | HTMLElement = "#termynal",
    lineData: LineData[] = [],
    options: TermynalOptions = {}
  ) {
    this.container = getElementFromSelectorOrElement(container);
    this.container.setAttribute("data-termynal", "");
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
    this.cursor =
      options.cursor ||
      this.container.getAttribute(`${this.pfx}-cursor`) ||
      "▋";
    this.autoScroll =
      typeof options.autoScroll === "undefined" ? true : options.autoScroll;
    this.origAutoScroll = this.autoScroll;
    this.lines = this._lineDataToElements(lineData);
    this.linesContainer = this._generateLinesContainer();
    const brandingElement =
      options.brandingElement ?? document.createElement("span");
    this.bottomBar = this._generateBottomBar(brandingElement);
    this.copyText = linesToCopyText(this.lines, this.pfx);
    const { topBar, copyButton } = createTopBar({ copyText: this.copyText });
    this.topBar = topBar;
    createEventListenerToToggleCopyToClipboardVisibility(
      this.container,
      copyButton
    );
    this.container.innerHTML = "";
    if (!options.noInit) this.init();
  }

  // TODO: If user calls init multiple times, multiple start processes will be running
  //  at the same time overriding each others' output.
  /**
   * Initialise the widget, get lines, clear container and start animation.
   */
  init(): void {
    this._wipeLines();
    this._start().catch(e => console.error(e));
  }

  private _wipeLines(): void {
    this.container.innerHTML = "";
    this.linesContainer.innerHTML = "";
    this.container.appendChild(this.topBar);
    this.container.appendChild(this.linesContainer);
    this.container.appendChild(this.bottomBar.element);
    this.bottomBar.switchToSpeedControl();
  }

  private _scrollToBottom(): void {
    if (this.autoScroll) {
      this.linesContainer.scrollTop = this.linesContainer.scrollHeight;
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
      this.linesContainer.scrollHeight -
      this.linesContainer.scrollTop -
      this.linesContainer.clientHeight
    );
  }

  private _isAtBottom(): boolean {
    return this._distanceFromBottom() <= autoScrollBottomBufferPx;
  }

  /**
   * Start the animation and render the lines depending on their data attributes.
   */
  private async _start(): Promise<void> {
    await this._wait(this.startDelay);

    // Copy lines so that we can freely modify them and then restart the animation
    // without worrying about the original lines being modified.
    const lines = this.lines.map(line => line.cloneNode(true) as HTMLElement);

    for (const line of lines) {
      const type = line.getAttribute(this.pfx);
      const delay = line.getAttribute(`${this.pfx}-delay`) || this.lineDelay;
      const carriageReturn = !!line.getAttribute(`${this.pfx}-carriageReturn`);

      this._toggleAutoScrollBasedOnUserInteraction();

      if (type == "input") {
        line.setAttribute(`${this.pfx}-cursor`, this.cursor);
        await this._type(line);
        await this._wait(delay);
      } else {
        this._addLine(line);
        this._scrollToBottom();
        await this._wait(delay);
      }

      // TODO: Shouldn't handle carriage return on last line
      if (carriageReturn) {
        this.linesContainer.removeChild(line);
      }

      line.removeAttribute(`${this.pfx}-cursor`);
    }
    this.bottomBar.switchToRestart();
    this.lineDelay = this.originalLineDelay;
    this.typeDelay = this.originalTypeDelay;
    this.startDelay = this.originalStartDelay;
  }

  private _generateBottomBar(brandingElement: HTMLElement): BottomBar {
    const onSpeedUp = () => {
      this.speedMultiplier = this.speedMultiplier * 2;
      return this.speedMultiplier;
    };
    const onSlowDown = () => {
      this.speedMultiplier = this.speedMultiplier / 2;
      return this.speedMultiplier;
    };
    const onRestart = () => {
      this.init();
    };

    return createBottomBar({
      brandingElement,
      onSpeedUp,
      onSlowDown,
      onRestart,
    });
  }

  private _generateLinesContainer(): HTMLElement {
    const linesContainer = document.createElement("div");
    linesContainer.setAttribute("data-termynal-lines", "");
    return linesContainer;
  }

  private _addLine(
    line: HTMLElement,
    options?: TransformLineForDisplayOptions
  ): HTMLElement {
    const { outputArea } = transformLineForDisplay(line, options);
    this.linesContainer.appendChild(line);
    const typingArea = outputArea.lastChild as HTMLElement;
    return typingArea;
  }

  /**
   * Animate a typed line.
   * @param line - The line element to render.
   */
  private async _type(line: HTMLElement): Promise<void> {
    const { chars, copyButton } = prepareEmptyInputLine(line, this.pfx);
    const typingArea = this._addLine(line, { copyButton });
    this._scrollToBottom();

    for (const char of chars) {
      const delay =
        line.getAttribute(`${this.pfx}-typeDelay`) || this.typeDelay;
      await this._wait(delay);
      this._toggleAutoScrollBasedOnUserInteraction();
      typingArea.textContent += char;
      this._scrollToBottom();
    }
  }

  /**
   * Helper function for animation delays, called with `await`.
   * @param time - Timeout, in ms.
   */
  private _wait(time: number | string): Promise<void> {
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
  private _lineDataToElements(lineData: LineData[]): HTMLElement[] {
    const createElement = (line: LineData) =>
      createElementFromLineData(line, this.customPfx);
    return lineData.map(createElement);
  }
}
