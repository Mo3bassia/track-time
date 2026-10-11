import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AnimatedContainer from "../components/AnimatedContainer";
import { toast } from "sonner";

export default function Login() {
  const { signIn, signUp, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate(location.state?.from || "/", { replace: true });
    }
  }, [loading, isAuthenticated, navigate, location.state]);

  const showMsg = (message, type = "success") => {
    if (type === "error") toast.error(message);
    else toast.success(message);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") {
        await signIn(email, password);
        showMsg("تم تسجيل الدخول");
      } else {
        await signUp(email, password);
        showMsg("تم إنشاء الحساب");
      }
      navigate(location.state?.from || "/", { replace: true });
    } catch (err) {
      showMsg(err?.message || "حصل خطأ", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <AnimatedContainer className="w-full max-w-md">
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
          <h1 className="text-2xl font-bold text-white text-center mb-2">
            متتبع الوقت
          </h1>
          <p className="text-gray-400 text-center text-sm mb-6">
            {mode === "login" ? "تسجيل الدخول" : "إنشاء حساب جديد"}
          </p>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm mb-2">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-2">
                كلمة المرور
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="••••••••"
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium py-3 rounded-lg transition-colors"
            >
              {busy
                ? "جاري..."
                : mode === "login"
                  ? "دخول"
                  : "إنشاء حساب"}
            </button>
          </form>

          <button
            type="button"
            onClick={() =>
              setMode((m) => (m === "login" ? "signup" : "login"))
            }
            className="mt-4 w-full text-sm text-indigo-300 hover:text-indigo-200"
          >
            {mode === "login"
              ? "معندكش حساب؟ سجّل دلوقتي"
              : "عندك حساب؟ سجّل دخول"}
          </button>
        </div>
      </AnimatedContainer>
    </div>
  );
}
