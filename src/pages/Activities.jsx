import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";
import AnimatedContainer from "../components/AnimatedContainer";
import {
  useActivities,
  useDistinctTitles,
} from "../hooks/useActivities";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { DatePicker } from "../components/ui/date-picker";

function useDebounced(value, ms = 400) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

function getTaskStyle(duration) {
  const hours = parseFloat(String(duration).split("h")[0]) || 0;
  if (hours >= 4) {
    return {
      border: "border-r-4 border-purple-500",
      bg: "bg-purple-900/20",
      badge: "purple",
      icon: "💪",
    };
  }
  if (hours >= 2) {
    return {
      border: "border-r-4 border-orange-500",
      bg: "bg-orange-900/20",
      badge: "warning",
      icon: "🎯",
    };
  }
  if (hours >= 1) {
    return {
      border: "border-r-4 border-green-500",
      bg: "bg-green-900/20",
      badge: "success",
      icon: "✅",
    };
  }
  return {
    border: "border-r-4 border-blue-500",
    bg: "bg-blue-900/20",
    badge: "blue",
    icon: "⚡",
  };
}

function ListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-3">
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function Activities() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [timeMode, setTimeMode] = useState("all");
  const [titleFilter, setTitleFilter] = useState("");
  const [minMinutes, setMinMinutes] = useState("");
  const [maxMinutes, setMaxMinutes] = useState("");

  const debouncedSearch = useDebounced(searchTerm, 400);

  const filters = {
    search: debouncedSearch,
    dateFrom,
    dateTo,
    timeMode,
    title: titleFilter === "all" ? "" : titleFilter,
    minMinutes: minMinutes === "" ? null : Number(minMinutes),
    maxMinutes: maxMinutes === "" ? null : Number(maxMinutes),
  };

  const {
    data: allActivities = [],
    isLoading: loading,
    isFetching,
  } = useActivities(filters);
  const { data: titleOptions = [] } = useDistinctTitles();

  const groupedActivities = allActivities.reduce((acc, activity) => {
    const date = activity.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(activity);
    return acc;
  }, {});

  const hasFilters =
    searchTerm.trim() !== "" ||
    dateFrom ||
    dateTo ||
    timeMode !== "all" ||
    (titleFilter && titleFilter !== "all") ||
    minMinutes !== "" ||
    maxMinutes !== "";

  const resetFilters = () => {
    setSearchTerm("");
    setDateFrom("");
    setDateTo("");
    setTimeMode("all");
    setTitleFilter("");
    setMinMinutes("");
    setMaxMinutes("");
  };

  return (
    <div className="space-y-6" dir="rtl">
      <AnimatedContainer>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
            <CardTitle className="text-xl">بحث وتصفية</CardTitle>
            {isFetching && !loading && (
              <span className="text-xs text-indigo-300">جاري التحديث...</span>
            )}
          </CardHeader>
          <CardContent className="space-y-4" dir="rtl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>بحث نصي</Label>
                <div className="relative">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="عنوان أو وصف..."
                    className="ps-9"
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>عنوان محدد</Label>
                <Select
                  value={titleFilter || "all"}
                  onValueChange={(v) => setTitleFilter(v === "all" ? "" : v)}
                  dir="rtl"
                >
                  <SelectTrigger dir="rtl" className="text-start">
                    <SelectValue placeholder="الكل" />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    <SelectItem value="all">الكل</SelectItem>
                    {titleOptions.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>نوع الوقت</Label>
                <Select value={timeMode} onValueChange={setTimeMode} dir="rtl">
                  <SelectTrigger dir="rtl" className="text-start">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="range">من وقت لوقت</SelectItem>
                    <SelectItem value="estimated">تقديري</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>من تاريخ</Label>
                <DatePicker
                  value={dateFrom}
                  onChange={setDateFrom}
                  placeholder="من تاريخ"
                />
              </div>

              <div className="space-y-2">
                <Label>إلى تاريخ</Label>
                <DatePicker
                  value={dateTo}
                  onChange={setDateTo}
                  placeholder="إلى تاريخ"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>أدنى دقائق</Label>
                  <Input
                    type="number"
                    min="0"
                    value={minMinutes}
                    onChange={(e) => setMinMinutes(e.target.value)}
                    placeholder="0"
                    dir="rtl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>أقصى دقائق</Label>
                  <Input
                    type="number"
                    min="0"
                    value={maxMinutes}
                    onChange={(e) => setMaxMinutes(e.target.value)}
                    placeholder="—"
                    dir="rtl"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-gray-400">
                {loading ? "..." : `${allActivities.length} نتيجة`}
              </p>
              {hasFilters && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                >
                  <X className="h-4 w-4" />
                  مسح الفلاتر
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </AnimatedContainer>

      {loading ? (
        <ListSkeleton />
      ) : Object.keys(groupedActivities).length === 0 ? (
        <AnimatedContainer>
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-5xl mb-4">{hasFilters ? "🔍" : "📝"}</div>
              <h2 className="text-xl font-bold text-white mb-4">
                {hasFilters ? "مفيش نتائج للفلتر ده" : "لا توجد أي أنشطة بعد"}
              </h2>
              {!hasFilters && (
                <Button asChild>
                  <Link to="/activity">+ إضافة نشاط جديد</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </AnimatedContainer>
      ) : (
        Object.entries(groupedActivities).map(([date, dayActivities], i) => (
          <AnimatedContainer key={date} delay={i * 0.03}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl">{date}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dayActivities.map((activity) => {
                  const style = getTaskStyle(activity.duration);
                  return (
                    <motion.div
                      key={activity.id}
                      className={`rounded-lg p-3 sm:p-4 transition-all hover:shadow-lg ${style.border} ${style.bg}`}
                    >
                      <Link to={`/activities/${activity.id}`} className="block">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="text-xl shrink-0">{style.icon}</span>
                            <h3 className="font-medium text-base sm:text-lg truncate text-white">
                              {activity.title}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-300 whitespace-nowrap">
                              {activity.time}
                            </span>
                            <Badge variant={style.badge}>
                              {activity.duration}
                            </Badge>
                          </div>
                        </div>
                        {activity.description && (
                          <p className="mt-2 text-sm text-gray-300 line-clamp-2 me-8">
                            {activity.description}
                          </p>
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>
          </AnimatedContainer>
        ))
      )}
    </div>
  );
}
