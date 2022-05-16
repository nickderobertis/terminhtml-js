import { describe, expect, it } from "vitest";
import { createCopyToClipboardButton } from "../src/copy-button";
import { spyOnClipboard } from "./utils/spy-clipboard";

describe("copy button", () => {
  const copySpy = spyOnClipboard();
  it("copies text to clipboard when clicked", () => {
    const text = "hello";
    const copyButton = createCopyToClipboardButton(text);
    copyButton.click();
    expect(copySpy).toHaveBeenCalledWith(text);
  });
});
