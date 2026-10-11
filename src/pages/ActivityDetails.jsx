import { useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Pencil, Trash2, ArrowRight } from "lucide-react";
import AnimatedContainer from "../components/AnimatedContainer";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  useActivities,
  useActivity,
  useDeleteActivity,
} from "../hooks/useActivities";
import { formatMinutes } from "../lib/activityHelpers";

function getActivityStyle(duration) {
  const hours = parseFloat(String(duration || "0").split("h")[0]) || 0;
  if (hours >= 4) {
    return {
      icon: "💪",
      badge: "purple",
      ring: "ring-purple-500/40",
    };
  }
  if (hours >= 2) {
    return {
      icon: "🎯",
      badge: "warning",
      ring: "ring-orange-500/40",
    };
  }
  if (hours >= 1) {
    return {
      icon: "✅",
      badge: "success",
      ring: "ring-emerald-500/40",
    };
  }
  return {
    icon: "⚡",
    badge: "blue",
    ring: "ring-blue-500/40",
  };
}

export default function ActivityDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: activity, isLoading: loading } = useActivity(id);
  const { data: allActivities = [] } = useActivities();
  const deleteMutation = useDeleteActivity();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const history = useMemo(() => {
    if (!activity) return [];
    return allActivities
      .filter((a) => a.title === activity.title)
      .sort((a, b) => String(b.activityDate).localeCompare(String(a.activityDate)));
  }, [allActivities, activity]);

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("تم حذف النشاط بنجاح");
      navigate("/activities", { replace: true });
    } catch (err) {
      toast.error(err?.message || "فشل الحذف");
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  if (!activity) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-8 text-center space-y-4">
          <p className="text-foreground">لم يتم العثور على النشاط</p>
          <Button asChild variant="outline">
            <Link to="/activities">العودة للأنشطة</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const style = getActivityStyle(activity.duration);

  return (
    <AnimatedContainer>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
            <Link to="/activities">
              <ArrowRight className="h-4 w-4" />
              الأنشطة
            </Link>
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to={`/activities/${id}/edit`}>
                <Pencil className="h-4 w-4" />
                تعديل
              </Link>
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="h-4 w-4" />
              حذف
            </Button>
          </div>
        </div>

        <Card className={`ring-1 ${style.ring}`}>
          <CardHeader className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-3xl shrink-0">{style.icon}</span>
              <div className="min-w-0 flex-1 space-y-2">
                <CardTitle className="text-2xl sm:text-3xl leading-snug">
                  {activity.title}
                </CardTitle>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span>{activity.date}</span>
                  <span className="opacity-40">·</span>
                  <span>{activity.time}</span>
                  <Badge variant={style.badge}>{activity.duration}</Badge>
                  {activity.timeMode === "estimated" && (
                    <Badge variant="outline">تقديري</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {activity.description ? (
              <div className="rounded-lg bg-muted/40 border border-border/60 p-4">
                <p className="text-sm text-muted-foreground mb-1">الوصف</p>
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                  {activity.description}
                </p>
              </div>
            ) : null}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="rounded-lg border border-border/70 bg-background/40 p-3">
                <p className="text-xs text-muted-foreground mb-1">المدة</p>
                <p className="font-semibold">
                  {formatMinutes(activity.durationMinutes)}
                </p>
              </div>
              <div className="rounded-lg border border-border/70 bg-background/40 p-3">
                <p className="text-xs text-muted-foreground mb-1">التاريخ</p>
                <p className="font-semibold text-sm">{activity.date}</p>
              </div>
              <div className="rounded-lg border border-border/70 bg-background/40 p-3 col-span-2 sm:col-span-1">
                <p className="text-xs text-muted-foreground mb-1">الوقت</p>
                <p className="font-semibold text-sm">{activity.time}</p>
              </div>
            </div>

            {history.length > 1 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-foreground">
                    سجل نفس النشاط ({history.length})
                  </h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHistory((v) => !v)}
                  >
                    {showHistory ? "إخفاء" : "عرض"}
                  </Button>
                </div>
                {showHistory && (
                  <div className="rounded-lg border border-border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 text-muted-foreground">
                        <tr>
                          <th className="text-start py-2 px-3 font-medium">
                            التاريخ
                          </th>
                          <th className="text-start py-2 px-3 font-medium">
                            الوقت
                          </th>
                          <th className="text-start py-2 px-3 font-medium">
                            المدة
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((item) => (
                          <tr
                            key={item.id}
                            className={
                              item.id === id
                                ? "bg-primary/10 border-s-2 border-primary"
                                : "border-t border-border/60"
                            }
                          >
                            <td className="py-2 px-3">
                              <Link
                                to={`/activities/${item.id}`}
                                className="hover:text-primary"
                              >
                                {item.date}
                              </Link>
                            </td>
                            <td className="py-2 px-3 text-muted-foreground">
                              {item.time}
                            </td>
                            <td className="py-2 px-3">{item.duration}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تأكيد الحذف</DialogTitle>
              <DialogDescription>
                متأكد إنك عايز تحذف «{activity.title}»؟ مش هترجع.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setConfirmDelete(false)}
              >
                إلغاء
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={deleteMutation.isPending}
                onClick={handleDelete}
              >
                {deleteMutation.isPending ? "جاري..." : "حذف"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AnimatedContainer>
  );
}
