import { useMemo } from "react";
import { Link } from "react-router-dom";
import AnimatedContainer from "../components/AnimatedContainer";
import { useActivities } from "../hooks/useActivities";
import { formatMinutes } from "../lib/activityHelpers";

function todayKey() {
  const t = new Date();
  return `${t.getDate()}-${t.getMonth() + 1}-${t.getFullYear()}`;
}

function getTaskStyle(duration) {
  const hours = parseFloat(String(duration).split("h")[0]) || 0;
  const styles = {
    4: {
      containerClass: "border-r-4 border-purple-500 bg-purple-900/20",
      icon: "💪 👨‍💻",
      titleClass: "text-white",
      dateClass: "text-gray-400",
      timeClass: "text-purple-300",
    },
    2: {
      containerClass: "border-r-4 border-orange-500 bg-orange-900/20",
      icon: "🎯 ⚒️",
      titleClass: "text-white",
      dateClass: "text-gray-400",
      timeClass: "text-orange-300",
    },
    1: {
      containerClass: "border-r-4 border-green-500 bg-green-900/20",
      icon: "✅ 📝",
      titleClass: "text-white",
      dateClass: "text-gray-400",
      timeClass: "text-green-300",
    },
    0: {
      containerClass: "border-r-4 border-blue-500 bg-blue-900/20",
      icon: "⚡ 🎪",
      titleClass: "text-white",
      dateClass: "text-gray-400",
      timeClass: "text-blue-300",
    },
  };
  return hours >= 4
    ? styles[4]
    : hours >= 2
      ? styles[2]
      : hours >= 1
        ? styles[1]
        : styles[0];
}

function calcStreak(activities) {
  if (!activities.length) return 0;

  const uniqueDates = new Set();
  activities.forEach((a) => {
    if (a.dateMetadata?.dateKey) uniqueDates.add(a.dateMetadata.dateKey);
  });

  const sortedDates = Array.from(uniqueDates)
    .map((dateKey) => {
      const [day, month, year] = dateKey.split("-").map(Number);
      return new Date(year, month - 1, day);
    })
    .sort((a, b) => b - a);

  if (!sortedDates.length) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const mostRecent = sortedDates[0];
  const isToday = mostRecent.getTime() === today.getTime();

  if (!isToday && today - mostRecent > 24 * 60 * 60 * 1000) return 0;

  let streak = 1;
  for (let i = 0; i < sortedDates.length - 1; i++) {
    const diffDays = Math.ceil(
      (sortedDates[i] - sortedDates[i + 1]) / (1000 * 60 * 60 * 24),
    );
    if (diffDays === 1) streak++;
    else break;
  }
  return streak;
}

export default function Home() {
  const { data: allActivities = [], isLoading: loading } = useActivities();
  const key = todayKey();

  const todayActivities = useMemo(
    () =>
      allActivities.filter(
        (a) => a.dateMetadata?.dateKey === key || a.activityDate === new Date().toISOString().slice(0, 10),
      ),
    [allActivities, key],
  );

  const stats = useMemo(() => {
    let totalMinutes = 0;
    const timeByActivity = {};

    todayActivities.forEach((activity) => {
      const minutes = activity.durationMinutes || 0;
      totalMinutes += minutes;
      if (!timeByActivity[activity.title]) timeByActivity[activity.title] = 0;
      timeByActivity[activity.title] += minutes;
    });

    const mostTimeActivity =
      Object.entries(timeByActivity).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      "-";

    const distribution = Object.entries(timeByActivity)
      .map(([name, minutes]) => ({ name, minutes }))
      .sort((a, b) => b.minutes - a.minutes);

    const productiveScore = Math.min(
      Math.round((totalMinutes / 60) * 100),
      100,
    );
    const goalInMinutes = 240;

    return {
      totalMinutes,
      mostTimeActivity,
      activityCount: todayActivities.length,
      distribution,
      productiveScore,
      goalProgress: {
        completed: Math.min(totalMinutes, goalInMinutes),
        total: goalInMinutes,
        percentage: Math.min((totalMinutes / goalInMinutes) * 100, 100),
      },
      streak: calcStreak(allActivities),
    };
  }, [todayActivities, allActivities]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 font-arabic mt-10">
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
                {formatMinutes(stats.totalMinutes)}
              </p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-gray-300 text-sm font-medium">أكثر وقت في</h3>
              <p className="text-white text-2xl font-bold mt-2">
                {stats.mostTimeActivity}
              </p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-gray-300 text-sm font-medium">عدد الأنشطة</h3>
              <p className="text-white text-2xl font-bold mt-2">
                {stats.activityCount}
              </p>
            </div>
          </div>
        </div>
      </AnimatedContainer>

      <AnimatedContainer delay={0.15}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">مقياس الإنتاجية</h2>
              <div className="bg-indigo-500/30 text-indigo-300 py-1 px-3 rounded-full text-sm">
                {stats.productiveScore}/100
              </div>
            </div>
            <div className="relative h-4 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${stats.productiveScore}%` }}
              />
            </div>
            <p className="text-gray-300 text-sm mt-4">
              {stats.productiveScore < 30 && "ما زال أمامك المزيد لإنجازه اليوم!"}
              {stats.productiveScore >= 30 &&
                stats.productiveScore < 70 &&
                "أنت على الطريق الصحيح. واصل التقدم!"}
              {stats.productiveScore >= 70 &&
                "أداء ممتاز! لقد حققت الكثير اليوم."}
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">الهدف اليومي</h2>
                <p className="text-gray-400 text-sm mt-1">
                  {formatMinutes(stats.goalProgress.completed)} من{" "}
                  {formatMinutes(stats.goalProgress.total)}
                </p>
              </div>
              <div className="flex items-center bg-amber-600/20 text-amber-400 py-1 px-3 rounded-full">
                <span className="text-xl mr-1">🔥</span>
                <span>{stats.streak} يوم متتالي</span>
              </div>
            </div>
            <div className="relative h-4 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${stats.goalProgress.percentage}%` }}
              />
            </div>
            <p className="text-gray-300 text-sm mt-4 text-center">
              {stats.goalProgress.percentage < 100
                ? `متبقي ${formatMinutes(
                    stats.goalProgress.total - stats.goalProgress.completed,
                  )} للوصول للهدف`
                : "تهانينا! لقد حققت هدفك اليوم 🎉"}
            </p>
          </div>
        </div>
      </AnimatedContainer>

      {todayActivities.length > 0 ? (
        <AnimatedContainer delay={0.2}>
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6 shadow-lg border border-gray-700">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                أنشطة اليوم
              </h2>
              <Link
                to="/activities"
                className="text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                عرض كل الأنشطة
              </Link>
            </div>
            <div className="space-y-4">
              {todayActivities.slice(0, 5).map((activity) => {
                const style = getTaskStyle(activity.duration);
                return (
                  <Link
                    key={activity.id}
                    to={`/activities/${activity.id}`}
                    className={`block rounded-lg p-3 sm:p-4 transition-all hover:shadow-lg ${style.containerClass}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex gap-1 shrink-0">
                          {style.icon.split(" ").map((emoji, index) => (
                            <span key={index} className="text-xl sm:text-2xl">
                              {emoji}
                            </span>
                          ))}
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
                      <div className={`flex items-center gap-3 ${style.timeClass}`}>
                        <div className="text-sm whitespace-nowrap">
                          {activity.time}
                        </div>
                        <div className="bg-white/10 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                          {activity.duration}
                        </div>
                      </div>
                    </div>
                    {activity.description && (
                      <p className="mt-3 mr-12 text-white/70 text-sm line-clamp-2">
                        {activity.description}
                      </p>
                    )}
                  </Link>
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

      {stats.distribution.length > 0 && (
        <AnimatedContainer delay={0.3}>
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-6">
              توزيع الوقت اليوم
            </h2>
            <div className="space-y-4">
              {stats.distribution.slice(0, 5).map((item, index) => {
                const total = stats.distribution.reduce(
                  (acc, c) => acc + c.minutes,
                  0,
                );
                const percentage =
                  total > 0 ? Math.round((item.minutes / total) * 100) : 0;
                const colors = [
                  "from-indigo-500 to-blue-500",
                  "from-purple-500 to-pink-500",
                  "from-green-500 to-emerald-500",
                  "from-amber-500 to-orange-500",
                  "from-sky-500 to-cyan-500",
                ];
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-white">{item.name}</span>
                      <span className="text-gray-300">
                        {formatMinutes(item.minutes)} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full bg-gradient-to-r ${colors[index % colors.length]}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </AnimatedContainer>
      )}

      <AnimatedContainer delay={0.4}>
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700 relative overflow-hidden">
          <h2 className="text-xl font-bold text-white mb-4">اقتباس اليوم</h2>
          <p className="text-gray-200 text-lg mb-3">
            "لا تقل أبدًا أنك خسرت الوقت. أنت لم تخسر الوقت - لقد تعلمت فقط
            طريقة أخرى لا تعمل."
          </p>
          <p className="text-gray-400 text-sm">- توماس إديسون</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/stats"
              className="bg-gray-700 hover:bg-gray-600 text-gray-200 py-2 px-4 rounded-lg transition-colors"
            >
              📊 إحصائيات
            </Link>
            <Link
              to="/activities"
              className="bg-gray-700 hover:bg-gray-600 text-gray-200 py-2 px-4 rounded-lg transition-colors"
            >
              📝 الأنشطة
            </Link>
          </div>
        </div>
      </AnimatedContainer>
    </div>
  );
}
