import TerminHTML from "../../../src";
import "../../../src/termynal.css";
import "../../../src/ansi2html.css";
const createNumElements = 10000;

function runPerformanceApp() {
  const containerElement = document.getElementById(
    "performance"
  ) as HTMLPreElement;
  insertElements(containerElement);
  new TerminHTML(containerElement, {
    initNow: true,
  });
}

function insertElements(
  container: HTMLElement,
  numElements = createNumElements
) {
  for (let i = 0; i < numElements; i++) {
    const element = document.createElement("span");
    const text = i % 2 === 0 ? `$ echo woo${i / 2}` : `woo${(i - 1) / 2}`;
    element.innerText = text;
    container.appendChild(element);
    // Create a text node to force a line break
    container.appendChild(document.createTextNode("\n"));
  }
}

runPerformanceApp();
