import { describe, expect, it, vi } from "vitest";
import { createCopyToClipboardButton } from "../src/copy-button";

Object.assign(navigator, {
  clipboard: {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    writeText: () => {},
  },
});

describe("copy button", () => {
  const copySpy = vi.spyOn(navigator.clipboard, "writeText");
  copySpy.mockImplementation(() => Promise.resolve());
  it("copies text to clipboard when clicked", () => {
    const text = "hello";
    const copyButton = createCopyToClipboardButton(text);
    copyButton.click();
    expect(copySpy).toHaveBeenCalledWith(text);
  });
});
