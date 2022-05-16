import { createRestartButton } from "./restart";
import { createSpeedControl } from "./speed-control";

export type BottomBarOptions = {
  brandingElement: HTMLElement;
  onSlowDown: () => number;
  onSpeedUp: () => number;
  onRestart: () => void;
};

export type BottomBar = {
  element: HTMLElement;
  switchToRestart: () => void;
  switchToSpeedControl: () => void;
};

export function createBottomBar({
  brandingElement,
  onSlowDown,
  onSpeedUp,
  onRestart,
}: BottomBarOptions): BottomBar {
  const bottomBar = document.createElement("div");
  bottomBar.setAttribute("data-terminal-bottom-bar", "");

  bottomBar.appendChild(brandingElement);
  const terminalControlContainer = document.createElement("span");
  terminalControlContainer.setAttribute("data-terminal-control-container", "");
  bottomBar.appendChild(terminalControlContainer);

  const speedControl = createSpeedControl({ onSlowDown, onSpeedUp });
  terminalControlContainer.appendChild(speedControl);

  const restart = createRestartButton({ onRestart });

  function switchToRestart() {
    if (restart.parentElement === terminalControlContainer) {
      return;
    }
    terminalControlContainer.replaceChild(restart, speedControl);
  }

  function switchToSpeedControl() {
    if (speedControl.parentElement === terminalControlContainer) {
      return;
    }
    terminalControlContainer.replaceChild(speedControl, restart);
  }

  return { element: bottomBar, switchToRestart, switchToSpeedControl };
}
