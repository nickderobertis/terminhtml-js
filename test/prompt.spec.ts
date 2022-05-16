import { expect, it } from "vitest";
import { createPromptElement } from "../src/prompt";

it("displays the default prompt when no text is passed", () => {
  const prompt = createPromptElement();
  expect(prompt.textContent).toEqual("$ ");
});

it("displays the passed text when text is passed", () => {
  const customPrompt = "> ";
  const prompt = createPromptElement(customPrompt);
  expect(prompt.textContent).toEqual(customPrompt);
});
