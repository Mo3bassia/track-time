import { useState, useEffect } from "react";
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

export default function Stats() {
  const [timeDistribution, setTimeDistribution] = useState([]);
  const [weeklyActivity, setWeeklyActivity] = useState([]);
  const [mostActiveHours, setMostActiveHours] = useState([]);
  const [summary, setSummary] = useState({
    totalMinutes: 0,
    totalTasks: 0,
    avgDailyMinutes: 0,
    daysTracked: 0,
  });
  const [loading, setLoading] = useState(true);

  // إضافة state لاختيار التاريخ
  const [selectedDate, setSelectedDate] = useState("all");
  const [availableDates, setAvailableDates] = useState([]);

  // إضافة state جديدة لتتبع نشاط معين
  const [selectedActivity, setSelectedActivity] = useState("");
  const [activityProgress, setActivityProgress] = useState([]);
  const [availableActivities, setAvailableActivities] = useState([]);

  // إضافة state جديدة لإحصائيات النشاط المحدد
  const [activityStats, setActivityStats] = useState({
    totalMinutes: 0,
    totalOccurrences: 0,
    avgMinutesPerDay: 0,
    avgMinutesPerOccurrence: 0,
    bestDay: null,
    worstDay: null,
    trend: 0,
    trendDirection: "مستقر",
  });

  useEffect(() => {
    // استدعاء دالة الحصول على الإحصائيات عند تغيير التاريخ المختار
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // جلب البيانات من localStorage
      const activities = JSON.parse(
        localStorage.getItem("recentActivities") || "[]"
      );

      // بيانات فارغة إذا لم يكن هناك أنشطة
      if (activities.length === 0) {
        setLoading(false);
        return;
      }

      // استخراج قائمة التواريخ المتوفرة
      const dates = [];
      const dateMap = {};

      activities.forEach((activity) => {
        // بالنسبة للأنشطة التي تحتوي على بيانات وصفية
        if (activity.dateMetadata && activity.dateMetadata.dateKey) {
          const { dateKey } = activity.dateMetadata;
          if (!dateMap[dateKey]) {
            dateMap[dateKey] = {
              date: activity.date,
              key: dateKey,
              count: 0,
            };
          }
          dateMap[dateKey].count++;
        }
        // بالنسبة للأنشطة القديمة بدون بيانات وصفية
        else {
          if (!dateMap[activity.date]) {
            dateMap[activity.date] = {
              date: activity.date,
              key: activity.date,
              count: 0,
            };
          }
          dateMap[activity.date].count++;
        }
      });

      // تحويل التواريخ إلى مصفوفة وترتيبها
      const sortedDates = Object.values(dateMap).sort((a, b) => {
        // ترتيب تنازلي (الأحدث أولاً)
        const dateA = a.key.split("-").map((n) => parseInt(n));
        const dateB = b.key.split("-").map((n) => parseInt(n));

        // ترتيب حسب السنة ثم الشهر ثم اليوم
        if (dateA[2] !== dateB[2]) return dateB[2] - dateA[2];
        if (dateA[1] !== dateB[1]) return dateB[1] - dateA[1];
        return dateB[0] - dateA[0];
      });

      setAvailableDates(sortedDates);

      // فلترة الأنشطة حسب التاريخ المختار
      let filteredActivities = activities;

      if (selectedDate !== "all") {
        filteredActivities = activities.filter((activity) => {
          // بالنسبة للأنشطة التي تحتوي على بيانات وصفية
          if (activity.dateMetadata && activity.dateMetadata.dateKey) {
            return activity.dateMetadata.dateKey === selectedDate;
          }
          // بالنسبة للأنشطة القديمة
          return activity.date === selectedDate;
        });
      }

      // استخراج جميع الأنشطة المتميزة الموجودة في البيانات
      const uniqueActivities = new Set();
      activities.forEach((activity) => {
        uniqueActivities.add(activity.title);
      });
      setAvailableActivities(Array.from(uniqueActivities).sort());

      // إذا تم اختيار نشاط، نقوم بتحليل تطوره عبر الزمن
      if (selectedActivity) {
        analyzeActivityProgress(activities, selectedActivity);
      }

      // تحليل البيانات المفلترة
      calculateStats(filteredActivities);
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // دالة لتحليل وحساب الإحصائيات
  const calculateStats = (activities) => {
    // 1. حساب توزيع الوقت حسب النشاط
    const distribution = activities.reduce((acc, activity) => {
      if (!acc[activity.title]) {
        acc[activity.title] = 0;
      }
      const minutes = durationToMinutes(activity.duration);
      acc[activity.title] += minutes;
      return acc;
    }, {});

    const formattedDistribution = Object.entries(distribution)
      .map(([name, minutes]) => ({ name, minutes }))
      .sort((a, b) => b.minutes - a.minutes);

    setTimeDistribution(formattedDistribution);

    // 2. حساب النشاط الأسبوعي
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

    activities.forEach((activity) => {
      // استخراج التاريخ من النشاط
      const activityDate = new Date();
      const dayIndex = (activityDate.getDay() + 7 - today) % 7;

      const minutes = durationToMinutes(activity.duration);
      dailyMinutes[dayIndex] += minutes;
      dailyCounts[dayIndex]++;
    });

    const weeklyData = weekDays.map((day, i) => ({
      day,
      minutes: dailyMinutes[i],
      tasks: dailyCounts[i],
    }));

    setWeeklyActivity(weeklyData);

    // 3. تحسين حساب أكثر ساعات اليوم نشاطاً
    const hourlyActivity = Array(24).fill(0);

    activities.forEach((activity) => {
      try {
        // استخراج الساعات من وقت البداية
        const timeString = activity.time.split(" - ")[0]; // مثال: "10:30 صباحاً"
        let hour;

        // معالجة النص للحصول على الساعة بتنسيق 24 ساعة
        if (timeString.includes("صباحاً") || timeString.includes("ص")) {
          // وقت صباحي
          const timeParts = timeString.split(":");
          hour = parseInt(timeParts[0]);
          // تحويل 12 صباحاً إلى 0
          if (hour === 12) hour = 0;
        } else if (timeString.includes("مساءً") || timeString.includes("م")) {
          // وقت مسائي
          const timeParts = timeString.split(":");
          hour = parseInt(timeParts[0]);
          // تحويل 1-11 مساءً إلى 13-23
          if (hour !== 12) hour += 12;
        } else {
          // إذا كان التنسيق مختلفًا، حاول استخراج الساعة مباشرة
          hour = parseInt(timeString.split(":")[0]);
        }

        // التأكد من صحة الساعة
        if (!isNaN(hour) && hour >= 0 && hour < 24) {
          hourlyActivity[hour]++;
        }
      } catch (error) {
        console.error("Error parsing time:", activity.time, error);
      }
    });

    // تنسيق البيانات للرسم البياني
    const hourlyData = hourlyActivity.map((count, hour) => ({
      hour: `${hour}:00`,
      count,
    }));

    setMostActiveHours(hourlyData);

    // 4. ملخص الإحصائيات
    const totalMinutes = formattedDistribution.reduce(
      (sum, item) => sum + item.minutes,
      0
    );
    const uniqueDates = new Set(activities.map((a) => a.date)).size;

    setSummary({
      totalMinutes: totalMinutes,
      totalTasks: activities.length,
      avgDailyMinutes: Math.round(totalMinutes / (uniqueDates || 1)),
      daysTracked: uniqueDates,
    });
  };

  // دالة جديدة لتحليل تطور النشاط عبر الزمن
  const analyzeActivityProgress = (activities, activityTitle) => {
    // تجميع الأنشطة حسب التاريخ
    const activityByDate = {};

    // فلترة الأنشطة للعنوان المحدد
    const filteredActivities = activities.filter(
      (a) => a.title === activityTitle
    );

    // تجميع الدقائق حسب التاريخ
    filteredActivities.forEach((activity) => {
      const date = activity.date;
      if (!activityByDate[date]) {
        activityByDate[date] = {
          minutes: 0,
          count: 0,
          activities: [],
        };
      }

      // استخراج الدقائق من المدة باستخدام دالة durationToMinutes
      const minutes = durationToMinutes(activity.duration);
      activityByDate[date].minutes += minutes;
      activityByDate[date].count += 1;
      activityByDate[date].activities.push({
        id: activity.id,
        duration: activity.duration,
        minutes: minutes,
        time: activity.time,
      });
    });

    // تحويل البيانات إلى تنسيق مناسب للرسم البياني
    const progressData = Object.entries(activityByDate)
      .map(([date, data]) => ({
        date,
        minutes: data.minutes,
        count: data.count,
        activities: data.activities,
      }))
      .sort((a, b) => {
        // ترتيب تصاعدي حسب التاريخ (من الأقدم للأحدث)
        try {
          // محاولة استخراج مكونات التاريخ من النص
          const dateA = extractDateComponents(a.date);
          const dateB = extractDateComponents(b.date);

          // مقارنة السنة أولاً، ثم الشهر، ثم اليوم
          if (dateA.year !== dateB.year) return dateA.year - dateB.year;
          if (dateA.month !== dateB.month) return dateA.month - dateB.month;
          return dateA.day - dateB.day;
        } catch (error) {
          console.error("Error sorting dates:", error);
          return 0;
        }
      });

    // حساب بعض الإحصائيات الإضافية
    const totalMinutes = progressData.reduce(
      (sum, entry) => sum + entry.minutes,
      0
    );
    const totalOccurrences = progressData.reduce(
      (sum, entry) => sum + entry.count,
      0
    );
    const avgMinutesPerDay = totalMinutes / progressData.length || 0;
    const avgMinutesPerOccurrence = totalMinutes / totalOccurrences || 0;

    // تحديد الأيام الأفضل والأسوأ
    const bestDay =
      [...progressData].sort((a, b) => b.minutes - a.minutes)[0] || null;
    const worstDay =
      [...progressData].sort((a, b) => a.minutes - b.minutes)[0] || null;

    // حساب متوسط الأيام المتتالية التي تم فيها هذا النشاط
    let streaks = [];
    let currentStreak = 0;
    let previousDate = null;

    // تحليل الاتجاهات
    const trend =
      progressData.length >= 2
        ? (progressData[progressData.length - 1].minutes -
            progressData[0].minutes) /
          (progressData.length > 1 ? progressData.length - 1 : 1)
        : 0;

    // إضافة الإحصائيات الإضافية
    const activityStats = {
      totalMinutes,
      totalOccurrences,
      avgMinutesPerDay: Math.round(avgMinutesPerDay),
      avgMinutesPerOccurrence: Math.round(avgMinutesPerOccurrence),
      bestDay,
      worstDay,
      trend: Math.round(trend),
      trendDirection: trend > 0 ? "تصاعدي" : trend < 0 ? "تنازلي" : "مستقر",
    };

    setActivityProgress(progressData);
    setActivityStats(activityStats);
  };

  // دالة مساعدة لاستخراج مكونات التاريخ من النص
  const extractDateComponents = (dateString) => {
    try {
      // مثال: "السبت، 8 مارس 2025"
      const parts = dateString.split("،");
      if (parts.length < 2) throw new Error("Date format incorrect");

      const datePart = parts[1].trim().split(" ");
      if (datePart.length < 3) throw new Error("Date components missing");

      const day = parseInt(datePart[0]);
      const monthName = datePart[1];
      const year = parseInt(datePart[2]);

      // تحويل اسم الشهر العربي إلى رقم
      const months = [
        "يناير",
        "فبراير",
        "مارس",
        "إبريل",
        "مايو",
        "يونيو",
        "يوليو",
        "أغسطس",
        "سبتمبر",
        "أكتوبر",
        "نوفمبر",
        "ديسمبر",
      ];

      const month = months.findIndex((m) => m === monthName) + 1;
      if (month === 0) throw new Error("Month name not recognized");

      return { day, month, year };
    } catch (error) {
      console.error("Error extracting date components:", error, dateString);
      // إرجاع تاريخ افتراضي في حالة الخطأ
      return { day: 1, month: 1, year: 2023 };
    }
  };

  // دالة لمعالجة اختيار نشاط
  const handleActivitySelect = (activity) => {
    setSelectedActivity(activity);
    const activities = JSON.parse(
      localStorage.getItem("recentActivities") || "[]"
    );
    analyzeActivityProgress(activities, activity);
  };

  // دالة تحويل نص المدة إلى دقائق
  const durationToMinutes = (duration) => {
    try {
      // تحليل النص مثل "2h 30m"
      const hourMatch = duration.match(/(\d+)h/);
      const minuteMatch = duration.match(/(\d+)m/);

      const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
      const minutes = minuteMatch ? parseInt(minuteMatch[1]) : 0;

      return hours * 60 + minutes;
    } catch (error) {
      console.error("Error parsing duration:", duration, error);
      return 0;
    }
  };

  // دالة لتنسيق الدقائق بشكل مقروء
  const formatMinutes = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
      return `${hours} ساعة ${minutes > 0 ? `و ${minutes} دقيقة` : ""}`;
    } else {
      return `${minutes} دقيقة`;
    }
  };

  // ألوان للرسوم البيانية
  const COLORS = [
    "#4F46E5",
    "#7C3AED",
    "#8B5CF6",
    "#A78BFA",
    "#C4B5FD",
    "#4338CA",
    "#4F46E5",
    "#818CF8",
  ];

  // تنسيق tooltip للرسوم البيانية
  const CustomTooltip = ({ active, payload, label, valuePrefix }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-3 rounded shadow-lg border border-gray-700">
          <p className="text-gray-300 mb-1">{`${label}`}</p>
          <p className="text-white font-medium">
            {payload[0].dataKey === "minutes"
              ? formatMinutes(payload[0].value)
              : `${valuePrefix || ""}${payload[0].value}`}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // عرض رسالة إذا لم تكن هناك بيانات
  if (timeDistribution.length === 0) {
    return (
      <AnimatedContainer>
        <div className="bg-gray-800 rounded-lg p-8 shadow-lg text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            لا توجد إحصائيات بعد
          </h2>
          <p className="text-gray-300 mb-6">
            أضف بعض الأنشطة لتبدأ في رؤية الإحصائيات هنا
          </p>
          <div className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
            <Link to="/activity">إضافة نشاط جديد</Link>
          </div>
        </div>
      </AnimatedContainer>
    );
  }

  return (
    <div className="space-y-8">
      {/* إضافة منتقي التاريخ */}
      <AnimatedContainer>
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-bold text-white mb-4">اختر التاريخ</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedDate("all")}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                selectedDate === "all"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              كل الفترات
            </button>

            {availableDates.map((date) => (
              <button
                key={date.key}
                onClick={() => setSelectedDate(date.key)}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  selectedDate === date.key
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {date.date}
                <span className="bg-gray-600 text-white text-xs ml-2 px-2 py-0.5 rounded-full">
                  {date.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </AnimatedContainer>

      {/* Summary Cards */}
      <AnimatedContainer delay={0.1}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-lg p-5 shadow-lg">
            <h3 className="text-indigo-300 text-sm font-medium mb-1">
              إجمالي الوقت
            </h3>
            <p className="text-white text-3xl font-bold">
              {formatMinutes(summary.totalMinutes)}
            </p>
            <p className="text-gray-400 mt-1">من الوقت المسجل</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-5 shadow-lg">
            <h3 className="text-indigo-300 text-sm font-medium mb-1">
              عدد المهام
            </h3>
            <p className="text-white text-3xl font-bold">
              {summary.totalTasks}
            </p>
            <p className="text-gray-400 mt-1">مهمة</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-5 shadow-lg">
            <h3 className="text-indigo-300 text-sm font-medium mb-1">
              متوسط يومي
            </h3>
            <p className="text-white text-3xl font-bold">
              {formatMinutes(summary.avgDailyMinutes)}
            </p>
            <p className="text-gray-400 mt-1">في اليوم</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-5 shadow-lg">
            <h3 className="text-indigo-300 text-sm font-medium mb-1">
              أيام التتبع
            </h3>
            <p className="text-white text-3xl font-bold">
              {summary.daysTracked}
            </p>
            <p className="text-gray-400 mt-1">يوم</p>
          </div>
        </div>
      </AnimatedContainer>

      {/* Weekly Activity Chart */}
      <AnimatedContainer delay={0.2}>
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-bold text-white mb-6">النشاط الأسبوعي</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="day"
                tick={{ fill: "#E5E7EB" }}
                axisLine={{ stroke: "#4B5563" }}
              />
              <YAxis
                tick={{ fill: "#E5E7EB" }}
                axisLine={{ stroke: "#4B5563" }}
                unit=" دقيقة"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: "#E5E7EB" }} />
              <Bar
                dataKey="minutes"
                name="الدقائق"
                fill="#4F46E5"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="tasks"
                name="المهام"
                fill="#8B5CF6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </AnimatedContainer>

      {/* Time Distribution and Active Hours */}
      <AnimatedContainer delay={0.3}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Time Distribution */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-bold text-white mb-6">توزيع الوقت</h2>
            <div className="flex items-center justify-center h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={timeDistribution.slice(0, 5)} // أهم 5 أنشطة
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="minutes"
                    nameKey="name"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {timeDistribution.slice(0, 5).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatMinutes(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 mt-4">
              {timeDistribution.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center">
                  <span
                    className="inline-block w-3 h-3 rounded-full mr-3"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></span>
                  <span className="text-gray-300 flex-1">{item.name}</span>
                  <span className="text-white font-medium">
                    {formatMinutes(item.minutes)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Active Hours - تحسين عنوان المحور السيني */}
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
                  axisLine={{ stroke: "#4B5563" }}
                  // تنسيق تسميات المحور السيني لتظهر بشكل أفضل
                  tickFormatter={(hour) => {
                    const h = parseInt(hour.split(":")[0]);
                    return h < 12
                      ? `${h === 0 ? 12 : h} ص`
                      : `${h === 12 ? 12 : h - 12} م`;
                  }}
                />
                <YAxis
                  tick={{ fill: "#E5E7EB" }}
                  axisLine={{ stroke: "#4B5563" }}
                />
                <Tooltip
                  content={<CustomTooltip valuePrefix="" />}
                  // تنسيق عنوان tooltip ليظهر بتنسيق 12 ساعة
                  labelFormatter={(hour) => {
                    const h = parseInt(hour.split(":")[0]);
                    return h < 12
                      ? `${h === 0 ? 12 : h} صباحاً`
                      : `${h === 12 ? 12 : h - 12} مساءً`;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="عدد الأنشطة"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  dot={{ fill: "#8B5CF6", r: 4 }}
                  activeDot={{ r: 6, fill: "#4F46E5" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </AnimatedContainer>

      {/* Top Activities Table */}
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
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-gray-800" : "bg-gray-750"}
                  >
                    <td className="py-3 text-white">{item.name}</td>
                    <td className="py-3 text-white">
                      {formatMinutes(item.minutes)}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center">
                        <span className="text-white mr-2">
                          {(
                            (item.minutes / summary.totalMinutes) *
                            100
                          ).toFixed(0)}
                          %
                        </span>
                        <div className="w-32 bg-gray-700 rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${
                                (item.minutes / summary.totalMinutes) * 100
                              }%`,
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          ></div>
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

      {/* Activity Progress Tracking */}
      <AnimatedContainer delay={0.5}>
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-bold text-white mb-6">
            تحليل تطور النشاط
          </h2>

          {/* اختيار النشاط */}
          <div className="mb-6">
            <label className="block text-gray-300 mb-2">
              اختر النشاط للتحليل
            </label>
            <div className="flex flex-wrap gap-2">
              {availableActivities.map((activity) => (
                <button
                  key={activity}
                  onClick={() => handleActivitySelect(activity)}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    selectedActivity === activity
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {activity}
                </button>
              ))}
            </div>
          </div>

          {/* عرض تقدم النشاط */}
          {selectedActivity ? (
            <>
              <h3 className="text-indigo-300 mb-4">
                تطور نشاط: {selectedActivity}
              </h3>

              {activityProgress.length > 0 ? (
                <>
                  {/* إضافة بطاقات إحصائيات النشاط */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-700 rounded-lg p-4 shadow-md">
                      <h4 className="text-gray-400 text-sm mb-1">
                        إجمالي الوقت
                      </h4>
                      <p className="text-white text-xl font-bold">
                        {formatMinutes(activityStats.totalMinutes)}
                      </p>
                    </div>

                    <div className="bg-gray-700 rounded-lg p-4 shadow-md">
                      <h4 className="text-gray-400 text-sm mb-1">
                        عدد مرات التكرار
                      </h4>
                      <p className="text-white text-xl font-bold">
                        {activityStats.totalOccurrences} مرة
                      </p>
                    </div>

                    <div className="bg-gray-700 rounded-lg p-4 shadow-md">
                      <h4 className="text-gray-400 text-sm mb-1">
                        المتوسط اليومي
                      </h4>
                      <p className="text-white text-xl font-bold">
                        {formatMinutes(activityStats.avgMinutesPerDay)}
                      </p>
                    </div>

                    <div className="bg-gray-700 rounded-lg p-4 shadow-md">
                      <h4 className="text-gray-400 text-sm mb-1">
                        متوسط المرة الواحدة
                      </h4>
                      <p className="text-white text-xl font-bold">
                        {formatMinutes(activityStats.avgMinutesPerOccurrence)}
                      </p>
                    </div>
                  </div>

                  {/* إضافة معلومات الاتجاهات */}
                  <div className="mb-6 bg-gray-750 p-4 rounded-lg">
                    <div className="flex flex-wrap items-center gap-6">
                      {activityStats.bestDay && (
                        <div>
                          <span className="text-gray-400 text-sm mb-1 block">
                            أفضل يوم
                          </span>
                          <div className="flex items-center">
                            <span className="text-green-400 text-2xl mr-2">
                              🏆
                            </span>
                            <div>
                              <div className="text-white font-medium">
                                {activityStats.bestDay.date}
                              </div>
                              <div className="text-green-400 text-sm">
                                {formatMinutes(activityStats.bestDay.minutes)}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {activityStats.worstDay && (
                        <div>
                          <span className="text-gray-400 text-sm mb-1 block">
                            اليوم الأقل
                          </span>
                          <div className="flex items-center">
                            <span className="text-amber-400 text-2xl mr-2">
                              📉
                            </span>
                            <div>
                              <div className="text-white font-medium">
                                {activityStats.worstDay.date}
                              </div>
                              <div className="text-amber-400 text-sm">
                                {formatMinutes(activityStats.worstDay.minutes)}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div>
                        <span className="text-gray-400 text-sm mb-1 block">
                          اتجاه الأداء
                        </span>
                        <div className="flex items-center">
                          <span
                            className={`text-2xl mr-2 ${
                              activityStats.trend > 0
                                ? "text-green-400"
                                : activityStats.trend < 0
                                ? "text-red-400"
                                : "text-blue-400"
                            }`}
                          >
                            {activityStats.trend > 0
                              ? "📈"
                              : activityStats.trend < 0
                              ? "📉"
                              : "⚖️"}
                          </span>
                          <div>
                            <div className="text-white font-medium">
                              {activityStats.trendDirection}
                            </div>
                            <div
                              className={`text-sm ${
                                activityStats.trend > 0
                                  ? "text-green-400"
                                  : activityStats.trend < 0
                                  ? "text-red-400"
                                  : "text-blue-400"
                              }`}
                            >
                              {activityStats.trend > 0 ? "+" : ""}
                              {activityStats.trend} دقيقة / يوم
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* رسم بياني لتطور النشاط - مصنف بشكل صحيح من الأقدم للأحدث */}
                  <div className="bg-gray-750 p-4 rounded-lg mb-6">
                    <h4 className="text-sm font-medium text-gray-300 mb-3">
                      تطور الوقت عبر الأيام
                    </h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={activityProgress}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis
                          dataKey="date"
                          tick={{ fill: "#E5E7EB" }}
                          axisLine={{ stroke: "#4B5563" }}
                        />
                        <YAxis
                          tick={{ fill: "#E5E7EB" }}
                          axisLine={{ stroke: "#4B5563" }}
                          unit=" دقيقة"
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                          type="monotone"
                          dataKey="minutes"
                          name="الدقائق"
                          stroke="#10B981"
                          strokeWidth={2}
                          dot={{ fill: "#10B981", r: 4 }}
                          activeDot={{ r: 6, fill: "#059669" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* رسم بياني لعدد مرات تكرار النشاط في اليوم */}
                  <div className="bg-gray-750 p-4 rounded-lg mb-6">
                    <h4 className="text-sm font-medium text-gray-300 mb-3">
                      عدد مرات تكرار النشاط في كل يوم
                    </h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={activityProgress}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis
                          dataKey="date"
                          tick={{ fill: "#E5E7EB" }}
                          axisLine={{ stroke: "#4B5563" }}
                        />
                        <YAxis
                          tick={{ fill: "#E5E7EB" }}
                          axisLine={{ stroke: "#4B5563" }}
                          allowDecimals={false}
                        />
                        <Tooltip content={<CustomTooltip valuePrefix="" />} />
                        <Bar
                          dataKey="count"
                          name="عدد المرات"
                          fill="#8B5CF6"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-6 overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th className="text-right text-gray-400 font-medium py-2">
                            التاريخ
                          </th>
                          <th className="text-right text-gray-400 font-medium py-2">
                            إجمالي الوقت
                          </th>
                          <th className="text-right text-gray-400 font-medium py-2">
                            عدد المرات
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {activityProgress.map((item, index) => (
                          <tr
                            key={index}
                            className={
                              index % 2 === 0 ? "bg-gray-800" : "bg-gray-750"
                            }
                          >
                            <td className="py-3 text-white">{item.date}</td>
                            <td className="py-3 text-emerald-400 font-medium">
                              {formatMinutes(item.minutes)}
                            </td>
                            <td className="py-3 text-indigo-300">
                              {item.count} مرة
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">
                    لا توجد بيانات كافية لهذا النشاط
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">
                اختر نشاطًا من القائمة لعرض تحليله
              </p>
            </div>
          )}
        </div>
      </AnimatedContainer>
    </div>
  );
}
