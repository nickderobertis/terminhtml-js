import { expect, it } from "vitest";
import { findByLabelText, fireEvent } from "@testing-library/dom";
import { createTopBar } from "../src/top-bar";
import { spyOnClipboard } from "./utils/spy-clipboard";

it("copies the passed text to clipboard when the copy button is clicked", async () => {
  const copySpy = spyOnClipboard();
  const text = "hello";
  const { topBar } = createTopBar({ copyText: text });
  const copyButton = await findByLabelText(topBar, "Copy to clipboard");
  fireEvent.click(copyButton);

  expect(copySpy).toHaveBeenCalledWith(text);
});
