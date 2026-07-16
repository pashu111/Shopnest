import { memo } from "react";

const LoadingSpinner = memo(function LoadingSpinner({ text = "Loading..." }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
        <p className="text-slate-500 text-sm font-medium">{text}</p>
      </div>
    </div>
  );
});

export default LoadingSpinner;
