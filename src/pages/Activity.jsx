import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AnimatedContainer from "../components/AnimatedContainer";
import Toast from "../components/Toast";

const calculateDuration = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffInHours = (end - start) / (1000 * 60 * 60);
  const hours = Math.floor(diffInHours);
  const minutes = Math.round((diffInHours - hours) * 60);
  return `${hours}h ${minutes}m`;
};

const formatTime = (timeStr) => {
  const [hours, minutes] = timeStr.split(":");
  const hour = parseInt(hours);
  const period = hour >= 12 ? "مساءً" : "صباحاً";
  const formattedHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${formattedHour}:${minutes} ${period}`;
};

// تحسين دالة تنسيق التاريخ لتكون أكثر تناسقًا
const formatDate = (date) => {
  try {
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

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const monthName = months[date.getMonth()];
    const year = date.getFullYear();

    // تنسيق ثابت للتاريخ
    return `${dayName}، ${day} ${monthName} ${year}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return date.toString(); // في حالة حدوث خطأ، نعيد النص الأصلي
  }
};

// إضافة دالة لتخزين معلومات إضافية تساعد في الفلترة
const getDateMetadata = (date) => {
  return {
    day: date.getDate(),
    month: date.getMonth() + 1,
    year: date.getFullYear(),
    // تنسيق يسهل عملية المقارنة
    dateKey: `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`,
  };
};

export default function Activity() {
  // State للنموذج
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    startTime: `${new Date().toISOString().slice(0, 11)}00:00`, // تصحيح القيم الافتراضية
    endTime: `${new Date().toISOString().slice(0, 11)}00:00`, // تصحيح القيم الافتراضية
  });

  // State لقائمة العناوين المستخدمة سابقاً
  const [previousTitles, setPreviousTitles] = useState([]);
  const [filteredTitles, setFilteredTitles] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

  // State للإشعارات
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  // جلب العناوين المستخدمة سابقاً من localStorage عند تحميل الصفحة
  useEffect(() => {
    const loadPreviousTitles = () => {
      try {
        const activities = JSON.parse(
          localStorage.getItem("recentActivities") || "[]"
        );

        // استخراج العناوين الفريدة
        const uniqueTitles = [
          ...new Set(activities.map((activity) => activity.title)),
        ];
        setPreviousTitles(uniqueTitles);
      } catch (error) {
        console.error("Error loading previous titles:", error);
      }
    };

    loadPreviousTitles();
  }, []);

  // معالجة البحث والاقتراحات
  useEffect(() => {
    if (formData.title.trim().length > 0) {
      const filtered = previousTitles.filter((title) =>
        title.toLowerCase().includes(formData.title.toLowerCase())
      );
      setFilteredTitles(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setFilteredTitles([]);
      setShowSuggestions(false);
    }
    setSelectedSuggestionIndex(-1);
  }, [formData.title, previousTitles]);

  // التعامل مع اختيار اقتراح
  const handleSuggestionClick = (title) => {
    setFormData((prev) => ({
      ...prev,
      title,
    }));
    setShowSuggestions(false);

    // البحث عن آخر نشاط بهذا العنوان لاستخدام وصفه أيضاً
    try {
      const activities = JSON.parse(
        localStorage.getItem("recentActivities") || "[]"
      );
      const matchingActivity = activities
        .filter((activity) => activity.title === title)
        .sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        )[0];

      if (matchingActivity && matchingActivity.description) {
        setFormData((prev) => ({
          ...prev,
          description: matchingActivity.description,
        }));
      }
    } catch (error) {
      console.error("Error finding matching activity:", error);
    }
  };

  // معالجة التنقل بلوحة المفاتيح في الاقتراحات
  const handleKeyDown = (e) => {
    // إذا كانت الاقتراحات مخفية، لا نفعل شيئاً
    if (!showSuggestions) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev < filteredTitles.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev > 0 ? prev - 1 : filteredTitles.length - 1
        );
        break;
      case "Enter":
        if (selectedSuggestionIndex >= 0) {
          e.preventDefault();
          handleSuggestionClick(filteredTitles[selectedSuggestionIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        break;
      default:
        break;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // التحقق من صحة الوقت
    const [startHours, startMinutes] = formData.startTime
      .split("T")[1]
      .split(":");
    const [endHours, endMinutes] = formData.endTime.split("T")[1].split(":");

    const startDate = new Date();
    startDate.setHours(parseInt(startHours), parseInt(startMinutes), 0);

    const endDate = new Date();
    endDate.setHours(parseInt(endHours), parseInt(endMinutes), 0);

    if (endDate <= startDate) {
      showToast("وقت الانتهاء يجب أن يكون بعد وقت البدء", "error");
      return;
    }

    // إنشاء نسخة منفصلة من التاريخ الحالي للاستخدام في النشاط
    const today = new Date();

    // إنشاء أوقات البدء والانتهاء بناءً على التاريخ الحالي
    // لا حاجة لإعلان المتغيرات مرة أخرى لأننا أعلناها سابقاً
    const activityStartDate = new Date(
      today.setHours(parseInt(startHours), parseInt(startMinutes), 0)
    );

    // إعادة إنشاء كائن تاريخ جديد لتجنب تعديل نفس المرجع
    const activityEndDate = new Date(
      new Date(today).setHours(parseInt(endHours), parseInt(endMinutes), 0)
    );

    // تخزين البيانات الإضافية للتاريخ لتسهيل الفلترة
    const dateMetadata = getDateMetadata(today);
    const displayDate = formatDate(today);

    const newActivity = {
      id: Date.now(),
      title: formData.title,
      time: `${formatTime(
        activityStartDate.toTimeString().slice(0, 5)
      )} - ${formatTime(activityEndDate.toTimeString().slice(0, 5))}`,
      duration: calculateDuration(activityStartDate, activityEndDate),
      date: displayDate,
      dateMetadata: dateMetadata,
      description: formData.description,
    };

    const savedActivities = JSON.parse(
      localStorage.getItem("recentActivities") || "[]"
    );
    const updatedActivities = [newActivity, ...savedActivities];
    localStorage.setItem("recentActivities", JSON.stringify(updatedActivities));

    // إظهار رسالة نجاح بدلاً من alert
    showToast(`تم إضافة نشاط "${formData.title}" بنجاح!`);

    // إعادة تعيين النموذج
    setFormData({
      title: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      startTime: `${new Date().toISOString().slice(0, 11)}00:00`,
      endTime: `${new Date().toISOString().slice(0, 11)}00:00`,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // إظهار رسالة
  const showToast = (message, type = "success") => {
    setToast({
      visible: true,
      message,
      type,
    });
  };

  // إخفاء رسالة
  const hideToast = () => {
    setToast((prev) => ({
      ...prev,
      visible: false,
    }));
  };

  return (
    <AnimatedContainer>
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={hideToast}
      />

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">إضافة نشاط جديد</h1>

        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* عنوان النشاط مع الاقتراحات */}
            <div>
              <label
                htmlFor="title"
                className="block text-gray-300 text-sm font-medium mb-2"
              >
                عنوان النشاط <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => {
                    if (filteredTitles.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  onBlur={() => {
                    // تأخير إخفاء الاقتراحات ليسمح بالنقر عليها
                    setTimeout(() => {
                      setShowSuggestions(false);
                    }, 150);
                  }}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="أدخل عنوان النشاط"
                  required
                />

                {/* قائمة الاقتراحات */}
                {showSuggestions && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                  >
                    <ul className="py-1">
                      {filteredTitles.map((title, index) => (
                        <motion.li
                          key={index}
                          whileHover={{
                            backgroundColor: "rgba(79, 70, 229, 0.1)",
                          }}
                          className={`px-4 py-2 cursor-pointer text-white ${
                            selectedSuggestionIndex === index
                              ? "bg-indigo-900/30"
                              : ""
                          }`}
                          onClick={() => handleSuggestionClick(title)}
                        >
                          {title}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </div>

              {/* عرض الأنشطة السابقة المستخدمة كأزرار سريعة */}
              {previousTitles.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm text-gray-400 mb-2">أنشطة سابقة:</p>
                  <div className="flex flex-wrap gap-2">
                    {previousTitles.slice(0, 8).map((title, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSuggestionClick(title)}
                        className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full px-3 py-1 transition-colors"
                      >
                        {title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-gray-300 text-sm font-medium mb-2"
              >
                الوصف (اختياري)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="أضف أي تفاصيل إضافية عن نشاطك"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="startTime"
                  className="block text-gray-300 text-sm font-medium mb-2"
                >
                  وقت البدء
                </label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  value={formData.startTime.split("T")[1]}
                  onChange={(e) => {
                    handleChange({
                      target: {
                        name: "startTime",
                        value: `${new Date().toISOString().slice(0, 11)}${
                          e.target.value
                        }`,
                      },
                    });
                  }}
                  required
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label
                  htmlFor="endTime"
                  className="block text-gray-300 text-sm font-medium mb-2"
                >
                  وقت الانتهاء
                </label>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  value={formData.endTime.split("T")[1]}
                  onChange={(e) => {
                    handleChange({
                      target: {
                        name: "endTime",
                        value: `${new Date().toISOString().slice(0, 11)}${
                          e.target.value
                        }`,
                      },
                    });
                  }}
                  required
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-300"
            >
              حفظ النشاط
            </button>
          </form>
        </div>
      </div>
    </AnimatedContainer>
  );
}
