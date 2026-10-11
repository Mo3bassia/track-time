import { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import OfflineIndicator from "./OfflineIndicator";
import InstallPWA from "./InstallPWA";
import UserMenu from "./UserMenu";
import { ModeToggle } from "./ModeToggle";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { cn } from "../lib/utils";

const menuItems = [
  { to: "/", icon: "🏠", label: "الرئيسية", end: true },
  { to: "/stats", icon: "📊", label: "الإحصائيات" },
  { to: "/activity", icon: "➕", label: "إضافة نشاط" },
  { to: "/activities", icon: "📝", label: "الأنشطة" },
];

export default function Layout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground font-arabic">
      <nav className="bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 shadow-sm fixed w-full top-0 z-50 border-b border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16 items-center gap-3">
            <NavLink to="/" className="text-xl font-bold text-foreground shrink-0">
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
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )
                  }
                >
                  <span className="ml-2">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <ModeToggle />
              <div className="hidden md:block">
                <UserMenu />
              </div>

              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    aria-label="القائمة"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[min(100%,20rem)] p-0">
                  <SheetHeader className="border-b border-border px-6 py-4 text-start">
                    <SheetTitle>القائمة</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-1 p-3">
                    {menuItems.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        onClick={() => setOpen(false)}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground",
                          )
                        }
                      >
                        <span>{item.icon}</span>
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                  <div className="mt-auto border-t border-border p-4">
                    <UserMenu className="w-full justify-start rounded-lg border-border bg-background h-10 gap-2 pl-1 pr-3 hover:bg-muted" />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      <OfflineIndicator />
      <InstallPWA />

      <main className="max-w-7xl mx-auto px-4 pt-20 pb-8">
        <Outlet key={location.pathname} />
      </main>
    </div>
  );
}
