import { PriceSegment } from "../enum/PriceSegment";
import { BusinessStatus } from "../enum/BusinessStatus";

export const getStatusClass = (status: string) => {
  switch (status) {
    case PriceSegment.Premium:
      return "bg-emerald-50 text-emerald-700";
    case PriceSegment.Middle:
      return "bg-amber-50 text-amber-700";
    case PriceSegment.Low:
      return "bg-slate-100 text-slate-600";

    case BusinessStatus.Active:
      return "bg-emerald-50 text-emerald-700";
    case BusinessStatus.Paused:
      return "bg-amber-50 text-amber-700";
    case BusinessStatus.Archived:
      return "bg-slate-100 text-slate-600";

    default:
      return "bg-gray-50 text-gray-700";
  }
}