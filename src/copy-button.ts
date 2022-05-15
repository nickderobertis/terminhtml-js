export function createCopyToClipboardButton(
  text: string,
  visible = true
): HTMLElement {
  const button = document.createElement("button");
  button.setAttribute(`data-terminal-copy-button`, "true");
  if (!visible) {
    button.style.visibility = "hidden";
  }
  button.appendChild(document.createTextNode("📋"));
  button.addEventListener("click", () => {
    console.log(`copying ${text} to clipboard`);
    navigator.clipboard.writeText(text).catch(console.error);
  });
  return button;
}

type RemoveListenersCallback = () => void;

export function createEventListenerToToggleCopyToClipboardVisibility(
  parentElement: HTMLElement,
  copyButton: HTMLElement
): RemoveListenersCallback {
  function toggleCopyButtonVisibility() {
    const isVisible = copyButton.style.visibility !== "hidden";
    copyButton.style.visibility = isVisible ? "hidden" : "";
  }
  parentElement.addEventListener("mouseover", toggleCopyButtonVisibility);
  parentElement.addEventListener("mouseout", toggleCopyButtonVisibility);

  function removeListeners() {
    parentElement.removeEventListener("mouseover", toggleCopyButtonVisibility);
    parentElement.removeEventListener("mouseout", toggleCopyButtonVisibility);
  }
  return removeListeners;
}
