import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AnimatedContainer from "../components/AnimatedContainer";
import {
  useCreateActivity,
  usePreviousTitles,
} from "../hooks/useActivities";
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
import { Badge } from "../components/ui/badge";
import { DatePicker } from "../components/ui/date-picker";
import { TimePicker } from "../components/ui/time-picker";

export default function Activity() {
  const navigate = useNavigate();
  const createMutation = useCreateActivity();
  const previousTitles = usePreviousTitles();

  const [timeMode, setTimeMode] = useState("range");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "10:00",
    estHours: "1",
    estMinutes: "0",
  });
  const [titleFocused, setTitleFocused] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

  const filteredTitles = useMemo(() => {
    const q = formData.title.trim().toLowerCase();
    if (!q) return previousTitles.slice(0, 12);
    return previousTitles
      .filter((t) => t.toLowerCase().includes(q))
      .slice(0, 12);
  }, [formData.title, previousTitles]);

  const showSuggestions =
    titleFocused && filteredTitles.length > 0 && !createMutation.isPending;

  const pickTitle = (title) => {
    setFormData((prev) => ({ ...prev, title }));
    setTitleFocused(false);
    setSelectedSuggestionIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) =>
        prev < filteredTitles.length - 1 ? prev + 1 : 0,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) =>
        prev > 0 ? prev - 1 : filteredTitles.length - 1,
      );
    } else if (e.key === "Enter" && selectedSuggestionIndex >= 0) {
      e.preventDefault();
      pickTitle(filteredTitles[selectedSuggestionIndex]);
    } else if (e.key === "Escape") {
      setTitleFocused(false);
      setSelectedSuggestionIndex(-1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTitleFocused(false);

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
      const created = await createMutation.mutateAsync({
        title: formData.title.trim(),
        description: formData.description.trim(),
        activityDate: formData.date,
        startTime,
        endTime,
        durationMinutes,
        timeMode,
      });
      toast.success(`تم إضافة نشاط "${formData.title}"`);
      navigate(`/activities/${created.id}`, { replace: true });
    } catch (err) {
      toast.error(err?.message || "فشل الحفظ");
    }
  };

  return (
    <AnimatedContainer>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-8">إضافة نشاط جديد</h1>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">بيانات النشاط</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">
                  عنوان النشاط <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => {
                      setFormData((p) => ({ ...p, title: e.target.value }));
                      setSelectedSuggestionIndex(-1);
                      setTitleFocused(true);
                    }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setTitleFocused(true)}
                    onBlur={() => {
                      window.setTimeout(() => setTitleFocused(false), 150);
                    }}
                    autoComplete="off"
                    placeholder="أدخل عنوان النشاط"
                    required
                  />
                  {showSuggestions && (
                    <div className="absolute z-20 w-full mt-1 bg-card border border-input rounded-md shadow-lg max-h-60 overflow-y-auto">
                      <ul className="py-1">
                        {filteredTitles.map((title, index) => (
                          <li key={title}>
                            <button
                              type="button"
                              className={`w-full text-start px-3 py-2 text-sm text-foreground ${
                                selectedSuggestionIndex === index
                                  ? "bg-indigo-900/40"
                                  : "hover:bg-muted"
                              }`}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                pickTitle(title);
                              }}
                            >
                              {title}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                {previousTitles.length > 0 && (
                  <div className="pt-1">
                    <p className="text-xs text-muted-foreground mb-2">أنشطة سابقة:</p>
                    <div className="flex flex-wrap gap-2">
                      {previousTitles.slice(0, 8).map((title) => (
                        <Badge
                          key={title}
                          variant="secondary"
                          className="cursor-pointer hover:bg-muted"
                          onClick={() => pickTitle(title)}
                        >
                          {title}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">الوصف (اختياري)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, description: e.target.value }))
                  }
                  rows={4}
                  placeholder="أضف أي تفاصيل إضافية عن نشاطك"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">التاريخ</Label>
                <DatePicker
                  id="date"
                  value={formData.date}
                  onChange={(v) =>
                    setFormData((p) => ({ ...p, date: v }))
                  }
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
                    variant={timeMode === "estimated" ? "default" : "secondary"}
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

              <Button
                type="submit"
                className="w-full"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "جاري الحفظ..." : "حفظ النشاط"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AnimatedContainer>
  );
}
