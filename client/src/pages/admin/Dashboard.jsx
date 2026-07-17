import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle, ClipboardList, Filter, Package, Search, Truck, Wallet
} from "lucide-react";
import productService from "../../services/productService";
import { getAllOrders } from "../../services/orderService";
import { getDeliveryPartners } from "../../services/deliveryPartnerService";
import { resolveAssetUrl } from "../../utils/assetUrl";
import { StatCardSkeleton, TableRowSkeleton } from "../../components/ui/Skeleton";

const formatCurrency = (value) => {
  const amount = Number(value) || 0;
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
};

const STATUS_STYLES = {
  Placed: "bg-indigo-50 text-indigo-700", Packed: "bg-amber-50 text-amber-700",
  Processing: "bg-amber-50 text-amber-700", "Out for Delivery": "bg-blue-50 text-blue-700",
  Shipped: "bg-blue-50 text-blue-700", Delivered: "bg-emerald-50 text-emerald-700", Cancelled: "bg-rose-50 text-rose-700",
};

const StatCard = ({ icon, label, value, helper, tone = "slate" }) => {
  const tones = { slate: "bg-slate-50 text-slate-700", indigo: "bg-indigo-50 text-indigo-700", rose: "bg-rose-50 text-rose-700", amber: "bg-amber-50 text-amber-700", emerald: "bg-emerald-50 text-emerald-700", sky: "bg-sky-50 text-sky-700" };
  return (
    <div className="bg-surface p-6 rounded-2xl shadow-card border border-slate-200 flex items-start gap-4 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
      <div className={`p-3.5 rounded-xl ${tones[tone] || tones.slate}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5 truncate">{value}</h3>
        {helper ? <p className="text-xs text-slate-500 mt-1 line-clamp-1">{helper}</p> : null}
      </div>
    </div>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [productList, setProductList] = useState([]);
  const [orders, setOrders] = useState([]);
  const [partners, setPartners] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showInventory, setShowInventory] = useState(true);

  useEffect(() => {
    let active = true;
    const loadDashboardData = async () => {
      setIsLoading(true);
      setLoadError("");
      try {
        const [productsData, ordersData, partnersData] = await Promise.all([
          productService.getAllProducts(), getAllOrders(), getDeliveryPartners(),
        ]);
        if (!active) return;
        setProductList(Array.isArray(productsData) ? productsData : []);
        setOrders(Array.isArray(ordersData) ? ordersData : []);
        setPartners(Array.isArray(partnersData) ? partnersData : []);
      } catch {
        if (active) setLoadError("Failed to load admin dashboard data. Please try again.");
      } finally { if (active) setIsLoading(false); }
    };
    loadDashboardData();
    return () => { active = false; };
  }, []);

  const filteredProducts = useMemo(() => {
    const query = String(searchTerm || "").trim().toLowerCase();
    if (!query) return productList;
    return productList.filter((product) => String(product?.name || "").toLowerCase().includes(query));
  }, [productList, searchTerm]);

  const stats = useMemo(() => {
    const totalProducts = productList.length;
    const lowStockProducts = productList.map((p) => ({ ...p, stock: Number(p?.stock) || 0, price: Number(p?.price) || 0 })).filter((p) => p.stock > 0 && p.stock < 10).sort((a, b) => a.stock - b.stock);
    const inventoryValue = productList.reduce((acc, curr) => acc + (Number(curr?.price) || 0) * (Number(curr?.stock) || 0), 0);
    const totalOrders = orders.length;
    const deliveredOrders = orders.filter((o) => o?.status === "Delivered").length;
    const cancelledOrders = orders.filter((o) => o?.status === "Cancelled").length;
    const pendingOrders = orders.filter((o) => !["Delivered", "Cancelled"].includes(o?.status)).length;
    const unassignedOrders = orders.filter((o) => !o?.deliveryPartner).length;
    const grossRevenue = orders.reduce((acc, o) => acc + (Number(o?.totalAmount) || 0), 0);
    const deliveredRevenue = orders.filter((o) => o?.status === "Delivered").reduce((acc, o) => acc + (Number(o?.totalAmount) || 0), 0);
    const recentOrders = [...orders].sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0)).slice(0, 6);
    const recentPartners = [...partners].sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0)).slice(0, 5);
    return { totalProducts, inventoryValue, lowStockProducts, lowStockCount: lowStockProducts.length, totalOrders, deliveredOrders, cancelledOrders, pendingOrders, unassignedOrders, grossRevenue, deliveredRevenue, recentOrders, partnersCount: partners.length, recentPartners };
  }, [orders, partners, productList]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Admin Overview</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">Operations Dashboard</h1>
          <p className="text-slate-600 mt-2">Track orders, inventory health, and delivery partner coverage at a glance.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => navigate("/admin/orders")} className="px-4 py-2.5 rounded-xl font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-all shadow-sm">View Orders</button>
          <button onClick={() => navigate("/admin/products")} className="px-4 py-2.5 rounded-xl font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition">Manage Products</button>
          <button onClick={() => navigate("/admin/delivery-partners")} className="px-4 py-2.5 rounded-xl font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition">Delivery Partners</button>
        </div>
      </div>

      {loadError ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl px-5 py-4 font-semibold flex items-center gap-2.5 shadow-sm">
          <AlertTriangle size={16} /> {loadError}
        </div>
      ) : null}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[1,2,3,4,5,6,7,8].map((i) => <StatCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard icon={<ClipboardList size={22} />} label="Total Orders" value={stats.totalOrders} helper={`${stats.pendingOrders} pending • ${stats.deliveredOrders} delivered`} tone="indigo" />
          <StatCard icon={<Wallet size={22} />} label="Gross Revenue" value={formatCurrency(stats.grossRevenue)} helper={`Delivered: ${formatCurrency(stats.deliveredRevenue)}`} tone="emerald" />
          <StatCard icon={<Package size={22} />} label="Total Products" value={stats.totalProducts} helper={`Inventory: ${formatCurrency(stats.inventoryValue)}`} tone="sky" />
          <StatCard icon={<AlertTriangle size={22} />} label="Low Stock" value={stats.lowStockCount} helper={stats.lowStockCount ? "Restock soon to avoid cancellations" : "All good for now"} tone={stats.lowStockCount ? "amber" : "slate"} />
          <StatCard icon={<Truck size={22} />} label="Delivery Partners" value={stats.partnersCount} helper={`${stats.unassignedOrders} orders not assigned`} tone="rose" />
          <StatCard icon={<ClipboardList size={22} />} label="Cancelled Orders" value={stats.cancelledOrders} helper="Keep an eye on stock-outs & delays" tone={stats.cancelledOrders ? "rose" : "slate"} />
          <StatCard icon={<Truck size={22} />} label="Unassigned Orders" value={stats.unassignedOrders} helper="Assign partners from Order Details" tone={stats.unassignedOrders ? "amber" : "slate"} />
          <StatCard icon={<Package size={22} />} label="Catalog Health" value={isLoading ? "—" : `${Math.max(0, stats.totalProducts - stats.lowStockCount)}/${stats.totalProducts}`} helper="Products with safe stock levels" tone="indigo" />
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-surface rounded-2xl shadow-card border border-slate-200 overflow-hidden xl:col-span-2">
          <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Recent Orders</h2>
              <p className="text-sm text-slate-600 mt-1">Latest activity across all customers.</p>
            </div>
            <button onClick={() => navigate("/admin/orders")} className="px-4 py-2 rounded-xl font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-all shadow-sm">Open Orders</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-tertiary border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Order</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  [1,2,3].map((i) => <TableRowSkeleton key={i} cols={5} />)
                ) : stats.recentOrders.length ? (
                  stats.recentOrders.map((order) => {
                    const id = order?._id || order?.id || "";
                    const shortId = String(id).slice(-6).toUpperCase();
                    const status = order?.status || "Placed";
                    const statusStyle = STATUS_STYLES[status] || "bg-slate-100 text-slate-600";
                    const created = order?.createdAt ? new Date(order.createdAt) : null;
                    return (
                      <tr key={id} className="hover:bg-surface-secondary transition-colors">
                        <td className="px-6 py-4 font-extrabold text-slate-900">#{shortId}</td>
                        <td className="px-6 py-4 text-sm text-slate-700 font-semibold">{order?.customerName || "—"}</td>
                        <td className="px-6 py-4 text-sm font-extrabold text-slate-900">{formatCurrency(order?.totalAmount)}</td>
                        <td className="px-6 py-4"><span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${statusStyle}`}>{status}</span></td>
                        <td className="px-6 py-4 text-sm text-slate-600">{created ? created.toLocaleString("en-IN") : "—"}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan="5" className="p-12 text-center text-slate-400 text-sm">No orders yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-surface rounded-2xl shadow-card border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200">
            <h2 className="text-lg font-extrabold text-slate-900">Low Stock Alerts</h2>
            <p className="text-sm text-slate-600 mt-1">Products running out soon.</p>
          </div>
          <div className="p-5 space-y-3">
            {isLoading ? (
              <p className="text-slate-500 italic">Checking inventory health...</p>
            ) : stats.lowStockProducts.length ? (
              stats.lowStockProducts.slice(0, 7).map((product) => {
                const id = product?._id || product?.id;
                return (
                  <div key={id} className="flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-rose-50/50 transition-colors">
                    <img src={resolveAssetUrl(product?.image) || "https://placehold.co/40?text=No+Image"} alt="" className="w-10 h-10 rounded-xl object-cover border bg-slate-50 shrink-0" loading="lazy" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900 truncate">{product?.name || "—"}</p>
                      <p className="text-xs text-slate-500 truncate">{product?.category || "Uncategorized"}</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 shrink-0">{product.stock} left</span>
                  </div>
                );
              })
            ) : (
              <div className="text-sm text-slate-600 flex items-center gap-2.5 px-1"><Package size={16} className="text-brand-500 shrink-0" /> No low-stock products right now.</div>
            )}
            <button onClick={() => navigate("/admin/products")} className="w-full mt-2 px-4 py-2.5 rounded-xl font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition">Open Products</button>
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-2xl shadow-card border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between gap-4">
          <div><h2 className="text-lg font-extrabold text-slate-900">New Delivery Partners</h2><p className="text-sm text-slate-600 mt-1">Latest onboarded partners.</p></div>
          <button onClick={() => navigate("/admin/delivery-partners")} className="px-4 py-2 rounded-xl font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition">Open Partners</button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {isLoading ? (
            <p className="text-slate-500 italic md:col-span-2 xl:col-span-3">Loading partners...</p>
          ) : stats.recentPartners.length ? (
            stats.recentPartners.map((partner) => {
              const id = partner?._id || partner?.id;
              const created = partner?.createdAt ? new Date(partner.createdAt) : null;
              return (
                <div key={id} className="border border-slate-200 rounded-2xl p-4 flex items-start gap-3 bg-surface-secondary/50 hover:bg-surface hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shrink-0">{String(partner?.fullName || "D").slice(0, 1).toUpperCase()}</div>
                  <div className="min-w-0">
                    <p className="font-extrabold text-slate-900 truncate">{partner?.fullName || "—"}</p>
                    <p className="text-xs text-slate-600 truncate">{partner?.deliveryCity || "City not set"} • {partner?.availability || "Availability unknown"}</p>
                    <p className="text-xs text-slate-500 mt-1 truncate">Joined {created ? created.toLocaleDateString("en-IN") : "—"}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-slate-600 md:col-span-2 xl:col-span-3">No delivery partners found.</p>
          )}
        </div>
      </div>

      <div className="bg-surface rounded-2xl shadow-card border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div><h2 className="text-lg font-extrabold text-slate-900">Inventory</h2><p className="text-sm text-slate-600 mt-1">Search products and monitor stock levels.</p></div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => setShowInventory((value) => !value)} className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-semibold hover:bg-slate-50"><Filter size={18} /> {showInventory ? "Hide Table" : "Show Table"}</button>
          </div>
        </div>
        {showInventory ? (
          <>
            <div className="px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" placeholder="Search products..." className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 outline-none transition bg-surface" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-tertiary border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    [1,2,3,4].map((i) => <TableRowSkeleton key={i} cols={4} />)
                  ) : (
                    filteredProducts.map((product) => {
                      const id = product._id || product.id;
                      const stock = Number(product.stock) || 0;
                      const isLowStock = stock > 0 && stock < 10;
                      return (
                        <tr key={id} className="hover:bg-surface-secondary transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img src={resolveAssetUrl(product.image) || "https://placehold.co/48?text=No+Image"} alt="" className="w-12 h-12 rounded-lg object-cover border bg-slate-50 shadow-xs" loading="lazy" />
                              <span className="font-semibold text-slate-800">{product.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 font-medium uppercase tracking-tight">{product.category}</td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-900">{formatCurrency(product.price)}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${isLowStock ? "bg-rose-100 text-rose-700" : stock === 0 ? "bg-slate-200 text-slate-500" : "bg-slate-100 text-slate-700"}`}>{stock === 0 ? "Out" : `${stock} units`}</span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
              {!isLoading && filteredProducts.length === 0 ? <div className="p-12 text-center text-slate-400 text-sm">No products found.</div> : null}
            </div>
          </>
        ) : (
          <div className="p-6 text-sm text-slate-600 flex items-center gap-2"><Package size={16} className="text-slate-400 shrink-0" /> Inventory table hidden. Use &quot;Show Table&quot; to view the product list.</div>
        )}
      </div>
    </div>
  );
}
