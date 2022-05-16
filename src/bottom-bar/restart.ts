type RestartButtonOptions = {
  onRestart: () => void;
};

export function createRestartButton({
  onRestart,
}: RestartButtonOptions): HTMLElement {
  const restart = document.createElement("a");
  restart.onclick = e => {
    e.preventDefault();
    onRestart();
  };
  restart.href = "#";
  restart.setAttribute("data-terminal-control", "");
  restart.innerHTML = "restart ↻";
  return restart;
}
