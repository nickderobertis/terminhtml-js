type CopyToClipboardButtonOptions = {
  visible: boolean;
  buttonPfx: string;
  popUpText: string;
};

const defaultCopyToClipboardButtonOptions: CopyToClipboardButtonOptions = {
  visible: true,
  buttonPfx: "line",
  popUpText: "Copied!",
};

export function createCopyToClipboardButton(
  text: string,
  options: Partial<CopyToClipboardButtonOptions> = defaultCopyToClipboardButtonOptions
): HTMLElement {
  const { visible, buttonPfx, popUpText } = {
    ...defaultCopyToClipboardButtonOptions,
    ...options,
  };
  const button = document.createElement("button");
  button.setAttribute(`data-terminal-${buttonPfx}-copy-button`, "true");
  button.setAttribute(`data-terminal-copy-button`, "true");
  button.setAttribute("aria-label", "Copy to clipboard");
  if (!visible) {
    button.style.visibility = "hidden";
  }
  const icon = createCopyButtonIcon();
  button.appendChild(icon);
  const popUp = createSuccessfulCopyPopUp(buttonPfx, { text: popUpText });
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

type PopUpOptions = {
  text: string;
};

const defaultPopUpOptions: PopUpOptions = {
  text: "Copied!",
};

function createSuccessfulCopyPopUp(
  buttonPfx: string,
  options: Partial<PopUpOptions> = defaultPopUpOptions
): HTMLElement {
  const { text } = { ...defaultPopUpOptions, ...options };
  const popUp = document.createElement("div");
  popUp.setAttribute("data-terminal-copy-popup", "true");
  popUp.setAttribute(`data-terminal-${buttonPfx}-copy-popup`, "true");
  popUp.appendChild(document.createTextNode(text));
  return popUp;
}

function createCopyButtonIcon(): HTMLElement {
  const iconContainer = document.createElement("div");
  iconContainer.innerHTML = `
<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-copy" viewBox="0 0 24 24" stroke-width="1.5" stroke="#000000" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <title>Copy to clipboard</title>
  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
  <rect x="8" y="8" width="12" height="12" rx="2"></rect>
  <path d="M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2"></path>
</svg>
`;
  return iconContainer.firstElementChild as HTMLElement;
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
