import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import AnimatedContainer from "../components/AnimatedContainer";
import Toast from "../components/Toast";

export default function ActivityDetails() {
  const { id } = useParams(); // استخدام معرف المهمة من عنوان URL
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    startTime: "",
    endTime: "",
    date: "",
    description: "",
  });
  const [activityHistory, setActivityHistory] = useState([]);
  const [totalTrackedMinutes, setTotalTrackedMinutes] = useState(0);
  const [showHistory, setShowHistory] = useState(false);

  // حالة للإشعارات
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });

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

  // جلب بيانات النشاط عند تحميل الصفحة
  useEffect(() => {
    const fetchActivityDetails = () => {
      setLoading(true);
      try {
        // جلب كل الأنشطة من التخزين المحلي
        const savedActivities = JSON.parse(
          localStorage.getItem("recentActivities") || "[]"
        );

        // البحث عن النشاط بالمعرف
        const foundActivity = savedActivities.find(
          (activity) => activity.id === parseInt(id)
        );

        if (foundActivity) {
          setActivity(foundActivity);

          // تحويل صيغة الوقت من "10:30 صباحاً - 12:30 مساءً" إلى وقت بدء ووقت انتهاء منفصلين
          const [startTimeText, endTimeText] = foundActivity.time.split(" - ");

          // تحويل الوقت من صيغة 12 ساعة إلى صيغة 24 ساعة للنموذج
          const startTime = convertTo24HourFormat(startTimeText);
          const endTime = convertTo24HourFormat(endTimeText);

          // إعداد بيانات النموذج
          setFormData({
            title: foundActivity.title,
            startTime: startTime,
            endTime: endTime,
            date: foundActivity.dateMetadata
              ? formatDateForInput(foundActivity.dateMetadata)
              : new Date().toISOString().slice(0, 10),
            description: foundActivity.description || "",
          });

          // جمع معلومات عن تاريخ هذا النشاط
          collectActivityHistory(savedActivities, foundActivity.title);
        } else {
          // إذا لم يتم العثور على النشاط، نعيد توجيه المستخدم إلى صفحة الأنشطة
          navigate("/activities");
          showToast("لم يتم العثور على النشاط المطلوب", "error");
        }
      } catch (error) {
        console.error("Error fetching activity details:", error);
        showToast("حدث خطأ أثناء جلب بيانات النشاط", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchActivityDetails();
  }, [id, navigate]);

  // تحويل الوقت من صيغة 12 ساعة إلى صيغة 24 ساعة
  const convertTo24HourFormat = (timeText) => {
    // تحليل الوقت مثل "10:30 صباحاً" أو "2:45 مساءً"
    try {
      const parts = timeText.trim().split(" ");
      const [hours, minutes] = parts[0].split(":");
      const period = parts[1] || "";

      let hour = parseInt(hours);

      // تحويل إلى صيغة 24 ساعة
      if ((period.includes("مساءً") || period.includes("م")) && hour < 12) {
        hour += 12;
      } else if (
        (period.includes("صباحاً") || period.includes("ص")) &&
        hour === 12
      ) {
        hour = 0;
      }

      // تنسيق الوقت للإدخال
      return `${hour.toString().padStart(2, "0")}:${minutes}`;
    } catch (error) {
      console.error("Error parsing time:", timeText, error);
      return "00:00"; // وقت افتراضي إذا فشل التحليل
    }
  };

  // تنسيق التاريخ من كائن البيانات الوصفية للتاريخ إلى قيمة مناسبة للإدخال
  const formatDateForInput = (dateMetadata) => {
    const { year, month, day } = dateMetadata;
    return `${year}-${month.toString().padStart(2, "0")}-${day
      .toString()
      .padStart(2, "0")}`;
  };

  // تحويل الوقت من صيغة 24 ساعة إلى صيغة 12 ساعة مع فترة (صباحاً/مساءً)
  const convertTo12HourFormat = (timeStr) => {
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours);
    const period = hour >= 12 ? "مساءً" : "صباحاً";
    const formattedHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${formattedHour}:${minutes} ${period}`;
  };

  // تنسيق التاريخ بصيغة صحيحة "السبت، 8 مارس 2025"
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

      const d = new Date(date);
      const dayName = days[d.getDay()];
      const day = d.getDate();
      const monthName = months[d.getMonth()];
      const year = d.getFullYear();

      return `${dayName}، ${day} ${monthName} ${year}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return date.toString(); // في حالة حدوث خطأ، نعيد النص الأصلي
    }
  };

  // حساب المدة بين وقتين
  const calculateDuration = (startTime, endTime, date) => {
    const dateObj = new Date(date);
    const [startHours, startMinutes] = startTime.split(":");
    const [endHours, endMinutes] = endTime.split(":");

    const start = new Date(dateObj);
    start.setHours(parseInt(startHours), parseInt(startMinutes), 0);

    const end = new Date(dateObj);
    end.setHours(parseInt(endHours), parseInt(endMinutes), 0);

    const diffInHours = (end - start) / (1000 * 60 * 60);
    const hours = Math.floor(diffInHours);
    const minutes = Math.round((diffInHours - hours) * 60);

    return `${hours}h ${minutes}m`;
  };

  // دالة جديدة لجمع تاريخ النشاط
  const collectActivityHistory = (activities, title) => {
    try {
      // البحث عن كل الأنشطة بنفس العنوان
      const sameActivities = activities.filter((a) => a.title === title);

      // تحويل مدة كل نشاط إلى دقائق
      let totalMinutes = 0;

      const historyItems = sameActivities.map((a) => {
        const durationMinutes = durationToMinutes(a.duration);
        totalMinutes += durationMinutes;

        return {
          id: a.id,
          date: a.date,
          time: a.time,
          duration: a.duration,
          durationMinutes: durationMinutes,
          description: a.description || "",
        };
      });

      // ترتيب الأنشطة حسب التاريخ (الأحدث أولاً)
      historyItems.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });

      setActivityHistory(historyItems);
      setTotalTrackedMinutes(totalMinutes);
    } catch (error) {
      console.error("Error collecting activity history:", error);
    }
  };

  // دالة مساعدة لتحويل صيغة المدة (مثل "2h 30m") إلى دقائق
  const durationToMinutes = (duration) => {
    try {
      const hourMatch = duration.match(/(\d+)h/);
      const minuteMatch = duration.match(/(\d+)m/);

      const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
      const minutes = minuteMatch ? parseInt(minuteMatch[1]) : 0;

      return hours * 60 + minutes;
    } catch (error) {
      console.error("Error parsing duration:", error);
      return 0;
    }
  };

  // دالة مساعدة لتنسيق عرض الدقائق بشكل مقروء
  const formatMinutes = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
      return `${hours} ساعة ${minutes > 0 ? `و ${minutes} دقيقة` : ""}`;
    } else {
      return `${minutes} دقيقة`;
    }
  };

  // تحديث قيمة في نموذج التعديل
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // تقديم نموذج التعديل
  const handleSubmit = (e) => {
    e.preventDefault();

    try {
      // التحقق من صحة الوقت
      const [startHours, startMinutes] = formData.startTime.split(":");
      const [endHours, endMinutes] = formData.endTime.split(":");

      const dateObj = new Date(formData.date);

      const startDate = new Date(dateObj);
      startDate.setHours(parseInt(startHours), parseInt(startMinutes), 0);

      const endDate = new Date(dateObj);
      endDate.setHours(parseInt(endHours), parseInt(endMinutes), 0);

      if (endDate <= startDate) {
        showToast("وقت الانتهاء يجب أن يكون بعد وقت البدء", "error");
        return;
      }

      // إنشاء البيانات الوصفية للتاريخ
      const dateMetadata = {
        day: dateObj.getDate(),
        month: dateObj.getMonth() + 1,
        year: dateObj.getFullYear(),
        dateKey: `${dateObj.getDate()}-${
          dateObj.getMonth() + 1
        }-${dateObj.getFullYear()}`,
      };

      // إنشاء كائن النشاط المحدث
      const updatedActivity = {
        ...activity,
        title: formData.title,
        time: `${convertTo12HourFormat(
          formData.startTime
        )} - ${convertTo12HourFormat(formData.endTime)}`,
        duration: calculateDuration(
          formData.startTime,
          formData.endTime,
          formData.date
        ),
        date: formatDate(dateObj),
        dateMetadata: dateMetadata,
        description: formData.description,
      };

      // تحديث النشاط في التخزين المحلي
      const savedActivities = JSON.parse(
        localStorage.getItem("recentActivities") || "[]"
      );
      const updatedActivities = savedActivities.map((item) =>
        item.id === parseInt(id) ? updatedActivity : item
      );

      localStorage.setItem(
        "recentActivities",
        JSON.stringify(updatedActivities)
      );

      // تحديث حالة النشاط الحالي
      setActivity(updatedActivity);
      setEditMode(false);
      showToast("تم تحديث النشاط بنجاح");
    } catch (error) {
      console.error("Error updating activity:", error);
      showToast("حدث خطأ أثناء تحديث النشاط", "error");
    }
  };

  // حذف النشاط
  const handleDelete = () => {
    try {
      const savedActivities = JSON.parse(
        localStorage.getItem("recentActivities") || "[]"
      );
      const updatedActivities = savedActivities.filter(
        (item) => item.id !== parseInt(id)
      );

      localStorage.setItem(
        "recentActivities",
        JSON.stringify(updatedActivities)
      );

      showToast("تم حذف النشاط بنجاح");
      setTimeout(() => {
        navigate("/activities");
      }, 1500);
    } catch (error) {
      console.error("Error deleting activity:", error);
      showToast("حدث خطأ أثناء حذف النشاط", "error");
    }
  };

  // إعداد أسلوب لعرض مستوى النشاط
  const getActivityStyle = (duration) => {
    if (!duration) return {};
    const hours = parseFloat(duration.split("h")[0]);

    if (hours >= 4) {
      return {
        icon: "💪",
        color: "text-purple-500",
        bgColor: "bg-purple-500/20",
        border: "border-purple-500",
      };
    } else if (hours >= 2) {
      return {
        icon: "🎯",
        color: "text-orange-500",
        bgColor: "bg-orange-500/20",
        border: "border-orange-500",
      };
    } else if (hours >= 1) {
      return {
        icon: "✅",
        color: "text-green-500",
        bgColor: "bg-green-500/20",
        border: "border-green-500",
      };
    } else {
      return {
        icon: "⚡",
        color: "text-blue-500",
        bgColor: "bg-blue-500/20",
        border: "border-blue-500",
      };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const activityStyle = activity ? getActivityStyle(activity.duration) : {};
  return (
    <>
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={hideToast}
      />

      <div className="mb-4">
        <Link
          to="/activities"
          className="flex items-center text-indigo-400 hover:text-indigo-300 transition-colors"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          العودة إلى الأنشطة
        </Link>
      </div>

      <AnimatedContainer>
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          {!editMode ? (
            <div>
              {/* عرض تفاصيل النشاط */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center">
                  <span className={`text-3xl ${activityStyle.color} mr-3`}>
                    {activityStyle.icon}
                  </span>
                  <div>
                    <h1 className="text-2xl font-bold text-white">
                      {activity.title}
                    </h1>
                    <p className="text-gray-400">{activity.date}</p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditMode(true)}
                    className="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center transition-colors shadow-md"
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    تعديل
                  </button>

                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="bg-rose-600 cursor-pointer hover:bg-rose-700 text-white py-2 px-4 rounded-lg flex items-center transition-colors shadow-md"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    حذف
                  </button>
                </div>
              </div>

              <div
                className={`p-4 rounded-lg mb-6 ${activityStyle.bgColor} border ${activityStyle.border}`}
              >
                <div className="flex flex-wrap gap-y-3 gap-x-6">
                  <div>
                    <div className="text-gray-400 text-sm">الوقت</div>
                    <div className="text-white font-medium">
                      {activity.time}
                    </div>
                  </div>

                  <div>
                    <div className="text-gray-400 text-sm">المدة</div>
                    <div className="text-white font-medium">
                      {activity.duration}
                    </div>
                  </div>

                  {activityHistory.length > 1 && (
                    <div>
                      <div className="text-gray-400 text-sm">
                        إجمالي الوقت المتابع
                      </div>
                      <div className="text-white font-medium">
                        {formatMinutes(totalTrackedMinutes)}
                      </div>
                    </div>
                  )}

                  {activityHistory.length > 1 && (
                    <div>
                      <div className="text-gray-400 text-sm">
                        عدد مرات التسجيل
                      </div>
                      <div className="text-white font-medium">
                        {activityHistory.length} مرة
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {activity.description && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-white mb-2">الوصف</h3>
                  <div className="bg-gray-700 p-4 rounded-lg text-gray-200 whitespace-pre-wrap">
                    {activity.description}
                  </div>
                </div>
              )}

              {activityHistory.length > 1 && (
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-medium text-white">
                      سجل النشاط
                    </h3>
                    <button
                      className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center"
                      onClick={() => setShowHistory(!showHistory)}
                    >
                      {showHistory ? (
                        <>
                          <span>إخفاء السجل</span>
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 15l7-7 7-7"
                            />
                          </svg>
                        </>
                      ) : (
                        <>
                          <span>عرض السجل</span>
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>

                  {showHistory && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-y-auto max-h-80"
                    >
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-700">
                            <th className="text-right py-2 px-3 text-gray-300 font-medium">
                              التاريخ
                            </th>
                            <th className="text-right py-2 px-3 text-gray-300 font-medium">
                              الوقت
                            </th>
                            <th className="text-right py-2 px-3 text-gray-300 font-medium">
                              المدة
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {activityHistory.map((item, index) => (
                            <tr
                              key={item.id}
                              className={`${
                                parseInt(id) === item.id
                                  ? "bg-indigo-900/20 border-l-4 border-indigo-500"
                                  : index % 2 === 0
                                  ? "bg-gray-800"
                                  : "bg-gray-750"
                              }`}
                            >
                              <td className="py-2 px-3 text-white">
                                {item.date}
                              </td>
                              <td className="py-2 px-3 text-gray-200">
                                {item.time}
                              </td>
                              <td className="py-2 px-3 text-gray-200">
                                {item.duration}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <div className="mt-6">
                        <h4 className="text-sm font-medium text-gray-300 mb-3">
                          توزيع وقت النشاط حسب اليوم
                        </h4>
                        <div className="bg-gray-750 p-4 rounded-lg">
                          <div className="flex items-end h-24 gap-1">
                            {activityHistory
                              .slice(0, 14)
                              .reverse()
                              .map((item) => {
                                const maxHeight = 80;
                                const height =
                                  (item.durationMinutes /
                                    Math.max(
                                      ...activityHistory.map(
                                        (a) => a.durationMinutes
                                      )
                                    )) *
                                  maxHeight;

                                return (
                                  <div
                                    key={item.id}
                                    className="flex flex-col items-center group relative flex-1"
                                  >
                                    <div className="text-xs text-gray-500 mb-1 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-6 whitespace-nowrap">
                                      {formatMinutes(item.durationMinutes)}
                                    </div>
                                    <div
                                      style={{
                                        height: `${Math.max(height, 15)}px`,
                                      }}
                                      className={`w-full ${
                                        parseInt(id) === item.id
                                          ? "bg-indigo-500"
                                          : "bg-indigo-800 group-hover:bg-indigo-700"
                                      } rounded-t transition-colors`}
                                    />
                                    <div className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-top-left overflow-hidden whitespace-nowrap w-12 truncate">
                                      {new Date(item.date).toLocaleDateString(
                                        "ar-EG",
                                        { day: "numeric", month: "numeric" }
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {confirmDelete && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
                  <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
                    <h3 className="text-xl font-bold text-white mb-4">
                      تأكيد الحذف
                    </h3>
                    <p className="text-gray-300 mb-6">
                      هل أنت متأكد أنك تريد حذف هذا النشاط؟ لا يمكن التراجع عن
                      هذا الإجراء.
                    </p>
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setConfirmDelete(false)}
                        className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                      >
                        إلغاء
                      </button>
                      <button
                        onClick={handleDelete}
                        className="bg-rose-600 hover:bg-rose-700 text-white py-2 px-4 rounded-lg transition-colors"
                      >
                        نعم، حذف النشاط
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">تعديل النشاط</h2>
                <button
                  onClick={() => setEditMode(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  إلغاء التعديل
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-gray-300 text-sm font-medium mb-2"
                  >
                    عنوان النشاط
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="أدخل عنوان النشاط"
                  />
                </div>

                <div>
                  <label
                    htmlFor="date"
                    className="block text-gray-300 text-sm font-medium mb-2"
                  >
                    التاريخ
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                      value={formData.startTime}
                      onChange={handleChange}
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
                      value={formData.endTime}
                      onChange={handleChange}
                      required
                      className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
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
                    placeholder="أضف تفاصيل إضافية عن النشاط"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg w-full transition-colors shadow-md"
                >
                  حفظ التغييرات
                </button>
              </form>
            </div>
          )}
        </div>
      </AnimatedContainer>
    </>
  );
}
