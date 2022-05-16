export type TransformLineForDisplayOptions = {
  copyButton?: HTMLElement;
};

type TransformedLineOutput = {
  outputArea: HTMLElement;
};

export function transformLineForDisplay(
  line: HTMLElement,
  options?: TransformLineForDisplayOptions
): TransformedLineOutput {
  const { copyButton } = options ?? {};
  const spacer = document.createElement("span");
  spacer.setAttribute("data-terminal-line-spacer", "");
  if (copyButton) {
    spacer.appendChild(copyButton);
  }
  const outputArea = document.createElement("span");
  outputArea.setAttribute("data-terminal-line-output-area", "");
  outputArea.innerHTML = line.innerHTML;
  line.innerHTML = "";
  line.appendChild(spacer);
  line.appendChild(outputArea);
  return { outputArea };
}
