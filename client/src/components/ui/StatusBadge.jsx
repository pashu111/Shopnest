import { memo } from "react";

const STATUS_STYLES = {
  Placed: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  Confirmed: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  Processing: "bg-amber-50 text-amber-700 border border-amber-200",
  Packed: "bg-amber-50 text-amber-700 border border-amber-200",
  "Out for Delivery": "bg-blue-50 text-blue-700 border border-blue-200",
  Shipped: "bg-blue-50 text-blue-700 border border-blue-200",
  Delivered: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  Cancelled: "bg-rose-50 text-rose-700 border border-rose-200",
};

const StatusBadge = memo(function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || "bg-slate-50 text-slate-700 border border-slate-200";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${style}`}>
      {status}
    </span>
  );
});

export default StatusBadge;
