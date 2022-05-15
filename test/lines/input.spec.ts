import { describe, expect, it } from "vitest";
import { createInputElementFromLineData } from "../../src/lines/input";

describe("createElementFromLineData input elements", () => {
  it("converts a string input to an HTML element", () => {
    const value = "echo woo";
    const element = createInputElementFromLineData({ value, type: "input" });
    expect(element.textContent).toBe(value);
    expect(element.getAttribute("data-ty")).toEqual("input");
  });

  it("hoists HTML values to outer HTML element", () => {
    const value = `<span data-ty="input" data-ty-carriageReturn="true" data-ty-delay="100" data-irrelevant="yes">hello</span>`;
    const element = createInputElementFromLineData({ value, type: "input" });
    expect(element.innerHTML).toBe("hello");
    expect(element.getAttribute("data-ty")).toEqual("input");
    expect(element.getAttribute("data-ty-carriageReturn")).toEqual("true");
    expect(element.getAttribute("data-ty-delay")).toEqual("100");
    expect(element.getAttribute("data-irrelevant")).toBe("yes");
  });
});
