import { findByLabelText, fireEvent } from "@testing-library/dom";
import { expect, it } from "vitest";
import { createCopyToClipboardButton } from "../src/copy-button";
import { transformLineForDisplay } from "../src/line-display";
import { spyOnClipboard } from "./utils/spy-clipboard";

it("copies the input text to clipboard when the copy button is clicked", async () => {
  const copySpy = spyOnClipboard();
  const text = "echo woo";
  const line = document.createElement("span");
  line.textContent = text;
  const copyButton = createCopyToClipboardButton(text);
  transformLineForDisplay(line, { copyButton });
  const copyButtonElem = await findByLabelText(line, "Copy to clipboard");
  fireEvent.click(copyButtonElem);

  expect(copySpy).toHaveBeenCalledWith(text);
});
