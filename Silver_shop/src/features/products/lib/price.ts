const groupedFormatter = (() => {
  try {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
  } catch {
    return null;
  }
})();

/**
 * Parses user-typed prices in both styles:
 *  - US grouped: "13,346.50" or "13,346" (commas every 3 digits = thousands)
 *  - EU decimal: "13,5" (single comma = decimal point)
 * Grouped input from our own blur-formatting always parses back
 * to the same amount — no more 13346 → 13.346 corruption.
 * Returns null when the input is not a positive amount.
 */
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

/**
 * Foreign digits stay accepted: Arabic-Indic (٠-٩), Persian (۰-۹),
 * Arabic decimal (٫) and thousands (٬) separators are normalized
 * into the English format before parsing.
 */
export function normalizeDigits(value: string): string {
  return value
    .replace(/[٠-٩]/g, (d) => String(ARABIC_DIGITS.indexOf(d)))
    .replace(/[۰-۹]/g, (d) => String(PERSIAN_DIGITS.indexOf(d)))
    .replace(/٫/g, ".")
    .replace(/٬/g, ",");
}

const GROUPED_PATTERN = /^\d{1,3}(,\d{3})+(\.\d+)?$/;

export function parsePriceInput(value: string): number | null {
  const cleaned = normalizeDigits(value.trim()).replace(/\s/g, "");
  if (!cleaned) return null;
  const hasComma = cleaned.includes(",");
  const hasDot = cleaned.includes(".");
  let normalized: string;
  if (GROUPED_PATTERN.test(cleaned) || (hasComma && hasDot)) {
    normalized = cleaned.replace(/,/g, "");
  } else if (hasComma) {
    normalized = cleaned.replace(",", ".");
  } else {
    normalized = cleaned;
  }
  if (!/^\d+(\.\d+)?$/.test(normalized)) return null;
  const amount = Number(normalized);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

/** "13346.5" → "13,346.5" for display inside the input. */
export function formatPriceInput(amount: number): string {
  if (groupedFormatter) return groupedFormatter.format(amount);
  return String(amount);
}

/** "13,346.5" → "13346.5" for editing on focus. */
export function stripPriceInput(value: string): string {
  const amount = parsePriceInput(value);
  return amount === null ? value : String(amount);
}

/**
 * Typing guard for the price field: drops letters, currency signs,
 * minus and any other non-numeric characters as they are typed.
 * Western + Arabic/Persian digits, separators and spaces survive
 * (grouping + decimals); everything normalizes on parse.
 */
export function sanitizePriceInput(value: string): string {
  return value.replace(/[^0-9.,\s٠-٩۰-۹٫٬]/g, "");
}
