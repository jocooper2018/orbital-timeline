const ROOT_FONT_SIZE = parseFloat(
  getComputedStyle(document.documentElement).fontSize
);

export const remToPx = (rem: number): number => {
  return rem * ROOT_FONT_SIZE;
};

export const getCssVariableValue = (variableName: string): string => {
  const root: HTMLElement = document.documentElement;
  const styles: CSSStyleDeclaration = getComputedStyle(root);
  return styles.getPropertyValue(variableName).trim();
};

/**
 * Returns the number of days in a month from a year.
 * @param year The full year designation is required for cross-century date accuracy. If year is between 0 and 99 is used, then year is assumed to be 1900 + year.
 * @param monthIndex The month as a number between 0 and 11 (January to December).
 * @returns The number of days in the month from a year.
 */
export const getNumberOfDayInAMonth = (
  year: number,
  monthIndex: number
): number => {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
};

export const getMonthNames = (
  locale?: string,
  monthNameFormat?: "numeric" | "2-digit" | "long" | "short" | "narrow"
): string[] => {
  const formatter = new Intl.DateTimeFormat(locale ?? "en-US", {
    month: monthNameFormat ?? "short",
  });
  return Array.from({ length: 12 }, (_, i) => {
    const date = new Date(Date.UTC(1970, i, 1));
    return formatter.format(date);
  });
};
