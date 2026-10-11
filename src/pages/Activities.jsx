import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AnimatedContainer from "../components/AnimatedContainer";
import { motion } from "framer-motion";

export default function Activities() {
  const [groupedActivities, setGroupedActivities] = useState({});
  const [loading, setLoading] = useState(true);
  const [allActivities, setAllActivities] = useState([]);

  // تبسيط حالة البحث: كلمة بحث فقط وتاريخ
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [dateFilter, setDateFilter] = useState("");

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const days = [
      "الأحد",
      "الإثنين",
      "الثلاثاء",
      "الأربعاء",
      "الخميس",
      "الجمعة",
      "السبت",
    ];
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

    return `${days[date.getDay()]}، ${date.getDate()} ${
      months[date.getMonth()]
    } ${date.getFullYear()}`;
  };

  const formatTime = (timeStr) => {
    const [time, period] = timeStr.split(" ");
    const arabicPeriod = period === "AM" ? "صباحاً" : "مساءً";
    return `${time} ${arabicPeriod}`;
  };

  const getTimeIndicator = (duration) => {
    const hours = parseFloat(duration.split("h")[0]);
    if (hours < 1) return "⚡ مهمة سريعة";
    if (hours < 2) return "⏱ مهمة قصيرة";
    if (hours < 4) return "⏰ مهمة متوسطة";
    return "📅 مهمة طويلة";
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

  useEffect(() => {
    fetchActivities();
  }, []);

  // تحديث دالة تأثير البحث
  useEffect(() => {
    if (searchTerm.trim() === "" && dateFilter === "") {
      setSearchResults(null);
      return;
    }

    handleSearch();
  }, [searchTerm, dateFilter, allActivities]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const saved = localStorage.getItem("recentActivities");
      const activities = saved ? JSON.parse(saved) : [];

      // حفظ جميع الأنشطة للبحث
      setAllActivities(activities);

      // تجميع المهام حسب اليوم
      const grouped = activities.reduce((acc, activity) => {
        const date = activity.date;
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(activity);
        return acc;
      }, {});

      setGroupedActivities(grouped);
    } catch (error) {
      console.error("Error loading activities:", error);
    } finally {
      setLoading(false);
    }
  };

  // تحديث دالة البحث لإصلاح البحث بالتاريخ
  const handleSearch = () => {
    let results = [...allActivities];

    // تطبيق البحث النصي في كل المحتوى (العنوان والوصف)
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      results = results.filter((activity) => {
        return (
          activity.title.toLowerCase().includes(term) ||
          (activity.description &&
            activity.description.toLowerCase().includes(term))
        );
      });
    }

    // تطبيق تصفية التاريخ - تصحيح المنطق
    if (dateFilter) {
      const filterDate = new Date(dateFilter);

      results = results.filter((activity) => {
        try {
          // طريقة 1: استخدام البيانات الوصفية إن وجدت
          if (activity.dateMetadata) {
            const { day, month, year } = activity.dateMetadata;
            return (
              day === filterDate.getDate() &&
              month === filterDate.getMonth() + 1 &&
              year === filterDate.getFullYear()
            );
          }

          // طريقة 2: تحليل التاريخ من النص
          // تحليل النص "الثلاثاء، 14 نوفمبر 2023"
          const dateParts = activity.date.split("،");
          if (dateParts.length < 2) return false;

          const dateNumbers = dateParts[1].trim().split(" ");
          const day = parseInt(dateNumbers[0]);

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

          const monthIndex = months.findIndex((m) =>
            dateNumbers[1].startsWith(m)
          );
          const year = parseInt(dateNumbers[2]);

          return (
            day === filterDate.getDate() &&
            monthIndex === filterDate.getMonth() &&
            year === filterDate.getFullYear()
          );
        } catch (e) {
          console.error("Error parsing date for activity:", activity.date, e);
          return false;
        }
      });
    }

    // تجميع النتائج حسب التاريخ
    const groupedResults = results.reduce((acc, activity) => {
      const date = activity.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(activity);
      return acc;
    }, {});

    setSearchResults(groupedResults);
  };

  // دالة لإعادة ضبط البحث
  const resetSearch = () => {
    setSearchTerm("");
    setDateFilter("");
    setSearchResults(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // معالجة حالة عدم وجود أنشطة
  if (Object.keys(groupedActivities).length === 0) {
    return (
      <AnimatedContainer>
        <div className="bg-gray-800 rounded-lg p-8 shadow-lg text-center">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-2xl font-bold text-white mb-4">
            لا توجد أي أنشطة بعد
          </h2>
          <p className="text-gray-300 mb-6">
            أضف بعض الأنشطة لمتابعة استخدامك للوقت والاطلاع على تفاصيلها هنا
          </p>
          <Link
            to="/activity"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            + إضافة نشاط جديد
          </Link>
        </div>
      </AnimatedContainer>
    );
  }

  // إضافة انيميشن للقائمة والعناصر
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  // تحديد البيانات التي سيتم عرضها (إما نتائج البحث أو جميع الأنشطة)
  const displayActivities = searchResults || groupedActivities;
  const isSearchActive = searchTerm.trim() !== "" || dateFilter !== "";

  return (
    <div className="space-y-6">
      {/* تحسين قسم البحث */}
      <AnimatedContainer>
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-bold text-white mb-4">بحث في الأنشطة</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4">
            {/* حقل البحث النصي */}
            <div>
              <label
                htmlFor="searchInput"
                className="block text-gray-300 text-sm font-medium mb-2"
              >
                البحث في النص
              </label>
              <div className="relative">
                <input
                  id="searchInput"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="اكتب للبحث في العناوين والملاحظات..."
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg pr-10 pl-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* تحسين حقل تصفية التاريخ */}
            <div>
              <label
                htmlFor="dateFilter"
                className="block text-gray-300 text-sm font-medium mb-2"
              >
                البحث بالتاريخ
              </label>
              <div className="relative">
                <input
                  id="dateFilter"
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg pr-10 pl-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              {dateFilter && (
                <p className="mt-1 text-xs text-gray-400">
                  تصفية بتاريخ:{" "}
                  {new Date(dateFilter).toLocaleDateString("ar-EG", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              )}
            </div>
          </div>

          {/* نتائج البحث وزر الإلغاء */}
          <div className="flex flex-wrap justify-between items-center">
            {isSearchActive && (
              <>
                <div className="text-gray-300 mb-2 sm:mb-0">
                  {Object.keys(displayActivities).length > 0 ? (
                    <span>
                      تم العثور على{" "}
                      <strong className="text-indigo-400">
                        {Object.values(displayActivities).flat().length}
                      </strong>{" "}
                      نشاط
                    </span>
                  ) : (
                    <span>لا توجد نتائج لهذا البحث</span>
                  )}
                </div>
                <button
                  onClick={resetSearch}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center hover:bg-indigo-700 transition-colors"
                >
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  إلغاء البحث
                </button>
              </>
            )}
          </div>
        </div>
      </AnimatedContainer>

      {/* عرض الأنشطة */}
      {Object.keys(displayActivities).length > 0
        ? Object.entries(displayActivities).map(
            ([date, dayActivities], groupIndex) => (
              <AnimatedContainer key={date} delay={groupIndex * 0.1}>
                <div className="bg-gray-800 rounded-lg p-4 sm:p-6 shadow-lg border border-gray-700">
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
                    {date}
                  </h2>
                  <motion.div
                    className="space-y-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                  >
                    {dayActivities.map((activity) => {
                      const style = getTaskStyle(activity.duration);
                      return (
                        <motion.div
                          key={activity.id}
                          variants={itemVariants}
                          className={`rounded-lg p-3 sm:p-4 transition-all duration-300 hover:shadow-lg ${style.containerClass}`}
                        >
                          <Link
                            to={`/activities/${activity.id}`}
                            className="block"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                              {/* العنوان والأيقونات */}
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="flex-shrink-0">
                                  <div
                                    className="flex gap-1"
                                    title={style.text}
                                  >
                                    {style.icon
                                      .split(" ")
                                      .map((emoji, index) => (
                                        <span
                                          key={index}
                                          className="text-xl sm:text-2xl"
                                        >
                                          {emoji}
                                        </span>
                                      ))}
                                  </div>
                                </div>
                                <h3
                                  className={`font-medium text-base sm:text-lg truncate ${style.titleClass}`}
                                >
                                  {activity.title}
                                </h3>
                              </div>

                              {/* الوقت والمدة */}
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

                            {/* الوصف */}
                            {activity.description && (
                              <div className="mt-3 mr-12">
                                <p
                                  className={`text-sm line-clamp-2 hover:line-clamp-none transition-all duration-300 ${style.descriptionClass}`}
                                >
                                  {activity.description}
                                </p>
                              </div>
                            )}
                          </Link>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </div>
              </AnimatedContainer>
            )
          )
        : !loading &&
          isSearchActive && (
            <AnimatedContainer>
              <div className="bg-gray-800 rounded-lg p-6 text-center">
                <div className="text-5xl mb-4">🔍</div>
                <h2 className="text-xl font-bold text-white mb-2">
                  لم يتم العثور على نتائج
                </h2>
                <p className="text-gray-400">
                  حاول تغيير مصطلحات البحث أو المعايير
                </p>
              </div>
            </AnimatedContainer>
          )}
    </div>
  );
}
