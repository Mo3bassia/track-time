import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { Separator } from "./ui/separator";

function initials(email) {
  if (!email) return "?";
  const part = email.split("@")[0] || email;
  return part.slice(0, 2).toUpperCase();
}

export default function UserMenu({ className }) {
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
          className={
            className ||
            "rounded-full border-border bg-background pl-1 pr-2.5 h-9 gap-2 hover:bg-muted"
          }
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
            {initials(user.email)}
          </span>
          <span className="hidden sm:block max-w-[10rem] truncate text-xs text-foreground">
            {user.email}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="end">
        <div className="px-4 py-3">
          <p className="text-xs text-muted-foreground mb-0.5">مسجّل كـ</p>
          <p className="text-sm text-foreground break-all font-medium">
            {user.email}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1 font-mono truncate">
            {user.id}
          </p>
        </div>
        <Separator />
        <div className="p-1">
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            تسجيل الخروج
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
