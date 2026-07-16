import { memo } from "react";

const shimmer = "animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%]";

export const ProductCardSkeleton = memo(function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className={`aspect-[4/3] ${shimmer}`} />
      <div className="p-4 space-y-2">
        <div className={`h-4 rounded w-3/4 ${shimmer}`} />
        <div className={`h-3 rounded w-1/2 ${shimmer}`} />
        <div className={`h-5 rounded w-1/3 mt-3 ${shimmer}`} />
        <div className={`h-9 rounded-full mt-3 ${shimmer}`} />
      </div>
    </div>
  );
});

export const ProductGridSkeleton = memo(function ProductGridSkeleton({ count = 5 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
});

export const OrderCardSkeleton = memo(function OrderCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className={`h-4 w-32 rounded ${shimmer}`} />
          <div className={`h-3 w-48 rounded ${shimmer}`} />
          <div className={`h-3 w-40 rounded ${shimmer}`} />
        </div>
        <div className={`h-12 w-24 rounded-xl ${shimmer}`} />
      </div>
    </div>
  );
});

export const TableRowSkeleton = memo(function TableRowSkeleton({ cols = 4 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className={`h-4 rounded ${shimmer}`} style={{ width: `${60 + Math.random() * 30}%` }} />
        </td>
      ))}
    </tr>
  );
});

export const StatCardSkeleton = memo(function StatCardSkeleton() {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200">
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl ${shimmer}`} />
        <div className="flex-1 space-y-2">
          <div className={`h-3 w-20 rounded ${shimmer}`} />
          <div className={`h-6 w-16 rounded ${shimmer}`} />
        </div>
      </div>
    </div>
  );
});

export const ProfileSkeleton = memo(function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200">
            <div className="flex items-center gap-6">
              <div className={`w-24 h-24 rounded-full ${shimmer}`} />
              <div className="flex-1 space-y-2">
                <div className={`h-6 w-48 rounded ${shimmer}`} />
                <div className={`h-4 w-32 rounded ${shimmer}`} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-3">
            <div className={`h-5 w-32 rounded ${shimmer}`} />
            <div className={`h-10 rounded-xl ${shimmer}`} />
            <div className={`h-10 rounded-xl ${shimmer}`} />
          </div>
        </div>
      </div>
    </div>
  );
});
