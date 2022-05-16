import {
  createCopyToClipboardButton,
  createEventListenerToToggleCopyToClipboardVisibility,
} from "./copy-button";
import { createPromptElement } from "./prompt";

type TransformInputForDisplayOutputs = {
  typingArea: HTMLElement;
  copyButton: HTMLElement;
  chars: string[];
};

export function prepareEmptyInputLine(
  line: HTMLElement,
  pfx: string
): TransformInputForDisplayOutputs {
  const text = line.textContent ?? "";
  const chars = [...text];
  line.textContent = "";
  const copyButton = createCopyToClipboardButton(text, {
    visible: false,
    buttonPfx: "line",
  });
  const promptText = line.getAttribute(`${pfx}-prompt`);
  const prompt = createPromptElement(promptText);
  const typingArea = document.createElement("span");
  createEventListenerToToggleCopyToClipboardVisibility(line, copyButton);
  line.appendChild(prompt);
  line.appendChild(typingArea);
  return { chars, typingArea, copyButton };
}
