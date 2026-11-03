export function formatINRPrice(value, fallback = "Contact us") {
  if (value === null || value === undefined || String(value).trim() === "") {
    return fallback;
  }

  const raw = String(value).trim();
  const numericText = raw.replace(/,/g, "");

  const match = numericText.match(/\d+(?:\.\d{1,2})?/);

  if (!match) {
    return raw
      .replace(/[₹₱]/g, "Rs.")
      .replace(/\b(?:INR|PHP)\s*/gi, "Rs. ")
      .replace(/\bRs\.?\s*/gi, "Rs. ");
  }

  const amount = Number(match[0]);

  if (!Number.isFinite(amount)) {
    return fallback;
  }

  return `Rs. ${amount.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}