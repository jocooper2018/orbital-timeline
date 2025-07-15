export const remToPx = (rem: number): number => {
  const rootFontSize = parseFloat(
    getComputedStyle(document.documentElement).fontSize
  );
  return rem * rootFontSize;
};
