import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AnimatedContainer from "../components/AnimatedContainer";

const formatArabicTime = (time) => {
  const [hours, minutes] = time.split(":");
  let period = parseInt(hours) < 12 ? "ص" : "م";
  let formattedHours = parseInt(hours) % 12 || 12;
  return `${formattedHours}:${minutes} ${period}`;
};

export default function Home() {
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState({
    totalTime: "0h 0m",
    mostTimeActivity: "-",
    activityCount: 0,
  });
  const [productiveScore, setProductiveScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeDistribution, setTimeDistribution] = useState([]);
  const [goalProgress, setGoalProgress] = useState({ completed: 0, total: 0 });

  // دالة تحويل المدة من صيغة "2h 30m" إلى دقائق
  const durationToMinutes = (duration) => {
    try {
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

  // دالة تنسيق الدقائق إلى صيغة مقروءة
  const formatMinutes = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
      return `${hours} ساعة ${minutes > 0 ? `و ${minutes} دقيقة` : ""}`;
    } else {
      return `${minutes} دقيقة`;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const saved = localStorage.getItem("recentActivities");
        const allActivities = saved ? JSON.parse(saved) : [];

        // تحسين فلترة الأنشطة باستخدام البيانات الوصفية
        const today = new Date();
        const todayKey = `${today.getDate()}-${
          today.getMonth() + 1
        }-${today.getFullYear()}`;

        // فلترة الأنشطة لليوم الحالي
        const todayActivities = allActivities.filter((activity) => {
          // طريقة 1: استخدام البيانات الوصفية إن وجدت
          if (activity.dateMetadata && activity.dateMetadata.dateKey) {
            return activity.dateMetadata.dateKey === todayKey;
          }

          // طريقة 2: محاولة استخراج التاريخ من النص (للتوافق مع البيانات القديمة)
          try {
            // تجزئة التاريخ النصي
            const parts = activity.date.split("،");
            if (parts.length < 2) return false;

            const datePart = parts[1].trim();
            const [day, month, year] = datePart.split(" ");

            // تحويل الشهر لرقم
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

            const monthIndex = months.findIndex((m) => month.startsWith(m));

            if (
              parseInt(day) === today.getDate() &&
              monthIndex === today.getMonth() &&
              parseInt(year) === today.getFullYear()
            ) {
              return true;
            }
          } catch (e) {
            console.error("Error parsing date:", activity.date);
          }

          return false;
        });

        console.log(`Found ${todayActivities.length} activities for today`);
        setRecentActivities(todayActivities);

        // حساب الإحصائيات ليوم اليوم
        if (todayActivities.length > 0) {
          // تحسين حساب وقت الأنشطة باستخدام دالة التحويل لدقائق
          let totalMinutes = 0;
          const timeByActivity = {};

          todayActivities.forEach((activity) => {
            const minutes = durationToMinutes(activity.duration);
            totalMinutes += minutes;

            if (!timeByActivity[activity.title]) {
              timeByActivity[activity.title] = 0;
            }
            timeByActivity[activity.title] += minutes;
          });

          // حساب النشاط الأكثر استغراقًا للوقت
          const mostTimeActivity =
            Object.entries(timeByActivity).sort(
              (a, b) => b[1] - a[1]
            )[0]?.[0] || "-";

          // توزيع الوقت على الأنشطة للرسم البياني
          const distribution = Object.entries(timeByActivity)
            .map(([name, minutes]) => ({ name, minutes }))
            .sort((a, b) => b.minutes - a.minutes);

          setTimeDistribution(distribution);

          setOverview({
            totalTime: formatMinutes(totalMinutes),
            mostTimeActivity,
            activityCount: todayActivities.length,
          });

          // حساب نقاط الإنتاجية (مثال بسيط: 100 نقطة لكل ساعة)
          const productivePoints = Math.min(
            Math.round((totalMinutes / 60) * 100),
            100
          );
          setProductiveScore(productivePoints);

          // حساب أهداف اليوم (مثال: هدف 4 ساعات في اليوم)
          const goalInMinutes = 240; // 4 ساعات
          setGoalProgress({
            completed: Math.min(totalMinutes, goalInMinutes),
            total: goalInMinutes,
            percentage: Math.min((totalMinutes / goalInMinutes) * 100, 100),
          });
        } else {
          // إعادة تعيين الإحصائيات إذا لم تكن هناك أنشطة اليوم
          setOverview({
            totalTime: "0 دقيقة",
            mostTimeActivity: "-",
            activityCount: 0,
          });
          setTimeDistribution([]);
          setProductiveScore(0);
          setGoalProgress({ completed: 0, total: 240, percentage: 0 });
        }

        // حساب أيام التتبع المتتالية
        calculateStreak(allActivities);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // حساب التتابع (عدد الأيام المتتالية التي تم تتبع الأنشطة فيها)
  const calculateStreak = (activities) => {
    if (!activities.length) {
      setStreak(0);
      return;
    }

    // استخراج التواريخ الفريدة من الأنشطة
    const uniqueDates = new Set();

    activities.forEach((activity) => {
      if (activity.dateMetadata && activity.dateMetadata.dateKey) {
        uniqueDates.add(activity.dateMetadata.dateKey);
      }
    });

    // ترتيب التواريخ تنازليًا
    const sortedDates = Array.from(uniqueDates)
      .map((dateKey) => {
        const [day, month, year] = dateKey.split("-").map(Number);
        return new Date(year, month - 1, day);
      })
      .sort((a, b) => b - a);

    if (!sortedDates.length) {
      setStreak(0);
      return;
    }

    // التحقق مما إذا كان اليوم الحالي في القائمة
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const mostRecentDate = sortedDates[0];
    const isToday = mostRecentDate.getTime() === today.getTime();

    if (!isToday && today - mostRecentDate > 24 * 60 * 60 * 1000) {
      // إذا كان آخر يوم تم تسجيله ليس اليوم ولا البارحة، فالتتابع = 0
      setStreak(0);
      return;
    }

    // حساب عدد الأيام المتتالية
    let currentStreak = 1; // نبدأ من 1 لليوم الأخير

    for (let i = 0; i < sortedDates.length - 1; i++) {
      const currentDate = sortedDates[i];
      const nextDate = sortedDates[i + 1];

      // حساب الفرق بالأيام
      const diffTime = currentDate - nextDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // اليوم التالي متتابع
        currentStreak++;
      } else {
        // انقطاع في التتابع
        break;
      }
    }

    setStreak(currentStreak);
  };

  const getTaskStyle = (duration) => {
    const hours = parseFloat(duration.split("h")[0]);

    const styles = {
      4: {
        containerClass: "border-r-4 border-purple-500 bg-purple-900/20",
        icon: "💪 👨‍💻",
        titleClass: "text-white",
        dateClass: "text-gray-400",
        timeClass: "text-purple-300",
        durationClass: "bg-purple-900/30 text-purple-300",
        descriptionClass: "text-gray-300",
      },
      2: {
        containerClass: "border-r-4 border-orange-500 bg-orange-900/20",
        icon: "🎯 ⚒️",
        titleClass: "text-white",
        dateClass: "text-gray-400",
        timeClass: "text-orange-300",
        durationClass: "bg-orange-900/30 text-orange-300",
        descriptionClass: "text-gray-300",
      },
      1: {
        containerClass: "border-r-4 border-green-500 bg-green-900/20",
        icon: "✅ 📝",
        titleClass: "text-white",
        dateClass: "text-gray-400",
        timeClass: "text-green-300",
        durationClass: "bg-green-900/30 text-green-300",
        descriptionClass: "text-gray-300",
      },
      0: {
        containerClass: "border-r-4 border-blue-500 bg-blue-900/20",
        icon: "⚡ 🎪",
        titleClass: "text-white",
        dateClass: "text-gray-400",
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-arabic mt-10">
      {/* Hero Section */}
      <AnimatedContainer>
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">متتبع الوقت</h1>
          <p className="text-gray-300 mb-8">تتبع وقتك بسهولة وفعالية</p>
          <Link
            to="/activity"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            + إضافة نشاط جديد
          </Link>
        </div>
      </AnimatedContainer>

      {/* Overview Cards */}
      <AnimatedContainer delay={0.1}>
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4">
            نظرة عامة اليوم
            <span className="text-sm font-medium text-indigo-400 mr-2">
              {new Date().toLocaleDateString("ar-EG", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-gray-300 text-sm font-medium">
                الوقت الإجمالي
              </h3>
              <p className="text-white text-2xl font-bold mt-2">
                {overview.totalTime}
              </p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-gray-300 text-sm font-medium">أكثر وقت في</h3>
              <p className="text-white text-2xl font-bold mt-2">
                {overview.mostTimeActivity}
              </p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-gray-300 text-sm font-medium">عدد الأنشطة</h3>
              <p className="text-white text-2xl font-bold mt-2">
                {overview.activityCount}
              </p>
            </div>
          </div>
        </div>
      </AnimatedContainer>

      {/* إضافة بطاقة الإنجاز والتقدم */}
      <AnimatedContainer delay={0.15}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* بطاقة نقاط الإنتاجية */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">مقياس الإنتاجية</h2>
              <div className="bg-indigo-500/30 text-indigo-300 py-1 px-3 rounded-full text-sm">
                {productiveScore}/100
              </div>
            </div>
            <div className="relative h-4 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${productiveScore}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <div>0</div>
              <div>25</div>
              <div>50</div>
              <div>75</div>
              <div>100</div>
            </div>
            <p className="text-gray-300 text-sm mt-4">
              {productiveScore < 30 && "ما زال أمامك المزيد لإنجازه اليوم!"}
              {productiveScore >= 30 &&
                productiveScore < 70 &&
                "أنت على الطريق الصحيح. واصل التقدم!"}
              {productiveScore >= 70 && "أداء ممتاز! لقد حققت الكثير اليوم."}
            </p>
          </div>

          {/* بطاقة التتابع والهدف اليومي */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">الهدف اليومي</h2>
                <p className="text-gray-400 text-sm mt-1">
                  {formatMinutes(goalProgress.completed)} من{" "}
                  {formatMinutes(goalProgress.total)}
                </p>
              </div>
              <div className="flex items-center bg-amber-600/20 text-amber-400 py-1 px-3 rounded-full">
                <span className="text-xl mr-1">🔥</span>
                <span>{streak} يوم متتالي</span>
              </div>
            </div>
            <div className="relative h-4 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${goalProgress.percentage}%` }}
              ></div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-gray-300 text-sm">
                {goalProgress.percentage < 100
                  ? `متبقي ${formatMinutes(
                      goalProgress.total - goalProgress.completed
                    )} للوصول للهدف`
                  : "تهانينا! لقد حققت هدفك اليوم 🎉"}
              </p>
            </div>
          </div>
        </div>
      </AnimatedContainer>

      {/* Recent Activities */}
      {recentActivities.length > 0 ? (
        <AnimatedContainer delay={0.2}>
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6 shadow-lg border border-gray-700">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                أنشطة اليوم
              </h2>
              <Link
                to="/activities"
                className="text-indigo-400 hover:text-indigo-300 transition-colors duration-300"
              >
                عرض كل الأنشطة
              </Link>
            </div>
            <div className="space-y-4">
              {recentActivities.slice(0, 5).map((activity) => {
                const style = getTaskStyle(activity.duration);
                return (
                  <div
                    key={activity.id}
                    className={`rounded-lg p-3 sm:p-4 transition-all duration-300 hover:shadow-lg ${style.containerClass}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          <div className="flex gap-1" title={style.text}>
                            {style.icon.split(" ").map((emoji, index) => (
                              <span key={index} className="text-xl sm:text-2xl">
                                {emoji}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h3
                            className={`font-medium text-base sm:text-lg truncate ${style.titleClass}`}
                          >
                            {activity.title}
                          </h3>
                          <p className={`text-sm ${style.dateClass}`}>
                            {activity.date}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`flex items-center gap-3 ${style.timeClass}`}
                      >
                        <div className="text-sm whitespace-nowrap">
                          {activity.time}
                        </div>
                        <div className="bg-white/10 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                          {activity.duration}
                        </div>
                      </div>
                    </div>

                    {activity.description && (
                      <div className="mt-3 mr-12">
                        <p className="text-white/70 text-sm line-clamp-2 hover:line-clamp-none transition-all duration-300">
                          {activity.description}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </AnimatedContainer>
      ) : (
        <AnimatedContainer delay={0.2}>
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <h3 className="text-xl font-bold text-white mb-2">
              لا توجد أنشطة اليوم
            </h3>
            <p className="text-gray-400 mb-4">
              قم بإضافة نشاط جديد لتبدأ تتبع وقتك
            </p>
            <Link
              to="/activity"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              + إضافة نشاط
            </Link>
          </div>
        </AnimatedContainer>
      )}

      {/* إضافة رسم بياني بسيط لتوزيع الوقت */}
      {timeDistribution.length > 0 && (
        <AnimatedContainer delay={0.3}>
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-6">
              توزيع الوقت اليوم
            </h2>
            <div className="space-y-4">
              {timeDistribution.slice(0, 5).map((item, index) => {
                const percentage = Math.round(
                  (item.minutes /
                    timeDistribution.reduce(
                      (acc, curr) => acc + curr.minutes,
                      0
                    )) *
                    100
                );

                // ألوان مختلفة للرسم البياني
                const colors = [
                  "from-indigo-500 to-blue-500",
                  "from-purple-500 to-pink-500",
                  "from-green-500 to-emerald-500",
                  "from-amber-500 to-orange-500",
                  "from-sky-500 to-cyan-500",
                ];

                return (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-white">{item.name}</span>
                      <span className="text-gray-300">
                        {formatMinutes(item.minutes)} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full bg-gradient-to-r ${
                          colors[index % colors.length]
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </AnimatedContainer>
      )}

      {/* إضافة القسم التحفيزي */}
      <AnimatedContainer delay={0.4}>
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 -mt-8 -mr-8 bg-indigo-600 rounded-full opacity-10"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 -mb-8 -ml-8 bg-purple-600 rounded-full opacity-10"></div>

          <h2 className="text-xl font-bold text-white mb-4 relative z-10">
            اقتباس اليوم
          </h2>
          <p className="text-gray-200 text-lg mb-3 relative z-10">
            "لا تقل أبدًا أنك خسرت الوقت. أنت لم تخسر الوقت - لقد تعلمت فقط
            طريقة أخرى لا تعمل."
          </p>
          <p className="text-gray-400 text-sm relative z-10">- توماس إديسون</p>

          <div className="mt-6 flex flex-wrap gap-3 relative z-10">
            <Link
              to="/stats"
              className="bg-gray-700 hover:bg-gray-600 text-gray-200 py-2 px-4 rounded-lg flex items-center transition-colors"
            >
              <span className="text-lg mr-2">📊</span>
              إحصائيات الأسبوع
            </Link>
            <Link
              to="/activities"
              className="bg-gray-700 hover:bg-gray-600 text-gray-200 py-2 px-4 rounded-lg flex items-center transition-colors"
            >
              <span className="text-lg mr-2">📝</span>
              استعراض الأنشطة
            </Link>
            <Link
              to="/backup"
              className="bg-gray-700 hover:bg-gray-600 text-gray-200 py-2 px-4 rounded-lg flex items-center transition-colors"
            >
              <span className="text-lg mr-2">💾</span>
              نسخ احتياطي
            </Link>
          </div>
        </div>
      </AnimatedContainer>
    </div>
  );
}
