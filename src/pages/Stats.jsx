import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import AnimatedContainer from "../components/AnimatedContainer";
import { useActivities } from "../hooks/useActivities";
import { formatMinutes } from "../lib/activityHelpers";

const COLORS = [
  "#4F46E5",
  "#7C3AED",
  "#8B5CF6",
  "#A78BFA",
  "#C4B5FD",
  "#4338CA",
  "#818CF8",
];

function CustomTooltip({ active, payload, label, valuePrefix }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 p-3 rounded shadow-lg border border-gray-700">
        <p className="text-gray-300 mb-1">{label}</p>
        <p className="text-white font-medium">
          {payload[0].dataKey === "minutes"
            ? formatMinutes(payload[0].value)
            : `${valuePrefix || ""}${payload[0].value}`}
        </p>
      </div>
    );
  }
  return null;
}

export default function Stats() {
  const { data: activities = [], isLoading: loading } = useActivities();
  const [selectedDate, setSelectedDate] = useState("all");
  const [selectedActivity, setSelectedActivity] = useState("");

  const availableDates = useMemo(() => {
    const dateMap = {};
    activities.forEach((a) => {
      const key = a.dateMetadata?.dateKey || a.activityDate || a.date;
      if (!dateMap[key]) {
        dateMap[key] = { date: a.date, key, count: 0, iso: a.activityDate };
      }
      dateMap[key].count++;
    });
    return Object.values(dateMap).sort((a, b) => {
      if (a.iso && b.iso) return b.iso.localeCompare(a.iso);
      return 0;
    });
  }, [activities]);

  const availableActivities = useMemo(() => {
    return [...new Set(activities.map((a) => a.title))].filter(Boolean).sort();
  }, [activities]);

  const filtered = useMemo(() => {
    if (selectedDate === "all") return activities;
    return activities.filter((a) => {
      if (a.dateMetadata?.dateKey === selectedDate) return true;
      if (a.activityDate === selectedDate) return true;
      return a.date === selectedDate;
    });
  }, [activities, selectedDate]);

  const timeDistribution = useMemo(() => {
    const dist = {};
    filtered.forEach((a) => {
      if (!dist[a.title]) dist[a.title] = 0;
      dist[a.title] += a.durationMinutes || 0;
    });
    return Object.entries(dist)
      .map(([name, minutes]) => ({ name, minutes }))
      .sort((a, b) => b.minutes - a.minutes);
  }, [filtered]);

  const weeklyActivity = useMemo(() => {
    const days = [
      "الأحد",
      "الإثنين",
      "الثلاثاء",
      "الأربعاء",
      "الخميس",
      "الجمعة",
      "السبت",
    ];
    const today = new Date().getDay();
    const weekDays = [
      ...days.slice(today + 1),
      ...days.slice(0, today + 1),
    ].reverse();
    const dailyMinutes = Array(7).fill(0);
    const dailyCounts = Array(7).fill(0);

    filtered.forEach((a) => {
      if (!a.activityDate) return;
      const d = new Date(`${a.activityDate}T12:00:00`);
      const dayIndex = (d.getDay() + 7 - today) % 7;
      dailyMinutes[dayIndex] += a.durationMinutes || 0;
      dailyCounts[dayIndex]++;
    });

    return weekDays.map((day, i) => ({
      day,
      minutes: dailyMinutes[i],
      tasks: dailyCounts[i],
    }));
  }, [filtered]);

  const mostActiveHours = useMemo(() => {
    const hourly = Array(24).fill(0);
    filtered.forEach((a) => {
      if (a.timeMode === "estimated" || !a.startTime) return;
      const hour = parseInt(a.startTime.split(":")[0], 10);
      if (!Number.isNaN(hour) && hour >= 0 && hour < 24) hourly[hour]++;
    });
    return hourly.map((count, hour) => ({ hour: `${hour}:00`, count }));
  }, [filtered]);

  const summary = useMemo(() => {
    const totalMinutes = timeDistribution.reduce((s, i) => s + i.minutes, 0);
    const uniqueDates = new Set(
      filtered.map((a) => a.activityDate || a.dateMetadata?.dateKey || a.date),
    ).size;
    return {
      totalMinutes,
      totalTasks: filtered.length,
      avgDailyMinutes: Math.round(totalMinutes / (uniqueDates || 1)),
      daysTracked: uniqueDates,
    };
  }, [timeDistribution, filtered]);

  const activityProgress = useMemo(() => {
    if (!selectedActivity) return [];
    const byDate = {};
    activities
      .filter((a) => a.title === selectedActivity)
      .forEach((a) => {
        const date = a.date;
        if (!byDate[date]) {
          byDate[date] = {
            date,
            minutes: 0,
            count: 0,
            iso: a.activityDate || "",
          };
        }
        byDate[date].minutes += a.durationMinutes || 0;
        byDate[date].count += 1;
      });
    return Object.values(byDate).sort((a, b) =>
      (a.iso || "").localeCompare(b.iso || ""),
    );
  }, [activities, selectedActivity]);

  const activityStats = useMemo(() => {
    if (!activityProgress.length) {
      return {
        totalMinutes: 0,
        totalOccurrences: 0,
        avgMinutesPerDay: 0,
        avgMinutesPerOccurrence: 0,
        bestDay: null,
        worstDay: null,
        trend: 0,
        trendDirection: "مستقر",
      };
    }
    const totalMinutes = activityProgress.reduce((s, e) => s + e.minutes, 0);
    const totalOccurrences = activityProgress.reduce((s, e) => s + e.count, 0);
    const bestDay = [...activityProgress].sort(
      (a, b) => b.minutes - a.minutes,
    )[0];
    const worstDay = [...activityProgress].sort(
      (a, b) => a.minutes - b.minutes,
    )[0];
    const trend =
      activityProgress.length >= 2
        ? (activityProgress[activityProgress.length - 1].minutes -
            activityProgress[0].minutes) /
          (activityProgress.length - 1)
        : 0;
    return {
      totalMinutes,
      totalOccurrences,
      avgMinutesPerDay: Math.round(totalMinutes / activityProgress.length),
      avgMinutesPerOccurrence: Math.round(totalMinutes / totalOccurrences),
      bestDay,
      worstDay,
      trend: Math.round(trend),
      trendDirection: trend > 0 ? "تصاعدي" : trend < 0 ? "تنازلي" : "مستقر",
    };
  }, [activityProgress]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <AnimatedContainer>
        <div className="bg-gray-800 rounded-lg p-8 shadow-lg text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            لا توجد إحصائيات بعد
          </h2>
          <p className="text-gray-300 mb-6">
            أضف بعض الأنشطة لتبدأ في رؤية الإحصائيات هنا
          </p>
          <Link
            to="/activity"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg"
          >
            إضافة نشاط جديد
          </Link>
        </div>
      </AnimatedContainer>
    );
  }

  return (
    <div className="space-y-8">
      <AnimatedContainer>
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-bold text-white mb-4">اختر التاريخ</h2>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedDate("all")}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                selectedDate === "all"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              كل الفترات
            </button>
            {availableDates.map((d) => (
              <button
                key={d.key}
                type="button"
                onClick={() => setSelectedDate(d.key)}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  selectedDate === d.key
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {d.date}
                <span className="bg-gray-600 text-white text-xs ml-2 px-2 py-0.5 rounded-full">
                  {d.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </AnimatedContainer>

      <AnimatedContainer delay={0.1}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-lg p-5 shadow-lg">
            <h3 className="text-indigo-300 text-sm font-medium mb-1">
              إجمالي الوقت
            </h3>
            <p className="text-white text-3xl font-bold">
              {formatMinutes(summary.totalMinutes)}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-5 shadow-lg">
            <h3 className="text-indigo-300 text-sm font-medium mb-1">
              عدد المهام
            </h3>
            <p className="text-white text-3xl font-bold">{summary.totalTasks}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-5 shadow-lg">
            <h3 className="text-indigo-300 text-sm font-medium mb-1">
              متوسط يومي
            </h3>
            <p className="text-white text-3xl font-bold">
              {formatMinutes(summary.avgDailyMinutes)}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-5 shadow-lg">
            <h3 className="text-indigo-300 text-sm font-medium mb-1">
              أيام التتبع
            </h3>
            <p className="text-white text-3xl font-bold">{summary.daysTracked}</p>
          </div>
        </div>
      </AnimatedContainer>

      <AnimatedContainer delay={0.2}>
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-bold text-white mb-6">النشاط الأسبوعي</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" tick={{ fill: "#E5E7EB" }} />
              <YAxis tick={{ fill: "#E5E7EB" }} unit=" دقيقة" />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: "#E5E7EB" }} />
              <Bar dataKey="minutes" name="الدقائق" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="tasks" name="المهام" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </AnimatedContainer>

      <AnimatedContainer delay={0.3}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-bold text-white mb-6">توزيع الوقت</h2>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={timeDistribution.slice(0, 5)}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="minutes"
                  nameKey="name"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {timeDistribution.slice(0, 5).map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatMinutes(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3 mt-4">
              {timeDistribution.slice(0, 5).map((item, index) => (
                <div key={item.name} className="flex items-center">
                  <span
                    className="inline-block w-3 h-3 rounded-full mr-3"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-gray-300 flex-1">{item.name}</span>
                  <span className="text-white font-medium">
                    {formatMinutes(item.minutes)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-bold text-white mb-6">
              أكثر ساعات النشاط
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mostActiveHours}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="hour"
                  tick={{ fill: "#E5E7EB" }}
                  tickFormatter={(hour) => {
                    const h = parseInt(hour.split(":")[0], 10);
                    return h < 12
                      ? `${h === 0 ? 12 : h} ص`
                      : `${h === 12 ? 12 : h - 12} م`;
                  }}
                />
                <YAxis tick={{ fill: "#E5E7EB" }} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="عدد الأنشطة"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  dot={{ fill: "#8B5CF6", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-500 mt-2">
              الساعات التقديرية مش بتدخل في الرسم ده (مفيش ساعة بدء)
            </p>
          </div>
        </div>
      </AnimatedContainer>

      <AnimatedContainer delay={0.4}>
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-bold text-white mb-6">
            أكثر الأنشطة استهلاكاً للوقت
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-right text-gray-400 font-medium py-2">
                    النشاط
                  </th>
                  <th className="text-right text-gray-400 font-medium py-2">
                    إجمالي الوقت
                  </th>
                  <th className="text-right text-gray-400 font-medium py-2">
                    النسبة
                  </th>
                </tr>
              </thead>
              <tbody>
                {timeDistribution.map((item, index) => (
                  <tr key={item.name}>
                    <td className="py-3 text-white">{item.name}</td>
                    <td className="py-3 text-white">
                      {formatMinutes(item.minutes)}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center">
                        <span className="text-white mr-2">
                          {summary.totalMinutes
                            ? (
                                (item.minutes / summary.totalMinutes) *
                                100
                              ).toFixed(0)
                            : 0}
                          %
                        </span>
                        <div className="w-32 bg-gray-700 rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${
                                summary.totalMinutes
                                  ? (item.minutes / summary.totalMinutes) * 100
                                  : 0
                              }%`,
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </AnimatedContainer>

      <AnimatedContainer delay={0.5}>
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-bold text-white mb-6">
            تحليل تطور النشاط
          </h2>
          <div className="mb-6 flex flex-wrap gap-2">
            {availableActivities.map((title) => (
              <button
                key={title}
                type="button"
                onClick={() => setSelectedActivity(title)}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  selectedActivity === title
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {title}
              </button>
            ))}
          </div>

          {selectedActivity ? (
            activityProgress.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="text-gray-400 text-sm mb-1">إجمالي الوقت</h4>
                    <p className="text-white text-xl font-bold">
                      {formatMinutes(activityStats.totalMinutes)}
                    </p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="text-gray-400 text-sm mb-1">التكرار</h4>
                    <p className="text-white text-xl font-bold">
                      {activityStats.totalOccurrences} مرة
                    </p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="text-gray-400 text-sm mb-1">متوسط يومي</h4>
                    <p className="text-white text-xl font-bold">
                      {formatMinutes(activityStats.avgMinutesPerDay)}
                    </p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="text-gray-400 text-sm mb-1">متوسط المرة</h4>
                    <p className="text-white text-xl font-bold">
                      {formatMinutes(activityStats.avgMinutesPerOccurrence)}
                    </p>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={activityProgress}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" tick={{ fill: "#E5E7EB" }} />
                    <YAxis tick={{ fill: "#E5E7EB" }} unit=" دقيقة" />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="minutes"
                      name="الدقائق"
                      stroke="#10B981"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </>
            ) : (
              <p className="text-gray-400 text-center py-8">
                لا توجد بيانات كافية لهذا النشاط
              </p>
            )
          ) : (
            <p className="text-gray-400 text-center py-8">
              اختر نشاطًا من القائمة لعرض تحليله
            </p>
          )}
        </div>
      </AnimatedContainer>
    </div>
  );
}
