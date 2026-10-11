import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import AnimatedContainer from "../components/AnimatedContainer";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

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

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") {
        await signIn(email, password);
        toast.success("تم تسجيل الدخول");
      } else {
        await signUp(email, password);
        toast.success("تم إنشاء الحساب");
      }
      navigate(location.state?.from || "/", { replace: true });
    } catch (err) {
      toast.error(err?.message || "حصل خطأ");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <AnimatedContainer className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">متتبع الوقت</CardTitle>
            <CardDescription>
              {mode === "login" ? "تسجيل الدخول" : "إنشاء حساب جديد"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy
                  ? "جاري..."
                  : mode === "login"
                    ? "دخول"
                    : "إنشاء حساب"}
              </Button>
            </form>
            <Button
              type="button"
              variant="link"
              className="mt-4 w-full"
              onClick={() =>
                setMode((m) => (m === "login" ? "signup" : "login"))
              }
            >
              {mode === "login"
                ? "معندكش حساب؟ سجّل دلوقتي"
                : "عندك حساب؟ سجّل دخول"}
            </Button>
          </CardContent>
        </Card>
      </AnimatedContainer>
    </div>
  );
}
