import { findByText } from "@testing-library/dom";
import { expect, it } from "vitest";
import { prepareEmptyInputLine } from "../src/prepare-input-line";

it("displays the default prompt", async () => {
  const line = document.createElement("span");
  prepareEmptyInputLine(line, "data-ty");
  const prompt = await findByText(line, "$");
  expect(prompt.hasAttribute("data-terminal-prompt-start")).toBe(true);
});
