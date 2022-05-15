import { LineData, lineDataToBasicElement } from "./base";

export function createElementFromLineData(
  lineData: LineData,
  customPfx = "ty"
): HTMLElement {
  return lineDataToBasicElement(lineData, customPfx);
}
