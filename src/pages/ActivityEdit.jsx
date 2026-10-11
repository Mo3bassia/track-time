import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import AnimatedContainer from "../components/AnimatedContainer";
import { useActivity, useUpdateActivity } from "../hooks/useActivities";
import {
  calcDurationMinutes,
  parseEstimatedInput,
} from "../lib/activityHelpers";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { DatePicker } from "../components/ui/date-picker";
import { TimePicker } from "../components/ui/time-picker";

export default function ActivityEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: activity, isLoading } = useActivity(id);
  const updateMutation = useUpdateActivity();

  const [timeMode, setTimeMode] = useState("range");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "09:00",
    endTime: "10:00",
    estHours: "1",
    estMinutes: "0",
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!activity) return;
    const mins = activity.durationMinutes || 0;
    setTimeMode(activity.timeMode || "range");
    setFormData({
      title: activity.title || "",
      description: activity.description || "",
      date: activity.activityDate || "",
      startTime: activity.startTime || "09:00",
      endTime: activity.endTime || "10:00",
      estHours: String(Math.floor(mins / 60)),
      estMinutes: String(mins % 60),
    });
    setReady(true);
  }, [activity]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    let durationMinutes = 0;
    let startTime = null;
    let endTime = null;

    if (timeMode === "range") {
      durationMinutes = calcDurationMinutes(
        formData.startTime,
        formData.endTime,
      );
      if (durationMinutes <= 0) {
        toast.error("وقت الانتهاء لازم يكون بعد وقت البدء");
        return;
      }
      startTime = formData.startTime;
      endTime = formData.endTime;
    } else {
      durationMinutes = parseEstimatedInput(
        formData.estHours,
        formData.estMinutes,
      );
      if (durationMinutes <= 0) {
        toast.error("حط مدة تقديرية أكبر من صفر");
        return;
      }
    }

    try {
      await updateMutation.mutateAsync({
        id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        activityDate: formData.date,
        startTime,
        endTime,
        durationMinutes,
        timeMode,
      });
      toast.success("تم تحديث النشاط بنجاح");
      navigate(`/activities/${id}`, { replace: true });
    } catch (err) {
      toast.error(err?.message || "فشل التحديث");
    }
  };

  if (isLoading || !ready) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (!activity) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-8 text-center space-y-4">
          <p>لم يتم العثور على النشاط</p>
          <Button asChild variant="outline">
            <Link to="/activities">العودة للأنشطة</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <AnimatedContainer>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              تعديل النشاط
            </h1>
            <p className="text-sm text-muted-foreground mt-1 truncate max-w-md">
              {activity.title}
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to={`/activities/${id}`}>رجوع للتفاصيل</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">بيانات النشاط</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">
                  العنوان <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, title: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      description: e.target.value,
                    }))
                  }
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>التاريخ</Label>
                <DatePicker
                  value={formData.date}
                  onChange={(v) => setFormData((p) => ({ ...p, date: v }))}
                />
              </div>

              <div className="space-y-2">
                <Label>طريقة تسجيل الوقت</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={timeMode === "range" ? "default" : "secondary"}
                    onClick={() => setTimeMode("range")}
                  >
                    من وقت لوقت
                  </Button>
                  <Button
                    type="button"
                    variant={
                      timeMode === "estimated" ? "default" : "secondary"
                    }
                    onClick={() => setTimeMode("estimated")}
                  >
                    مدة تقديرية
                  </Button>
                </div>
              </div>

              {timeMode === "range" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">وقت البدء</Label>
                    <TimePicker
                      id="startTime"
                      value={formData.startTime}
                      onChange={(v) =>
                        setFormData((p) => ({ ...p, startTime: v }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">وقت الانتهاء</Label>
                    <TimePicker
                      id="endTime"
                      value={formData.endTime}
                      onChange={(v) =>
                        setFormData((p) => ({ ...p, endTime: v }))
                      }
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="estHours">ساعات</Label>
                    <Input
                      id="estHours"
                      type="number"
                      min="0"
                      max="24"
                      value={formData.estHours}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          estHours: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estMinutes">دقائق</Label>
                    <Input
                      id="estMinutes"
                      type="number"
                      min="0"
                      max="59"
                      value={formData.estMinutes}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          estMinutes: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="min-w-[8rem]"
                >
                  {updateMutation.isPending ? "جاري الحفظ..." : "حفظ التعديل"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/activities/${id}`)}
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AnimatedContainer>
  );
}
