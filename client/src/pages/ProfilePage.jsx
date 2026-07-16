import { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { cancelOrder as cancelOrderLocal } from "../redux/slices/orderSlice";
import { setCredentials } from "../redux/slices/authSlice";
import { cancelOrder, getUserOrders } from "../services/orderService";
import { toast } from "react-toastify";
import API from "../services/api";
import { resolveAssetUrl } from "../utils/assetUrl";
import { 
  User, Mail, MapPin, CreditCard, HelpCircle, Package, Star,
  TrendingDown, Camera, CheckCircle2, Clock, Trash2, ShoppingBag, Shield
} from "lucide-react";
import { ProfileSkeleton } from "../components/ui/Skeleton";
import PageTransition from "../components/ui/PageTransition";

export default function ProfilePage() {
  const { user } = useSelector((state) => state.auth);
  const orders = useSelector((state) => state.orders.list);
  const dispatch = useDispatch();
  const [photoUrl, setPhotoUrl] = useState(user?.photo || user?.profilePhoto || "");
  const [dbOrders, setDbOrders] = useState([]);
  const [showAddressManager, setShowAddressManager] = useState(false);
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState(() => [
    { id: "home", label: "Home", name: "Guest User", phone: "99999 99999", line1: "221B, Baker Street", line2: "Near Central Park", city: "Mumbai", state: "Maharashtra", pincode: "400001", isDefault: true },
    { id: "work", label: "Work", name: "Guest User", phone: "88888 88888", line1: "10th Floor, Orion Business Park", line2: "MG Road", city: "Pune", state: "Maharashtra", pincode: "411001", isDefault: false },
  ]);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (user?.photo || user?.profilePhoto) {
      setPhotoUrl(user.photo || user.profilePhoto);
    }
  }, [user?.photo]);

  const initials = useMemo(() => {
    if (!user?.name) return "U";
    const parts = String(user.name).trim().split(" ");
    const first = parts[0]?.[0] || "";
    const last = parts[1]?.[0] || "";
    return (first + last).toUpperCase() || "U";
  }, [user?.name]);

  const statusSteps = ["Processing", "Packed", "Out for Delivery", "Delivered"];
  const getDisplayStatus = (status) => {
    if (status === "Placed") return "Processing";
    return status || "Processing";
  };
  const getStepIndex = (status) => {
    if (status === "Cancelled") return -1;
    const idx = statusSteps.indexOf(getDisplayStatus(status));
    return idx === -1 ? 0 : idx;
  };

  const formatCurrency = (value) => {
    const num = Number(value || 0);
    return `₹${num.toLocaleString("en-IN")}`;
  };

  const getOrderDate = (order) => {
    if (order?.createdAt) return new Date(order.createdAt);
    if (order?.date) return new Date(order.date);
    return null;
  };

  const getOrderSavings = (order) => {
    const direct = Number(order?.savings ?? order?.discount ?? order?.couponDiscount ?? order?.totalDiscount ?? 0);
    if (direct > 0) return direct;
    const subtotal = Number(order?.subtotal ?? order?.totalBeforeDiscount ?? order?.mrpTotal ?? 0);
    const total = Number(order?.totalAmount ?? order?.total ?? 0);
    if (subtotal > 0 && total > 0) return Math.max(0, subtotal - total);
    return 0;
  };

  useEffect(() => {
    const token = user?.token || null;
    const isJwt = typeof token === "string" && token.split(".").length === 3;
    if (!isJwt) {
      setDbOrders([]);
      setLoading(false);
      return;
    }
    const fetchOrders = async () => {
      try {
        const data = await getUserOrders(token);
        setDbOrders(Array.isArray(data) ? data : []);
      } catch {
        setDbOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user?.token]);

  const visibleOrders = dbOrders.length > 0 ? dbOrders : (orders || []);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !user?.token) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      try {
        const { data } = await API.put("/auth/update-profile", 
          { photo: base64String },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        dispatch(setCredentials({ ...data.user, token: user.token }));
        setPhotoUrl(base64String);
        toast.success("Profile photo saved successfully!"); 
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to save photo");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCancel = async (orderId) => {
    const token = user?.token || null;
    const isJwt = typeof token === "string" && token.split(".").length === 3;
    if (!isJwt) { toast.error("Please log in again."); return; }
    try {
      await cancelOrder(orderId, token);
      const refreshed = await getUserOrders(token);
      setDbOrders(Array.isArray(refreshed) ? refreshed : []);
      dispatch(cancelOrderLocal(orderId));
      toast.success("Order cancelled");
    } catch {
      try { const refreshed = await getUserOrders(token); setDbOrders(Array.isArray(refreshed) ? refreshed : []); } catch {}
      toast.success("Order cancelled");
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "orders", label: "Orders", icon: Package },
  ];

  if (loading) return <ProfileSkeleton />;

  return (
    <PageTransition>
      <div className="min-h-screen bg-surface-secondary">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          {/* Cover & Avatar */}
          <div className="bg-surface border border-slate-200 rounded-2xl shadow-card overflow-hidden">
            <div className="h-36 sm:h-48 bg-gradient-to-r from-brand-700 via-brand-600 to-teal-500 relative">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_70%)]" />
            </div>
            <div className="px-6 sm:px-8 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-14 sm:-mt-16">
                <div className="relative shrink-0">
                  {photoUrl ? (
                    <img src={resolveAssetUrl(photoUrl)} alt="Profile" className="w-28 h-28 rounded-2xl object-cover ring-4 ring-surface shadow-modal" />
                  ) : (
                    <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-700 text-white flex items-center justify-center text-3xl font-bold ring-4 ring-surface shadow-modal">
                      {initials}
                    </div>
                  )}
                  <label className="absolute -bottom-1 -right-1 bg-surface border border-slate-200 text-slate-600 p-2 rounded-xl cursor-pointer shadow-card hover:bg-slate-50 transition-colors">
                    <Camera size={14} />
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  </label>
                </div>
                <div className="flex-1 pt-2 sm:pt-0 sm:pb-1">
                  <h2 className="text-2xl font-extrabold text-slate-900">{user?.name || "Guest User"}</h2>
                  <div className="flex items-center gap-2 mt-1 text-slate-500">
                    <Mail size={14} />
                    <span className="text-sm font-medium">{user?.email || "Not logged in"}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg bg-brand-50 text-brand-700 border border-brand-200">
                      <Shield size={12} /> Premium Member
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg bg-accent-50 text-accent-700 border border-accent-200">
                      <Star size={12} /> Rewards Enabled
                    </span>
                  </div>
                </div>
              </div>

              {/* Stat Cards */}
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="bg-surface-secondary border border-slate-200 rounded-xl p-4 text-center hover:shadow-card-hover hover:border-brand-200 transition-all">
                  <Package size={18} className="mx-auto text-slate-400" />
                  <p className="text-xl font-bold text-slate-900 mt-1.5">{visibleOrders.length}</p>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">Total Orders</p>
                </div>
                <div className="bg-surface-secondary border border-slate-200 rounded-xl p-4 text-center hover:shadow-card-hover hover:border-accent-200 transition-all">
                  <Star size={18} className="mx-auto text-slate-400" />
                  <p className="text-xl font-bold text-slate-900 mt-1.5">4.8</p>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">Avg Rating</p>
                </div>
                <div className="bg-surface-secondary border border-slate-200 rounded-xl p-4 text-center hover:shadow-card-hover hover:border-sky-200 transition-all">
                  <TrendingDown size={18} className="mx-auto text-slate-400" />
                  <p className="text-xl font-bold text-slate-900 mt-1.5">{formatCurrency(visibleOrders.reduce((sum, order) => sum + getOrderSavings(order), 0))}</p>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">Total Savings</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-8 flex gap-1 bg-surface border border-slate-200 rounded-xl p-1 shadow-card">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === tab.id
                      ? "bg-brand-600 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab: Profile */}
          {activeTab === "profile" && (
            <div className="mt-6 grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
              <div className="bg-surface border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-card">
                <h3 className="text-lg font-bold text-slate-900">Profile Details</h3>
                <p className="text-slate-500 text-sm mt-1">Your account information</p>
                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-surface-secondary rounded-xl border border-slate-200">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                      <User size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Full Name</p>
                      <p className="font-semibold text-slate-900">{user?.name || "Guest User"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-surface-secondary rounded-xl border border-slate-200">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                      <Mail size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Email</p>
                      <p className="font-semibold text-slate-900">{user?.email || "Not logged in"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-surface border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-card">
                <h3 className="text-lg font-bold text-slate-900">Quick Actions</h3>
                <p className="text-slate-500 text-sm mt-1">Manage your account and track deliveries.</p>
                <div className="mt-4 grid gap-3">
                  <button onClick={() => { setActiveTab("addresses"); setShowAddressManager(true); }} className="w-full text-left border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-3">
                    <MapPin size={18} className="text-slate-400" />
                    <span>Manage Addresses</span>
                  </button>
                  <button className="w-full text-left border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-3">
                    <CreditCard size={18} className="text-slate-400" /> Payment Methods
                  </button>
                  <button className="w-full text-left border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-3">
                    <HelpCircle size={18} className="text-slate-400" /> Help & Support
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Addresses */}
          {activeTab === "addresses" && (
            <div className="mt-6 bg-surface border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-card">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Manage Addresses</h3>
                  <p className="text-sm text-slate-500">Edit your saved delivery locations in real time.</p>
                </div>
                <span className="text-xs text-slate-400">Click Edit to update without leaving the page.</span>
              </div>
              <div className="mt-6 grid gap-4">
                {addresses.map((address) => {
                  const isEditing = editingId === address.id;
                  return (
                    <div key={address.id} className={`border rounded-xl p-5 transition ${isEditing ? "border-accent-300 bg-accent-50/60" : "border-slate-200 bg-surface-secondary"}`}>
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900">{address.label}</span>
                            {address.isDefault && <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-brand-100 text-brand-700">Default</span>}
                          </div>
                          <p className="text-sm text-slate-600 mt-2">{address.name} &middot; {address.phone}</p>
                          <p className="text-sm text-slate-500 mt-1">{address.line1}, {address.line2}</p>
                          <p className="text-sm text-slate-500">{address.city}, {address.state} - {address.pincode}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {!isEditing ? (
                            <button onClick={() => { setEditingId(address.id); setDraft({ ...address }); }} className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-surface">Edit</button>
                          ) : (
                            <>
                              <button onClick={() => { setAddresses((prev) => prev.map((addr) => addr.id === editingId ? { ...draft } : addr)); setEditingId(null); setDraft(null); toast.success("Address updated"); }} className="px-4 py-2 text-sm font-semibold rounded-lg bg-brand-600 text-white hover:bg-brand-700">Save</button>
                              <button onClick={() => { setEditingId(null); setDraft(null); }} className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-surface">Cancel</button>
                            </>
                          )}
                        </div>
                      </div>
                      {isEditing && draft && (
                        <div className="mt-4 grid sm:grid-cols-2 gap-3">
                          <input name="name" value={draft.name} onChange={(e) => setDraft((prev) => ({ ...prev, [e.target.name]: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-surface text-sm" placeholder="Full name" />
                          <input name="phone" value={draft.phone} onChange={(e) => setDraft((prev) => ({ ...prev, [e.target.name]: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-surface text-sm" placeholder="Phone number" />
                          <input name="line1" value={draft.line1} onChange={(e) => setDraft((prev) => ({ ...prev, [e.target.name]: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-surface text-sm sm:col-span-2" placeholder="Address line 1" />
                          <input name="line2" value={draft.line2} onChange={(e) => setDraft((prev) => ({ ...prev, [e.target.name]: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-surface text-sm sm:col-span-2" placeholder="Address line 2" />
                          <input name="city" value={draft.city} onChange={(e) => setDraft((prev) => ({ ...prev, [e.target.name]: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-surface text-sm" placeholder="City" />
                          <input name="state" value={draft.state} onChange={(e) => setDraft((prev) => ({ ...prev, [e.target.name]: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-surface text-sm" placeholder="State" />
                          <input name="pincode" value={draft.pincode} onChange={(e) => setDraft((prev) => ({ ...prev, [e.target.name]: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-surface text-sm" placeholder="Pincode" />
                          <input name="label" value={draft.label} onChange={(e) => setDraft((prev) => ({ ...prev, [e.target.name]: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-surface text-sm" placeholder="Label (Home, Work)" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab: Orders */}
          {activeTab === "orders" && (
            <div className="mt-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                  <Package size={20} className="text-brand-600" /> Your Orders
                </h3>
                <span className="text-xs font-semibold text-slate-400 bg-surface border border-slate-200 px-3 py-1 rounded-lg">{visibleOrders.length} Order{visibleOrders.length !== 1 ? "s" : ""}</span>
              </div>

              {visibleOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-surface border border-slate-200 rounded-2xl shadow-card">
                  <div className="w-16 h-16 rounded-2xl bg-surface-secondary flex items-center justify-center mb-4">
                    <ShoppingBag size={32} className="text-slate-300" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-600 mb-1">No orders yet</h3>
                  <p className="text-slate-400 text-sm">Start shopping and your orders will appear here.</p>
                </div>
              ) : (
                <div className="grid gap-5">
                  {visibleOrders.map((order) => {
                    const orderId = order.orderId || order.id || order._id;
                    const stepIndex = getStepIndex(order.status);
                    const isCancelled = order.status === "Cancelled";
                    const displayStatus = getDisplayStatus(order.status);
                    const showDeliveryOtp = !isCancelled && displayStatus === "Out for Delivery" && Boolean(order.deliveryOtp);
                    const items = order.items || order.products?.map((p) => `${p.name} x${p.quantity}`) || [];
                    const total = order.total || order.totalAmount || 0;
                    const paymentMethod = order.paymentMethod || "N/A";
                    const date = order.date ? order.date : order.createdAt ? new Date(order.createdAt).toLocaleString() : "";
                    return (
                      <div key={orderId} className="bg-surface border border-slate-200 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-shadow">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Order ID</p>
                            <p className="font-bold text-slate-900 tracking-tight break-all">{orderId}</p>
                            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5"><Clock size={12}/> {date}</p>
                          </div>
                          <div className="md:text-right">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total</p>
                            <p className="text-2xl font-black text-slate-900">₹{total}</p>
                            <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md inline-block mt-1">Via {paymentMethod}</span>
                          </div>
                        </div>

                        <div className="mt-4 p-4 bg-surface-secondary rounded-xl border border-slate-200">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Order Items</p>
                          <div className="text-sm font-semibold text-slate-700">{items.join(", ")}</div>
                        </div>

                        <div className="mt-5 pt-5 border-t border-slate-100">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Delivery Status</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            {statusSteps.map((step, idx) => {
                              const active = stepIndex >= idx;
                              return (
                                <div key={step} className="flex items-center gap-2">
                                  <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${isCancelled ? "bg-rose-100 text-rose-500" : active ? "bg-brand-500 text-white" : "bg-slate-200"}`}>
                                    {active && !isCancelled && <CheckCircle2 size={10} />}
                                  </div>
                                  <span className={`text-xs font-semibold ${isCancelled ? "text-rose-600" : active ? "text-brand-700" : "text-slate-400"}`}>{step}</span>
                                  {idx < statusSteps.length - 1 && <div className="hidden sm:block w-6 h-px bg-slate-200" />}
                                </div>
                              );
                            })}
                          </div>
                          {isCancelled && <p className="text-xs font-semibold text-rose-600 mt-3 flex items-center gap-1.5"><ShoppingBag size={14} /> This order has been cancelled.</p>}
                          {showDeliveryOtp && (
                            <div className="mt-4 inline-flex items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50/50 px-4 py-2.5 shadow-sm">
                              <span className="text-xs text-indigo-700 font-bold uppercase tracking-tight">Share OTP with delivery partner:</span>
                              <span className="text-lg font-black tracking-[0.2em] text-indigo-900 bg-surface px-3 py-0.5 rounded-lg border border-indigo-100 shadow-inner">{order.deliveryOtp}</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                          <button onClick={() => handleCancel(orderId)} disabled={isCancelled || order.status === "Delivered"} className="px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2">
                            <Trash2 size={14} /> Cancel Order
                          </button>
                          <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg ${isCancelled ? 'bg-rose-100 text-rose-700' : 'bg-slate-900 text-white shadow-card'}`}>{displayStatus}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
