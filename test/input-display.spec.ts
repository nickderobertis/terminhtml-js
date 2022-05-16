import { findByLabelText, findByText, fireEvent } from "@testing-library/dom";
import { expect, it } from "vitest";
import { transformInputLineForDisplay } from "../src/input-display";
import { spyOnClipboard } from "./utils/spy-clipboard";

it("copies the input text to clipboard when the copy button is clicked", async () => {
  const copySpy = spyOnClipboard();
  const text = "echo woo";
  const line = document.createElement("span");
  line.textContent = text;
  transformInputLineForDisplay(line, "data-ty");
  const copyButton = await findByLabelText(line, "Copy to clipboard");
  fireEvent.click(copyButton);

  expect(copySpy).toHaveBeenCalledWith(text);
});

it("displays the default prompt", async () => {
  const line = document.createElement("span");
  transformInputLineForDisplay(line, "data-ty");
  const prompt = await findByText(line, "$");
  expect(prompt.hasAttribute("data-terminal-prompt-start")).toBe(true);
});
