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

/**
 * Formats view count following the style in the reference design:
 * - >= 1,000,000 -> "▷ 2,1 Tr"
 * - >= 10,000 -> "▷ 572,4 N"
 * - 1,000 - 9,999 -> "▷ 7.550"
 * - < 1,000 -> raw number
 */
export const formatVietnameseViewCount = (count: number = 0): string => {
  if (count >= 1_000_000) {
    const millions = count / 1_000_000;
    return `▷ ${millions.toFixed(1).replace(".", ",")} Tr`;
  }

  if (count >= 10_000) {
    const thousands = count / 1_000;
    return `▷ ${thousands.toFixed(1).replace(".", ",")} N`;
  }

  if (count >= 1_000) {
    return `▷ ${count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
  }

  return `▷ ${count}`;
};

