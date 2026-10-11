import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import AnimatedContainer from "../components/AnimatedContainer";
import {
  useDeleteActivities,
  useDistinctTitles,
  useInfiniteActivities,
} from "../hooks/useActivities";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { Checkbox } from "../components/ui/checkbox";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { DatePicker } from "../components/ui/date-picker";
import { cn } from "../lib/utils";

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
      bg: "bg-violet-500/10",
      badge: "purple",
      icon: "💪",
    };
  }
  if (hours >= 2) {
    return {
      border: "border-r-4 border-orange-500",
      bg: "bg-orange-500/10",
      badge: "warning",
      icon: "🎯",
    };
  }
  if (hours >= 1) {
    return {
      border: "border-r-4 border-green-500",
      bg: "bg-emerald-500/10",
      badge: "success",
      icon: "✅",
    };
  }
  return {
    border: "border-r-4 border-blue-500",
    bg: "bg-sky-500/10",
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
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [deleteOpen, setDeleteOpen] = useState(false);

  const debouncedSearch = useDebounced(searchTerm, 400);

  const filters = useMemo(
    () => ({
      search: debouncedSearch,
      dateFrom,
      dateTo,
      timeMode,
      title: titleFilter === "all" ? "" : titleFilter,
      minMinutes: minMinutes === "" ? null : Number(minMinutes),
      maxMinutes: maxMinutes === "" ? null : Number(maxMinutes),
    }),
    [
      debouncedSearch,
      dateFrom,
      dateTo,
      timeMode,
      titleFilter,
      minMinutes,
      maxMinutes,
    ],
  );

  const {
    data,
    isLoading: loading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteActivities(filters);

  const { data: titleOptions = [] } = useDistinctTitles();
  const deleteMutation = useDeleteActivities();

  const activities = useMemo(
    () => data?.pages.flatMap((p) => p.items) ?? [],
    [data],
  );

  const totalCount = data?.pages?.[0]?.total ?? null;

  const groupedActivities = useMemo(() => {
    return activities.reduce((acc, activity) => {
      const date = activity.date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(activity);
      return acc;
    }, {});
  }, [activities]);

  const selectedCount = selectedIds.size;
  const allLoadedSelected =
    activities.length > 0 && activities.every((a) => selectedIds.has(a.id));

  const toggleOne = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllLoaded = (checked) => {
    if (checked) {
      setSelectedIds(new Set(activities.map((a) => a.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  // clear selection when filters change
  useEffect(() => {
    setSelectedIds(new Set());
  }, [filters]);

  // infinite scroll sentinel
  const sentinelRef = useRef(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (
          first?.isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage &&
          !loading
        ) {
          void fetchNextPage();
        }
      },
      { rootMargin: "240px" },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [hasNextPage, isFetchingNextPage, loading, fetchNextPage]);

  const runBulkDelete = async () => {
    const ids = [...selectedIds];
    if (!ids.length) return;
    try {
      await deleteMutation.mutateAsync(ids);
      toast.success(`تم حذف ${ids.length} نشاط`);
      setSelectedIds(new Set());
      setDeleteOpen(false);
    } catch (err) {
      toast.error(err?.message || "فشل الحذف");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setDateFrom("");
    setDateTo("");
    setTimeMode("all");
    setTitleFilter("");
    setMinMinutes("");
    setMaxMinutes("");
  };

  const hasFilters =
    Boolean(searchTerm.trim()) ||
    Boolean(dateFrom) ||
    Boolean(dateTo) ||
    timeMode !== "all" ||
    (titleFilter && titleFilter !== "all") ||
    minMinutes !== "" ||
    maxMinutes !== "";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            الأنشطة
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {loading
              ? "جاري التحميل..."
              : totalCount != null
                ? `${activities.length} معروض من ${totalCount}`
                : `${activities.length} نشاط`}
            {isFetching && !loading && !isFetchingNextPage ? " · تحديث..." : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedCount > 0 && (
            <Button
              type="button"
              variant="destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="size-4" />
              حذف المحدد ({selectedCount})
            </Button>
          )}
          <Link to="/activity">
            <Button type="button">إضافة نشاط</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">فلاتر</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
              <Label>بحث</Label>
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="عنوان أو وصف..."
              />
            </div>
            <div className="space-y-1.5">
              <Label>من تاريخ</Label>
              <DatePicker value={dateFrom} onChange={setDateFrom} />
            </div>
            <div className="space-y-1.5">
              <Label>إلى تاريخ</Label>
              <DatePicker value={dateTo} onChange={setDateTo} />
            </div>
            <div className="space-y-1.5">
              <Label>نوع الوقت</Label>
              <Select value={timeMode} onValueChange={setTimeMode}>
                <SelectTrigger dir="rtl">
                  <SelectValue placeholder="الكل" />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="range">من وقت لوقت</SelectItem>
                  <SelectItem value="estimated">تقديري</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>العنوان</Label>
              <Select
                value={titleFilter || "all"}
                onValueChange={(v) => setTitleFilter(v === "all" ? "" : v)}
              >
                <SelectTrigger dir="rtl">
                  <SelectValue placeholder="كل العناوين" />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  <SelectItem value="all">كل العناوين</SelectItem>
                  {titleOptions.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>أقل مدة (دقيقة)</Label>
              <Input
                type="number"
                min="0"
                value={minMinutes}
                onChange={(e) => setMinMinutes(e.target.value)}
                placeholder="مثلاً 30"
              />
            </div>
            <div className="space-y-1.5">
              <Label>أقصى مدة (دقيقة)</Label>
              <Input
                type="number"
                min="0"
                value={maxMinutes}
                onChange={(e) => setMaxMinutes(e.target.value)}
                placeholder="مثلاً 240"
              />
            </div>
          </div>
          {hasFilters && (
            <Button type="button" variant="outline" size="sm" onClick={clearFilters}>
              مسح الفلاتر
            </Button>
          )}
        </CardContent>
      </Card>

      {activities.length > 0 && (
        <div className="flex items-center gap-3 px-1">
          <Checkbox
            checked={allLoadedSelected}
            onCheckedChange={(v) => toggleAllLoaded(Boolean(v))}
            id="select-all-loaded"
          />
          <label
            htmlFor="select-all-loaded"
            className="text-sm text-muted-foreground cursor-pointer select-none"
          >
            تحديد المعروض ({activities.length})
          </label>
        </div>
      )}

      {loading ? (
        <ListSkeleton />
      ) : activities.length === 0 ? (
        <AnimatedContainer>
          <Card>
            <CardContent className="py-12 text-center space-y-3">
              <p className="text-muted-foreground">
                {hasFilters
                  ? "مفيش نتائج مطابقة للفلاتر"
                  : "لسه مفيش أنشطة مسجّلة"}
              </p>
              {!hasFilters && (
                <Link to="/activity">
                  <Button type="button">إضافة أول نشاط</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </AnimatedContainer>
      ) : (
        <div
          className={cn(
            "space-y-4 transition-opacity",
            isFetching && !isFetchingNextPage && !loading && "opacity-70",
          )}
        >
          {Object.entries(groupedActivities).map(([date, dayActivities], i) => (
            <AnimatedContainer key={date} delay={Math.min(i * 0.02, 0.2)}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg sm:text-xl">{date}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {dayActivities.map((activity) => {
                    const style = getTaskStyle(activity.duration);
                    const checked = selectedIds.has(activity.id);
                    return (
                      <motion.div
                        key={activity.id}
                        className={cn(
                          "rounded-lg p-3 sm:p-4 transition-all hover:shadow-md",
                          style.border,
                          style.bg,
                          checked && "ring-2 ring-primary/40",
                        )}
                      >
                        <div className="flex gap-3">
                          <div
                            className="pt-1 shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={() => toggleOne(activity.id)}
                              aria-label={`تحديد ${activity.title}`}
                            />
                          </div>
                          <Link
                            to={`/activities/${activity.id}`}
                            className="block flex-1 min-w-0"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <span className="text-xl shrink-0">
                                  {style.icon}
                                </span>
                                <h3 className="font-medium text-base sm:text-lg truncate text-foreground">
                                  {activity.title}
                                </h3>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground whitespace-nowrap">
                                  {activity.time}
                                </span>
                                <Badge variant={style.badge}>
                                  {activity.duration}
                                </Badge>
                              </div>
                            </div>
                            {activity.description && (
                              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                                {activity.description}
                              </p>
                            )}
                          </Link>
                        </div>
                      </motion.div>
                    );
                  })}
                </CardContent>
              </Card>
            </AnimatedContainer>
          ))}

          <div ref={sentinelRef} className="h-8 w-full" aria-hidden />

          {isFetchingNextPage ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : null}

          {!loading && hasNextPage === false && activities.length > 0 ? (
            <p className="text-center text-xs text-muted-foreground pb-2">
              نهاية القائمة
              {totalCount != null ? ` · ${totalCount} نشاط` : ""}
            </p>
          ) : null}
        </div>
      )}

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف الأنشطة المحددة؟</DialogTitle>
            <DialogDescription>
              هيتشال {selectedCount} نشاط نهائيًا. الخطوة دي مش هترجع.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDeleteOpen(false)}
              disabled={deleteMutation.isPending}
            >
              إلغاء
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteMutation.isPending || selectedCount === 0}
              onClick={() => void runBulkDelete()}
            >
              {deleteMutation.isPending
                ? "جاري الحذف..."
                : `حذف (${selectedCount})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
