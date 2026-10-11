import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function initials(email) {
  if (!email) return "?";
  const part = email.split("@")[0] || email;
  return part.slice(0, 2).toUpperCase();
}

export default function UserMenu() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  if (!user) return null;

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    navigate("/login", { replace: true });
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-gray-600 bg-gray-700/80 pl-1 pr-2.5 py-1 hover:bg-gray-700 transition-colors"
        aria-expanded={open}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
          {initials(user.email)}
        </span>
        <span className="hidden sm:block max-w-[10rem] truncate text-xs text-gray-200">
          {user.email}
        </span>
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-64 rounded-lg border border-gray-700 bg-gray-800 shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-700">
            <p className="text-xs text-gray-400 mb-0.5">مسجّل كـ</p>
            <p className="text-sm text-white break-all font-medium">
              {user.email}
            </p>
            <p className="text-[11px] text-gray-500 mt-1 font-mono truncate">
              {user.id}
            </p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full text-start px-4 py-2.5 text-sm text-rose-300 hover:bg-gray-700/80 transition-colors"
          >
            تسجيل الخروج
          </button>
        </div>
      )}
    </div>
  );
}
