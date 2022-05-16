import { findByText, queryByText } from "@testing-library/dom";
import { expect, it, vi } from "vitest";
import {
  BottomBar,
  BottomBarOptions,
  createBottomBar,
} from "../../src/bottom-bar";

function createBottomBarForTests(
  options: Partial<BottomBarOptions> = {}
): BottomBar {
  const useOptions: BottomBarOptions = {
    brandingElement: document.createElement("span"),
    onRestart: vi.fn(),
    onSpeedUp: vi.fn(),
    onSlowDown: vi.fn(),
    ...options,
  };
  return createBottomBar(useOptions);
}

it("displays passed branding", async () => {
  const brandingElement = document.createElement("span");
  const brandingText = "branding";
  brandingElement.textContent = brandingText;
  const { element } = createBottomBarForTests({
    brandingElement,
  });
  await findByText(element, brandingText);
});

it("renders the speed control by default", async () => {
  const { element, switchToSpeedControl } = createBottomBarForTests();
  await findByText(element, "1x");
  // Restart element is not rendered
  expect(queryByText(element, "restart ↻")).toBeNull();

  // Check that calling switch to speed control does not cause any issue: speed control is still displayed
  switchToSpeedControl();
  await findByText(element, "1x");
  expect(queryByText(element, "restart ↻")).toBeNull();
});

it("renders the restart element after calling switchToRestart", async () => {
  const { element, switchToRestart } = createBottomBarForTests();
  switchToRestart();
  await findByText(element, "restart ↻");
  // Speed control element is not rendered
  expect(queryByText(element, "►")).toBeNull();

  // Check that calling switch to restart again does not cause any issue: restart is still displayed
  switchToRestart();
  await findByText(element, "restart ↻");
  expect(queryByText(element, "►")).toBeNull();
});

it("renders the speed control element when switchToSpeedControl is called", async () => {
  const { element, switchToSpeedControl, switchToRestart } =
    createBottomBarForTests();

  // First switch to restart, as default already shows speed control
  switchToRestart();
  await findByText(element, "restart ↻");
  // Speed control element is not rendered
  expect(queryByText(element, "►")).toBeNull();

  // Now switch to speed control and verify that it is displayed
  switchToSpeedControl();
  await findByText(element, "1x");
  // Restart element is not rendered
  expect(queryByText(element, "restart ↻")).toBeNull();
});

it("calls onSpeedUp when speed up is clicked, and renders the result as the speed", async () => {
  const onSpeedUp = vi.fn(() => 10);
  const { element } = createBottomBarForTests({
    onSpeedUp,
  });
  const speedUpButton = await findByText(element, "►");
  speedUpButton.click();
  expect(onSpeedUp).toHaveBeenCalled();
  await findByText(element, "10x");
});

it("calls onSlowDown when speed down is clicked, and renders the result as the speed", async () => {
  const onSlowDown = vi.fn(() => 0.5);
  const { element } = createBottomBarForTests({
    onSlowDown,
  });
  const speedDownButton = await findByText(element, "◄");
  speedDownButton.click();
  expect(onSlowDown).toHaveBeenCalled();
  await findByText(element, "0.5x");
});

it("calls onRestart when restart is clicked", async () => {
  const onRestart = vi.fn();
  const { element, switchToRestart } = createBottomBarForTests({
    onRestart,
  });
  switchToRestart();
  const restartButton = await findByText(element, "restart ↻");
  restartButton.click();
  expect(onRestart).toHaveBeenCalled();
});
