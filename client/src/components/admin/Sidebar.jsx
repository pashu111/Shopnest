import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { LayoutDashboard, Package, LogOut, Menu, X, ClipboardList, Truck } from 'lucide-react';
import logo from '../../assets/ShopNest.png';

const Sidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin/dashboard' },
    { name: 'Products', icon: <Package size={20} />, path: '/admin/products' },
    { name: 'Order Details', icon: <ClipboardList size={20} />, path: '/admin/orders' },
    { name: 'Delivery Partners', icon: <Truck size={20} />, path: '/admin/delivery-partners' },
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      <div className="lg:hidden bg-slate-900 text-white px-5 py-3.5 flex justify-between items-center fixed top-0 w-full z-50 shadow-lg">
        <div className="flex items-center gap-2.5 min-w-0">
          <img src={logo} alt="Logo" className="w-8 h-8 object-contain rounded-lg" />
          <span className="font-bold text-base tracking-tight truncate">ShopNest</span>
        </div>
        <button onClick={toggleSidebar} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <div className={`
        fixed left-0 top-0 h-screen bg-slate-900 text-white flex flex-col z-50
        transition-transform duration-300 ease-in-out
        w-64 lg:translate-x-0 shadow-modal
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>

        <div className="px-6 py-6 flex items-center gap-3 border-b border-slate-800/50">
          <img src={logo} alt="Logo" className="w-10 h-10 object-contain rounded-xl bg-white/10 p-1.5 ring-1 ring-white/10" />
          <span className="text-xl font-bold tracking-tight">ShopNest</span>
        </div>

        <nav className="flex-1 mt-2 px-3 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 ${
                location.pathname === item.path
                  ? 'bg-brand-600/15 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <span className={`shrink-0 ${location.pathname === item.path ? 'text-brand-400' : ''}`}>{item.icon}</span>
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800/50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3.5 w-full px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200"
          >
            <LogOut size={20} className="shrink-0" />
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
