import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import OfflineIndicator from "./OfflineIndicator";
import InstallPWA from "./InstallPWA";
import UserMenu from "./UserMenu";

let UpdatePrompt;
try {
  UpdatePrompt = require("./UpdatePrompt").default;
} catch {
  UpdatePrompt = () => null;
}

export default function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { to: "/", icon: "🏠", label: "الرئيسية" },
    { to: "/stats", icon: "📊", label: "الإحصائيات" },
    { to: "/activity", icon: "➕", label: "إضافة نشاط" },
    { to: "/activities", icon: "📝", label: "الأنشطة" },
  ];

  return (
    <div className="min-h-screen bg-gray-900 font-arabic">
      <nav className="bg-gray-800 shadow-lg fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16 items-center gap-3">
            <NavLink to="/" className="text-xl font-bold text-white shrink-0">
              متتبع الوقت
            </NavLink>

            <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
              {menuItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-gray-700 text-white"
                        : "text-gray-300 hover:bg-gray-700"
                    }`
                  }
                >
                  <span className="ml-2">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="hidden md:block">
                <UserMenu />
              </div>
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-gray-300 hover:bg-gray-700 rounded-md cursor-pointer"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isMenuOpen ? (
                    <path d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="md:hidden"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-800 shadow-lg border-t border-gray-700">
                {menuItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/"}
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                        isActive
                          ? "bg-gray-700 text-white"
                          : "text-gray-300 hover:bg-gray-700"
                      }`
                    }
                  >
                    <span className="ml-2">{item.icon}</span>
                    {item.label}
                  </NavLink>
                ))}
                <div className="px-2 pt-2">
                  <UserMenu />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      <OfflineIndicator />
      {UpdatePrompt && <UpdatePrompt />}
      <InstallPWA />
      <main className="max-w-7xl mx-auto px-4 pt-20 pb-8">
        <Outlet />
      </main>
    </div>
  );
}
