import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Separator } from "./ui/separator";

function initials(email) {
  if (!email) return "?";
  const part = email.split("@")[0] || email;
  return part.slice(0, 2).toUpperCase();
}

export default function UserMenu() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full border-gray-600 bg-gray-700/80 pl-1 pr-2.5 h-9 gap-2"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-semibold text-white">
            {initials(user.email)}
          </span>
          <span className="hidden sm:block max-w-[10rem] truncate text-xs text-gray-200">
            {user.email}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <div className="px-4 py-3">
          <p className="text-xs text-gray-400 mb-0.5">مسجّل كـ</p>
          <p className="text-sm font-medium text-white break-all">
            {user.email}
          </p>
        </div>
        <Separator />
        <div className="p-1">
          <Button
            variant="ghost"
            className="justify-start w-full text-rose-300 hover:text-rose-200 hover:bg-gray-700"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4" />
            تسجيل الخروج
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
