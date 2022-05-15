import { LineData, lineDataToBasicElement } from "./base";

type InputLineData = Omit<LineData, "type"> & {
  type: "input";
};

export function createInputElementFromLineData(
  lineData: InputLineData,
  customPfx = "ty"
): HTMLElement {
  return lineDataToBasicElement(lineData, customPfx);
}

export function isInputLineData(lineData: LineData): lineData is InputLineData {
  return lineData.type === "input";
}
