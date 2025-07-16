export const remToPx = (rem: number): number => {
  const rootFontSize = parseFloat(
    getComputedStyle(document.documentElement).fontSize
  );
  return rem * rootFontSize;
};

export const getCssVariableValue = (variableName: string): string => {
  const root: HTMLElement = document.documentElement;
  const styles: CSSStyleDeclaration = getComputedStyle(root);
  return styles.getPropertyValue(variableName).trim();
};
