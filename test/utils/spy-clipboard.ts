import { SpyInstance, vi } from "vitest";

export function spyOnClipboard(): SpyInstance<[data: string], Promise<void>> {
  Object.assign(navigator, {
    clipboard: {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      writeText: () => {},
    },
  });
  const copySpy = vi.spyOn(navigator.clipboard, "writeText");
  copySpy.mockImplementation(() => Promise.resolve());
  return copySpy;
}
