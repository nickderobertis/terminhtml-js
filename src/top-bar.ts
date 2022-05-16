import { createCopyToClipboardButton } from "./copy-button";

type TopBarProps = {
  copyText: string;
};

type TopBarParts = {
  topBar: HTMLElement;
  copyButton: HTMLElement;
};

export function createTopBar({ copyText }: TopBarProps): TopBarParts {
  const topBar = document.createElement("div");
  topBar.setAttribute("data-terminal-top-bar", "");
  const copyButton = createCopyToClipboardButton(copyText, {
    buttonPfx: "top-bar",
    visible: false,
    popUpText: "Copied all input!",
  });
  topBar.appendChild(copyButton);
  return { topBar, copyButton };
}

export function linesToCopyText(lines: HTMLElement[], pfx: string): string {
  const linesText = lines
    .filter(line => line.getAttribute(pfx) === "input")
    .map(line => line.innerText);
  return linesText.join("\n");
}
