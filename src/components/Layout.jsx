import { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import OfflineIndicator from "./OfflineIndicator";
import InstallPWA from "./InstallPWA";
import UserMenu from "./UserMenu";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

export default function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { to: "/", icon: "🏠", label: "الرئيسية", end: true },
    { to: "/stats", icon: "📊", label: "الإحصائيات" },
    { to: "/activity", icon: "➕", label: "إضافة نشاط" },
    { to: "/activities", icon: "📝", label: "الأنشطة" },
  ];

  return (
    <div className="min-h-screen bg-gray-900 font-arabic">
      <nav className="bg-gray-800 shadow-lg fixed w-full top-0 z-50 border-b border-gray-700">
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
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-gray-700 text-white"
                        : "text-gray-300 hover:bg-gray-700",
                    )
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
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="md:hidden text-gray-300"
                onClick={() => setIsMenuOpen((v) => !v)}
                aria-label="القائمة"
              >
                {isMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="md:hidden border-t border-gray-700"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-800">
                {menuItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "block px-3 py-2 rounded-md text-base font-medium",
                        isActive
                          ? "bg-gray-700 text-white"
                          : "text-gray-300 hover:bg-gray-700",
                      )
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
      <InstallPWA />

      <main className="max-w-7xl mx-auto px-4 pt-20 pb-8">
        <Outlet key={location.pathname} />
      </main>
    </div>
  );
}
