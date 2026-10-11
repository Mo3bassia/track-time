import { useEffect, useState } from "react";

export default function OfflineIndicator() {
  const [offline, setOffline] = useState(
    typeof navigator !== "undefined" ? !navigator.onLine : false,
  );

  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-rose-600 px-4 py-2 text-sm text-white shadow-lg">
      أنت غير متصل بالإنترنت
    </div>
  );
}
