export function createCopyToClipboardButton(text: string): HTMLElement {
  const button = document.createElement("button");
  button.appendChild(document.createTextNode("📋"));
  button.addEventListener("click", () => {
    console.log(`copying ${text} to clipboard`);
    navigator.clipboard.writeText(text).catch(console.error);
  });
  return button;
}
