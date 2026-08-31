export function initials(name: string) {
  return name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

export function formatRelativeTime(date: Date | string) {
  const seconds = Math.round((new Date(date).getTime() - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const ranges: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 31_536_000], ["month", 2_592_000], ["week", 604_800], ["day", 86_400], ["hour", 3_600], ["minute", 60],
  ];
  for (const [unit, divisor] of ranges) if (Math.abs(seconds) >= divisor) return formatter.format(Math.round(seconds / divisor), unit);
  return "just now";
}

export function filenameToTitle(name: string) {
  return name.replace(/\.[^.]+$/, "").trim().slice(0, 120) || "Untitled document";
}
