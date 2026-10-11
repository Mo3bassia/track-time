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
      .sort((a, b) =>
        String(b.activityDate).localeCompare(String(a.activityDate)),
      );
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
        <Skeleton className="w-48 h-8" />
        <Skeleton className="w-full h-56" />
      </div>
    );
  }

  if (!activity) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-8 space-y-4 text-center">
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
          <Link to="/activities">
            <Button
              type="button"
              variant="ghost"
              className="text-muted-foreground"
            >
              <ArrowRight className="size-4" />
              الأنشطة
            </Button>
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <Link to={`/activities/${id}/edit`}>
              <Button type="button" variant="outline" size="default">
                <Pencil className="size-4" />
                تعديل
              </Button>
            </Link>
            <Button
              type="button"
              variant="destructive"
              size="default"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="size-4" />
              حذف
            </Button>
          </div>
        </div>

        <Card className={`ring-1 ${style.ring}`}>
          <CardHeader className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-3xl shrink-0">{style.icon}</span>
              <div className="flex-1 min-w-0 space-y-2">
                <CardTitle className="text-2xl leading-snug sm:text-3xl">
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
              <div className="p-4 border rounded-lg bg-muted/40 border-border/60">
                <p className="mb-1 text-sm text-muted-foreground">الوصف</p>
                <p className="leading-relaxed whitespace-pre-wrap text-foreground">
                  {activity.description}
                </p>
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="p-3 border rounded-lg border-border/70 bg-background/40">
                <p className="mb-1 text-xs text-muted-foreground">المدة</p>
                <p className="font-semibold">
                  {formatMinutes(activity.durationMinutes)}
                </p>
              </div>
              <div className="p-3 border rounded-lg border-border/70 bg-background/40">
                <p className="mb-1 text-xs text-muted-foreground">التاريخ</p>
                <p className="text-sm font-semibold">{activity.date}</p>
              </div>
              <div className="col-span-2 p-3 border rounded-lg border-border/70 bg-background/40 sm:col-span-1">
                <p className="mb-1 text-xs text-muted-foreground">الوقت</p>
                <p className="text-sm font-semibold">{activity.time}</p>
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
                  <div className="overflow-hidden border rounded-lg border-border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 text-muted-foreground">
                        <tr>
                          <th className="px-3 py-2 font-medium text-start">
                            التاريخ
                          </th>
                          <th className="px-3 py-2 font-medium text-start">
                            الوقت
                          </th>
                          <th className="px-3 py-2 font-medium text-start">
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
                            <td className="px-3 py-2">
                              <Link
                                to={`/activities/${item.id}`}
                                className="hover:text-primary"
                              >
                                {item.date}
                              </Link>
                            </td>
                            <td className="px-3 py-2 text-muted-foreground">
                              {item.time}
                            </td>
                            <td className="px-3 py-2">{item.duration}</td>
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
