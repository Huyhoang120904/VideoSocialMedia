/**
 * Formats a number to a human-readable string
 * Examples: 1000 -> "1.0K", 1000000 -> "1.0M"
 */
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
};

