type SpeedControlOptions = {
  onSlowDown: () => number;
  onSpeedUp: () => number;
};

export function createSpeedControl({
  onSlowDown,
  onSpeedUp,
}: SpeedControlOptions) {
  const speedControlContainer = document.createElement("span");
  speedControlContainer.setAttribute(
    "data-terminal-speed-control-container",
    ""
  );
  const speedControl = document.createElement("span");
  speedControl.setAttribute("data-terminal-speed-control", "");
  const slowDown = document.createElement("a");
  const label = document.createElement("span");
  slowDown.onclick = e => {
    e.preventDefault();
    const newValue = onSlowDown();
    label.innerHTML = `${newValue}x`;
  };
  slowDown.innerHTML = "◄";
  slowDown.setAttribute("data-terminal-control", "");
  speedControl.appendChild(slowDown);
  label.innerHTML = `1x`;
  speedControl.appendChild(label);
  const speedUp = document.createElement("a");
  speedUp.onclick = e => {
    e.preventDefault();
    const newValue = onSpeedUp();
    label.innerHTML = `${newValue}x`;
  };
  speedUp.innerHTML = "►";
  speedUp.setAttribute("data-terminal-control", "");
  speedControl.appendChild(speedUp);
  speedControlContainer.appendChild(speedControl);
  return speedControlContainer;
}
