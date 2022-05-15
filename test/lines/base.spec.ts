import { describe, expect, it } from "vitest";
import { lineDataToBasicElement } from "../../src/lines/base";

describe("lineDataToBasicElement", () => {
  it("converts a string value to an HTML element", () => {
    const value = "hello";
    const element = lineDataToBasicElement({ value });
    expect(element.textContent).toBe(value);
    expect(element.hasAttribute("data-ty")).toBe(true);
  });

  it("hoists HTML values with relevant data to outer HTML element", () => {
    const value = `<span data-ty-carriageReturn="true" data-ty-delay="100" data-irrelevant="yes">hello</span>`;
    const element = lineDataToBasicElement({ value });
    expect(element.innerHTML).toBe("hello");
    expect(element.getAttribute("data-ty-carriageReturn")).toEqual("true");
    expect(element.getAttribute("data-ty-delay")).toEqual("100");
    expect(element.getAttribute("data-irrelevant")).toBe("yes");
  });

  it("does not hoist HTML values without relevant data to outer HTML element", () => {
    const value = `<span data-irrelevant="yes">hello</span>`;
    const element = lineDataToBasicElement({ value });
    expect(element.innerHTML).toBe(value);
  });
});
