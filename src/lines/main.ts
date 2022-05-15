import { LineData, lineDataToBasicElement } from "./base";
import { createInputElementFromLineData, isInputLineData } from "./input";

export function createElementFromLineData(
  lineData: LineData,
  customPfx = "ty"
): HTMLElement {
  if (isInputLineData(lineData)) {
    return createInputElementFromLineData(lineData, customPfx);
  }
  return lineDataToBasicElement(lineData, customPfx);
}
