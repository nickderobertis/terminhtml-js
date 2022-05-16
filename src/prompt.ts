export function createPromptElement(text?: string | null): HTMLElement {
  const prompt = document.createElement("span");
  prompt.setAttribute("data-terminal-prompt-start", "");
  prompt.appendChild(document.createTextNode(text ?? "$ "));
  return prompt;
}
