export type FitStatus = "fits" | "tight" | "unknown";

export function checkFit(
  itemWidthCm: number | null,
  itemDepthCm: number | null,
  roomWidthCm: number | null,
  roomDepthCm: number | null
): FitStatus {
  if (!itemWidthCm || !itemDepthCm || !roomWidthCm || !roomDepthCm) {
    return "unknown";
  }

  // Check if item fits with 20% clearance remaining
  const maxItemWidth = roomWidthCm * 0.8;
  const maxItemDepth = roomDepthCm * 0.8;

  // Try both orientations
  const fitsNormal = itemWidthCm <= maxItemWidth && itemDepthCm <= maxItemDepth;
  const fitsRotated = itemDepthCm <= maxItemWidth && itemWidthCm <= maxItemDepth;

  if (fitsNormal || fitsRotated) {
    return "fits";
  }
  return "tight";
}

export function fitLabel(status: FitStatus): string {
  switch (status) {
    case "fits":
      return "Fits \u2713";
    case "tight":
      return "Tight / Won't Fit \u2717";
    case "unknown":
      return "";
  }
}

export function fitColor(status: FitStatus): string {
  switch (status) {
    case "fits":
      return "text-green-700 bg-green-50 border-green-200";
    case "tight":
      return "text-red-700 bg-red-50 border-red-200";
    case "unknown":
      return "";
  }
}
