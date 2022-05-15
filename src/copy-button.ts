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
  const popUp = createSuccessfulCopyPopUp();
  button.addEventListener("click", () => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        if (!button.parentElement) {
          throw new Error("button was clicked but has no parent");
        }
        button.parentElement.appendChild(popUp);
        setTimeout(() => {
          if (button.parentElement) {
            button.parentElement.removeChild(popUp);
          }
        }, 2000);
      })
      .catch(console.error);
  });
  return button;
}

function createSuccessfulCopyPopUp(): HTMLElement {
  const popUp = document.createElement("div");
  popUp.setAttribute("data-terminal-copy-popup", "true");
  popUp.appendChild(document.createTextNode("Copied!"));
  return popUp;
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
