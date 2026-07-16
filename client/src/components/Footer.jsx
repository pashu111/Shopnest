import {
  Facebook, Instagram, Twitter, Linkedin, Mail, Phone, MapPin, ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";

const footerLinks = {
  support: [
    { label: "Help Center", to: "/home" },
    { label: "Returns & Refunds", to: "/home" },
    { label: "Shipping Policy", to: "/home" },
    { label: "Terms & Conditions", to: "/home" },
    { label: "Privacy Policy", to: "/home" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="h-1 bg-gradient-to-r from-brand-500 via-accent-400 to-brand-500" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-18">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-2">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">ShopNest</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-400 max-w-xs">
              Your one-stop shop for fresh groceries, premium produce, and daily essentials — delivered with care, right to your doorstep.
            </p>
            <div className="mt-6 flex gap-3">
              {[
                { icon: Facebook, href: "#", label: "Facebook" },
                { icon: Instagram, href: "#", label: "Instagram" },
                { icon: Twitter, href: "#", label: "Twitter" },
                { icon: Linkedin, href: "#", label: "LinkedIn" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-brand-700 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-200"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {[
            { title: "Support", links: footerLinks.support },

          ].map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="inline-flex items-center gap-1.5 text-sm hover:text-brand-400 transition-colors group"
                    >
                      <ChevronRight size={12} className="text-brand-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5">Contact</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <Phone size={15} className="mt-0.5 text-brand-400 shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={15} className="mt-0.5 text-brand-400 shrink-0" />
                <span>support@shopnest.com</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={15} className="mt-0.5 text-brand-400 shrink-0" />
                <span>Bhubaneswar, Odisha, India</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-3 text-xs text-slate-500">
              <p>&copy; {new Date().getFullYear()} ShopNest. All rights reserved.</p>
              <span className="hidden sm:inline text-slate-700">|</span>
              <p className="flex items-center gap-1">
                Made with <span className="text-rose-500">&hearts;</span> in India
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
