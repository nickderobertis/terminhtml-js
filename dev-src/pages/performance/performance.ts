import TerminHTML from "../../../src";
import "../../../src/termynal.css";
import "../../../src/ansi2html.css";
const createNumElements = 10000;

type PerformanceAppOptions = {
  complexHtml: boolean;
  numElements: number;
};

const defaultOptions: PerformanceAppOptions = {
  complexHtml: true,
  numElements: createNumElements,
};

function runPerformanceApp(
  options: Partial<PerformanceAppOptions> = defaultOptions
) {
  const allOptions: PerformanceAppOptions = { ...defaultOptions, ...options };
  const { complexHtml, numElements } = allOptions;
  const containerElement = document.getElementById(
    "performance"
  ) as HTMLPreElement;
  insertElements(containerElement, { complexHtml, numElements });
  new TerminHTML(containerElement, {
    initNow: true,
  });
}

function deletePerformanceApp() {
  const containerElement = document.getElementById(
    "performance"
  ) as HTMLPreElement;
  containerElement.innerHTML = "";
}

type InsertElementOptions = {
  numElements: number;
  complexHtml: boolean;
};

function insertElements(
  container: HTMLElement,
  { numElements, complexHtml }: InsertElementOptions
) {
  for (let i = 0; i < numElements; i++) {
    const element = createElementForInsert({ complexHtml, idx: i });
    container.appendChild(element);
    // Create a text node to force a line break
    container.appendChild(document.createTextNode("\n"));
  }
}

type CreateElementOptions = {
  complexHtml: boolean;
  idx: number;
};

function createElementForInsert({
  complexHtml,
  idx,
}: CreateElementOptions): HTMLElement {
  const element = document.createElement("span");
  if (complexHtml) {
    element.innerHTML =
      idx % 2 === 0
        ? `<span data-ty="input">$ colors${idx / 2}</span>`
        : `<span data-ty  data-ty-delay="0">│ <span class="ansi48-253">          </span> │<span class="ansi33"> </span><span class="ansi33">   253</span><span class="ansi33"> </span>│<span class="ansi32"> </span><span class="ansi32">"gray85"             </span><span class="ansi32"> </span>│<span class="ansi34"> </span><span class="ansi34">#dadada</span><span class="ansi34"> </span>│<span class="ansi35"> </span><span class="ansi35">rgb(218,218,218)</span><span class="ansi35"> </span>│</span>`;
  } else {
    element.innerText =
      idx % 2 === 0 ? `$ echo woo${idx / 2}` : `woo${(idx - 1) / 2}`;
  }
  return element;
}

function createButtons() {
  const buttonContainer = document.querySelector("#buttons") as HTMLDivElement;
  const complexButton = document.createElement("button");
  complexButton.innerText = "Complex HTML";
  complexButton.addEventListener("click", () => {
    deletePerformanceApp();
    runPerformanceApp({ complexHtml: true });
  });
  const simpleButton = document.createElement("button");
  simpleButton.innerText = "Simple HTML";
  simpleButton.addEventListener("click", () => {
    deletePerformanceApp();
    runPerformanceApp({ complexHtml: false });
  });

  buttonContainer.appendChild(complexButton);
  buttonContainer.appendChild(simpleButton);
}

createButtons();
runPerformanceApp();
