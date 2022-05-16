import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { findByText, fireEvent, queryByText } from "@testing-library/dom";
import TerminHTML from "../src";
import "../src/termynal.css";

type ElemAndTerm = {
  element: HTMLElement;
  term: TerminHTML;
};

function createHTMLTerminHTMLBlock(): ElemAndTerm {
  const pre = document.createElement("pre");
  const inputSpan = document.createElement("span");
  inputSpan.textContent = "$ echo woo";
  const outputSpan = document.createElement("span");
  outputSpan.textContent = "woo";
  pre.appendChild(inputSpan);
  // Create a text node to force a line break
  pre.appendChild(document.createTextNode("\n"));
  pre.appendChild(outputSpan);
  const term = new TerminHTML(pre);
  document.body.appendChild(pre);
  return { element: pre, term };
}

function createTextTerminHTMLBlock(): ElemAndTerm {
  const pre = document.createElement("pre");
  pre.textContent = "$ echo woo\nwoo";
  const term = new TerminHTML(pre);
  document.body.appendChild(pre);
  return { element: pre, term };
}

async function expectTerminHTMLToInitialize(element: HTMLElement) {
  // Check for speed control
  await findByText(element, "1x");
  // Check for branding
  await findByText(element, "Created with");
  // Animation has not run, so input and output do not exist yet
  expect(queryByText(element, "echo woo")).toBeNull();
  expect(queryByText(element, "woo")).toBeNull();

  await waitForAnimation();

  // Check for input displayed
  const inputTextElem = await findByText(element, "echo woo");
  const inputElem = inputTextElem.parentElement?.parentElement as HTMLElement;
  expect(inputElem.getAttribute("data-ty")).toEqual("input");
  // Check for output displayed
  const outputElem = await findByText(element, "woo");
  expect(outputElem.getAttribute("data-ty")).toBeFalsy();
}

async function waitForAnimation() {
  vi.runAllTimers();
  for (let i = 0; i < 100; i++) {
    await new Promise(resolve => {
      setTimeout(resolve, 5);
      vi.runAllTimers();
    });
  }
}

describe("TerminHTML", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("creates a blank, uninitialized terminal", () => {
    const { element } = createHTMLTerminHTMLBlock();
    expect(element.hasAttribute("data-termynal")).toBe(true);
  });

  it("initializes the terminal with text", async () => {
    const { element, term } = createTextTerminHTMLBlock();
    term.init();
    await expectTerminHTMLToInitialize(element);
  });

  it("initializes the terminal with HTML", async () => {
    const { element, term } = createHTMLTerminHTMLBlock();
    term.init();
    await expectTerminHTMLToInitialize(element);
  });

  it("restarts the terminal", async () => {
    const { element, term } = createTextTerminHTMLBlock();
    term.init();
    await expectTerminHTMLToInitialize(element);
    const restart = await findByText(element, "restart ↻");
    fireEvent.click(restart);
    // Animation has been reset, so input and output do not exist yet
    expect(queryByText(element, "echo woo")).toBeNull();
    expect(queryByText(element, "woo")).toBeNull();
    await expectTerminHTMLToInitialize(element);
  });
});
