import { describe, it, expect } from "vitest";
import TerminHTML from "../src";
import "../src/termynal.css";

type ElemAndTerm = {
  element: HTMLElement;
  term: TerminHTML;
};

function createTerminHTMLBlock(): ElemAndTerm {
  const pre = document.createElement("pre");
  const inputSpan = document.createElement("span");
  inputSpan.textContent = "$ echo woo";
  const outputSpan = document.createElement("span");
  outputSpan.textContent = "woo";
  pre.appendChild(inputSpan);
  pre.appendChild(outputSpan);
  const term = new TerminHTML(pre);
  document.body.appendChild(pre);
  return { element: pre, term };
}

describe("index", () => {
  describe("TerminHTML", () => {
    it("creates a blank, uninitialized terminal", () => {
      const { element } = createTerminHTMLBlock();
      expect(element.hasAttribute("data-termynal")).toBe(true);
    });
  });
});
