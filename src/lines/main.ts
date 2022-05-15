import { LineData, lineDataToBasicElement } from "./base";

export function createElementFromLineData(
  lineData: LineData,
  pfx: string,
  customPfx: string
): HTMLElement {
  return lineDataToBasicElement(lineData, pfx, customPfx);
}
