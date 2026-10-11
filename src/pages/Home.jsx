import { useMemo } from "react";
import { Link } from "react-router-dom";
import AnimatedContainer from "../components/AnimatedContainer";
import QuoteOfTheDay from "../components/QuoteOfTheDay";
import { useActivities } from "../hooks/useActivities";
import { formatMinutes } from "../lib/activityHelpers";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";

function todayKey() {
  const t = new Date();
  return `${t.getDate()}-${t.getMonth() + 1}-${t.getFullYear()}`;
}

function getTaskStyle(duration) {
  const hours = parseFloat(String(duration).split("h")[0]) || 0;
  const styles = {
    4: {
      containerClass: "border-r-4 border-purple-500 bg-violet-500/10",
      icon: "💪 👨‍💻",
      titleClass: "text-foreground",
      dateClass: "text-muted-foreground",
      timeClass: "text-purple-300",
    },
    2: {
      containerClass: "border-r-4 border-orange-500 bg-orange-500/10",
      icon: "🎯 ⚒️",
      titleClass: "text-foreground",
      dateClass: "text-muted-foreground",
      timeClass: "text-orange-300",
    },
    1: {
      containerClass: "border-r-4 border-green-500 bg-emerald-500/10",
      icon: "✅ 📝",
      titleClass: "text-foreground",
      dateClass: "text-muted-foreground",
      timeClass: "text-green-300",
    },
    0: {
      containerClass: "border-r-4 border-blue-500 bg-sky-500/10",
      icon: "⚡ 🎪",
      titleClass: "text-foreground",
      dateClass: "text-muted-foreground",
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
  const isoToday = new Date().toISOString().slice(0, 10);

  const todayActivities = useMemo(
    () =>
      allActivities.filter(
        (a) =>
          a.dateMetadata?.dateKey === key || a.activityDate === isoToday,
      ),
    [allActivities, key, isoToday],
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
      "—";

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
      <div className="space-y-6 mt-10">
        <Skeleton className="h-24 w-full max-w-md mx-auto" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8 font-arabic mt-10">
      <AnimatedContainer>
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">متتبع الوقت</h1>
          <p className="text-muted-foreground">تتبع وقتك بسهولة وفعالية</p>
          <Button asChild size="lg">
            <Link to="/activity">+ إضافة نشاط جديد</Link>
          </Button>
        </div>
      </AnimatedContainer>

      <AnimatedContainer delay={0.08}>
        <QuoteOfTheDay />
      </AnimatedContainer>

      <AnimatedContainer delay={0.12}>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex flex-wrap items-baseline gap-2">
              نظرة عامة اليوم
              <span className="text-sm font-medium text-primary">
                {new Date().toLocaleDateString("ar-EG", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-lg bg-muted/60 p-4">
                <h3 className="text-muted-foreground text-sm font-medium">
                  الوقت الإجمالي
                </h3>
                <p className="text-foreground text-2xl font-bold mt-2">
                  {formatMinutes(stats.totalMinutes)}
                </p>
              </div>
              <div className="rounded-lg bg-muted/60 p-4">
                <h3 className="text-muted-foreground text-sm font-medium">
                  أكثر وقت في
                </h3>
                <p className="text-foreground text-2xl font-bold mt-2 truncate">
                  {stats.mostTimeActivity}
                </p>
              </div>
              <div className="rounded-lg bg-muted/60 p-4">
                <h3 className="text-muted-foreground text-sm font-medium">
                  عدد الأنشطة
                </h3>
                <p className="text-foreground text-2xl font-bold mt-2">
                  {stats.activityCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </AnimatedContainer>

      <AnimatedContainer delay={0.15}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground">
                  مقياس الإنتاجية
                </h2>
                <Badge variant="secondary">{stats.productiveScore}/100</Badge>
              </div>
              <div className="relative h-4 bg-muted rounded-full overflow-hidden">
                <div
                  className="absolute top-0 start-0 h-full bg-gradient-to-l from-primary to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${stats.productiveScore}%` }}
                />
              </div>
              <p className="text-muted-foreground text-sm mt-4">
                {stats.productiveScore < 30 &&
                  "ما زال أمامك المزيد لإنجازه اليوم!"}
                {stats.productiveScore >= 30 &&
                  stats.productiveScore < 70 &&
                  "أنت على الطريق الصحيح. واصل التقدم!"}
                {stats.productiveScore >= 70 &&
                  "أداء ممتاز! لقد حققت الكثير اليوم."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-6 gap-2">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    الهدف اليومي
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    {formatMinutes(stats.goalProgress.completed)} من{" "}
                    {formatMinutes(stats.goalProgress.total)}
                  </p>
                </div>
                <Badge variant="warning" className="shrink-0">
                  🔥 {stats.streak} يوم
                </Badge>
              </div>
              <div className="relative h-4 bg-muted rounded-full overflow-hidden">
                <div
                  className="absolute top-0 start-0 h-full bg-gradient-to-l from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${stats.goalProgress.percentage}%` }}
                />
              </div>
              <p className="text-muted-foreground text-sm mt-4 text-center">
                {stats.goalProgress.percentage < 100
                  ? `متبقي ${formatMinutes(
                      stats.goalProgress.total -
                        stats.goalProgress.completed,
                    )} للوصول للهدف`
                  : "تهانينا! لقد حققت هدفك اليوم 🎉"}
              </p>
            </CardContent>
          </Card>
        </div>
      </AnimatedContainer>

      {todayActivities.length > 0 ? (
        <AnimatedContainer delay={0.2}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
              <CardTitle className="text-xl sm:text-2xl">أنشطة اليوم</CardTitle>
              <Button asChild variant="link" className="text-primary">
                <Link to="/activities">عرض الكل</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
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
                        <div className="min-w-0">
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
                      <p className="mt-3 me-12 text-foreground/70 text-sm line-clamp-2">
                        {activity.description}
                      </p>
                    )}
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        </AnimatedContainer>
      ) : (
        <AnimatedContainer delay={0.2}>
          <Card>
            <CardContent className="py-10 text-center space-y-3">
              <h3 className="text-xl font-bold text-foreground">
                لا توجد أنشطة اليوم
              </h3>
              <p className="text-muted-foreground">
                قم بإضافة نشاط جديد لتبدأ تتبع وقتك
              </p>
              <Button asChild>
                <Link to="/activity">+ إضافة نشاط</Link>
              </Button>
            </CardContent>
          </Card>
        </AnimatedContainer>
      )}

      {stats.distribution.length > 0 && (
        <AnimatedContainer delay={0.25}>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">توزيع الوقت اليوم</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                    <div className="flex justify-between text-sm gap-2">
                      <span className="text-foreground truncate">
                        {item.name}
                      </span>
                      <span className="text-muted-foreground shrink-0">
                        {formatMinutes(item.minutes)} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full bg-gradient-to-l ${colors[index % colors.length]}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </AnimatedContainer>
      )}

      <AnimatedContainer delay={0.3}>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button asChild variant="secondary">
            <Link to="/stats">📊 إحصائيات</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/activities">📝 الأنشطة</Link>
          </Button>
        </div>
      </AnimatedContainer>
    </div>
  );
}
