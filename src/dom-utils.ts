export function getElementFromSelectorOrElement(
  selectorOrElement: string | HTMLElement
): HTMLElement {
  const maybeElement =
    typeof selectorOrElement === "string"
      ? document.querySelector<HTMLElement>(selectorOrElement)
      : selectorOrElement;
  if (!maybeElement) {
    throw new Error("Container element not found");
  }
  return maybeElement;
}

export function stringHasHTMLElements(string: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(string);
}
