import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AnimatedContainer from "../components/AnimatedContainer";
import { motion } from "framer-motion";
import {
  useActivities,
  useDistinctTitles,
} from "../hooks/useActivities";

function useDebounced(value, ms = 400) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
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
    title: titleFilter,
    minMinutes: minMinutes === "" ? null : Number(minMinutes),
    maxMinutes: maxMinutes === "" ? null : Number(maxMinutes),
  };

  const { data: allActivities = [], isLoading: loading, isFetching } =
    useActivities(filters);
  const { data: titleOptions = [] } = useDistinctTitles();

  const getTaskStyle = (duration) => {
    const hours = parseFloat(String(duration).split("h")[0]) || 0;
    const styles = {
      4: {
        containerClass: "border-r-4 border-purple-500 bg-purple-900/20",
        icon: "💪 👨‍💻",
        titleClass: "text-white",
        timeClass: "text-purple-300",
        durationClass: "bg-purple-900/30 text-purple-300",
        descriptionClass: "text-gray-300",
      },
      2: {
        containerClass: "border-r-4 border-orange-500 bg-orange-900/20",
        icon: "🎯 ⚒️",
        titleClass: "text-white",
        timeClass: "text-orange-300",
        durationClass: "bg-orange-900/30 text-orange-300",
        descriptionClass: "text-gray-300",
      },
      1: {
        containerClass: "border-r-4 border-green-500 bg-green-900/20",
        icon: "✅ 📝",
        titleClass: "text-white",
        timeClass: "text-green-300",
        durationClass: "bg-green-900/30 text-green-300",
        descriptionClass: "text-gray-300",
      },
      0: {
        containerClass: "border-r-4 border-blue-500 bg-blue-900/20",
        icon: "⚡ 🎪",
        titleClass: "text-white",
        timeClass: "text-blue-300",
        durationClass: "bg-blue-900/30 text-blue-300",
        descriptionClass: "text-gray-300",
      },
    };
    return hours >= 4
      ? styles[4]
      : hours >= 2
        ? styles[2]
        : hours >= 1
          ? styles[1]
          : styles[0];
  };

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
    titleFilter ||
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatedContainer>
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-bold text-white">بحث وتصفية</h2>
            {isFetching && (
              <span className="text-xs text-indigo-300">جاري التحديث...</span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-300 text-sm mb-2">بحث نصي</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="عنوان أو وصف..."
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm mb-2">
                عنوان محدد
              </label>
              <select
                value={titleFilter}
                onChange={(e) => setTitleFilter(e.target.value)}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">الكل</option>
                {titleOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-300 text-sm mb-2">
                نوع الوقت
              </label>
              <select
                value={timeMode}
                onChange={(e) => setTimeMode(e.target.value)}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">الكل</option>
                <option value="range">من وقت لوقت</option>
                <option value="estimated">تقديري</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 text-sm mb-2">من تاريخ</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm mb-2">إلى تاريخ</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  أدنى دقائق
                </label>
                <input
                  type="number"
                  min="0"
                  value={minMinutes}
                  onChange={(e) => setMinMinutes(e.target.value)}
                  placeholder="0"
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  أقصى دقائق
                </label>
                <input
                  type="number"
                  min="0"
                  value={maxMinutes}
                  onChange={(e) => setMaxMinutes(e.target.value)}
                  placeholder="—"
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <p className="text-sm text-gray-400">
              {allActivities.length} نتيجة
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
              >
                مسح الفلاتر
              </button>
            )}
          </div>
        </div>
      </AnimatedContainer>

      {Object.keys(groupedActivities).length === 0 ? (
        <AnimatedContainer>
          <div className="bg-gray-800 rounded-lg p-8 shadow-lg text-center">
            <div className="text-6xl mb-4">{hasFilters ? "🔍" : "📝"}</div>
            <h2 className="text-2xl font-bold text-white mb-4">
              {hasFilters ? "مفيش نتائج للفلتر ده" : "لا توجد أي أنشطة بعد"}
            </h2>
            {!hasFilters && (
              <Link
                to="/activity"
                className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                + إضافة نشاط جديد
              </Link>
            )}
          </div>
        </AnimatedContainer>
      ) : (
        Object.entries(groupedActivities).map(([date, dayActivities], i) => (
          <AnimatedContainer key={date} delay={i * 0.03}>
            <div className="bg-gray-800 rounded-lg p-4 sm:p-6 shadow-lg border border-gray-700">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
                {date}
              </h2>
              <div className="space-y-4">
                {dayActivities.map((activity) => {
                  const style = getTaskStyle(activity.duration);
                  return (
                    <motion.div
                      key={activity.id}
                      className={`rounded-lg p-3 sm:p-4 transition-all hover:shadow-lg ${style.containerClass}`}
                    >
                      <Link to={`/activities/${activity.id}`} className="block">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="flex gap-1 shrink-0">
                              {style.icon.split(" ").map((emoji, idx) => (
                                <span key={idx} className="text-xl sm:text-2xl">
                                  {emoji}
                                </span>
                              ))}
                            </div>
                            <h3
                              className={`font-medium text-base sm:text-lg truncate ${style.titleClass}`}
                            >
                              {activity.title}
                            </h3>
                          </div>
                          <div className="flex items-center gap-3">
                            <div
                              className={`text-sm whitespace-nowrap ${style.timeClass}`}
                            >
                              {activity.time}
                            </div>
                            <div
                              className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${style.durationClass}`}
                            >
                              {activity.duration}
                            </div>
                          </div>
                        </div>
                        {activity.description && (
                          <p
                            className={`mt-3 mr-12 text-sm line-clamp-2 ${style.descriptionClass}`}
                          >
                            {activity.description}
                          </p>
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </AnimatedContainer>
        ))
      )}
    </div>
  );
}
