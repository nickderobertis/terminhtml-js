import "./style.css";
import "../src/termynal.css";
import "../src/ansi2html.css";
import { TerminHTML } from "../src/terminhtml";

function runTerminHTMLApp() {
  new TerminHTML("#terminhtml-ansi", { initNow: true });
}

function runDelayApp() {
  new TerminHTML("#delay", {
    initNow: true,
  });
}

function runPausedApp() {
  new TerminHTML("#paused", {
    initNow: true,
  });
}

function runSpinnerApp() {
  new TerminHTML("#spinner", {
    initNow: true,
  });
}

function runManualInitApp() {
  const term = new TerminHTML("#manual-init");
  const initButton = document.createElement("button");
  initButton.innerText = "Init";
  initButton.style.width = "300px";
  initButton.style.height = "100px";
  initButton.addEventListener("click", () => {
    term.init();
  });
  term.container.parentElement!.appendChild(initButton);
}

runTerminHTMLApp();
runDelayApp();
runPausedApp();
runSpinnerApp();
runManualInitApp();
