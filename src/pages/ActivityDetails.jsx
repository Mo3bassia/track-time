import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import AnimatedContainer from "../components/AnimatedContainer";
import Toast from "../components/Toast";
import {
  useActivities,
  useActivity,
  useDeleteActivity,
  useUpdateActivity,
} from "../hooks/useActivities";
import {
  calcDurationMinutes,
  formatMinutes,
  parseEstimatedInput,
} from "../lib/activityHelpers";

function getActivityStyle(duration) {
  const hours = parseFloat(String(duration || "0").split("h")[0]) || 0;
  if (hours >= 4) {
    return {
      icon: "💪",
      color: "text-purple-500",
      bgColor: "bg-purple-500/20",
      border: "border-purple-500",
    };
  }
  if (hours >= 2) {
    return {
      icon: "🎯",
      color: "text-orange-500",
      bgColor: "bg-orange-500/20",
      border: "border-orange-500",
    };
  }
  if (hours >= 1) {
    return {
      icon: "✅",
      color: "text-green-500",
      bgColor: "bg-green-500/20",
      border: "border-green-500",
    };
  }
  return {
    icon: "⚡",
    color: "text-blue-500",
    bgColor: "bg-blue-500/20",
    border: "border-blue-500",
  };
}

export default function ActivityDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: activity, isLoading: loading } = useActivity(id);
  const { data: allActivities = [] } = useActivities();
  const updateMutation = useUpdateActivity();
  const deleteMutation = useDeleteActivity();

  const [editMode, setEditMode] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [timeMode, setTimeMode] = useState("range");
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    startTime: "09:00",
    endTime: "10:00",
    estHours: "1",
    estMinutes: "0",
    description: "",
  });
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
  };

  useEffect(() => {
    if (!activity) return;
    setTimeMode(activity.timeMode || "range");
    const mins = activity.durationMinutes || 0;
    setFormData({
      title: activity.title,
      date: activity.activityDate || "",
      startTime: activity.startTime || "09:00",
      endTime: activity.endTime || "10:00",
      estHours: String(Math.floor(mins / 60)),
      estMinutes: String(mins % 60),
      description: activity.description || "",
    });
  }, [activity]);

  const history = useMemo(() => {
    if (!activity) return [];
    return allActivities
      .filter((a) => a.title === activity.title)
      .map((a) => ({
        id: a.id,
        date: a.date,
        time: a.time,
        duration: a.duration,
        durationMinutes: a.durationMinutes || 0,
      }));
  }, [allActivities, activity]);

  const totalTrackedMinutes = useMemo(
    () => history.reduce((s, h) => s + h.durationMinutes, 0),
    [history],
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let durationMinutes = 0;
    let startTime = null;
    let endTime = null;

    if (timeMode === "range") {
      durationMinutes = calcDurationMinutes(
        formData.startTime,
        formData.endTime,
      );
      if (durationMinutes <= 0) {
        showToast("وقت الانتهاء لازم يكون بعد وقت البدء", "error");
        return;
      }
      startTime = formData.startTime;
      endTime = formData.endTime;
    } else {
      durationMinutes = parseEstimatedInput(
        formData.estHours,
        formData.estMinutes,
      );
      if (durationMinutes <= 0) {
        showToast("حط مدة تقديرية أكبر من صفر", "error");
        return;
      }
    }

    try {
      await updateMutation.mutateAsync({
        id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        activityDate: formData.date,
        startTime,
        endTime,
        durationMinutes,
        timeMode,
      });
      setEditMode(false);
      showToast("تم تحديث النشاط بنجاح");
    } catch (err) {
      showToast(err?.message || "فشل التحديث", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id);
      showToast("تم حذف النشاط بنجاح");
      setTimeout(() => navigate("/activities", { replace: true }), 600);
    } catch (err) {
      showToast(err?.message || "فشل الحذف", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (!activity) {
    return (
      <AnimatedContainer>
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <p className="text-white mb-4">لم يتم العثور على النشاط</p>
          <Link to="/activities" className="text-indigo-400">
            العودة للأنشطة
          </Link>
        </div>
      </AnimatedContainer>
    );
  }

  const style = getActivityStyle(activity.duration);

  return (
    <>
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast((t) => ({ ...t, visible: false }))}
      />

      <div className="mb-4">
        <Link
          to="/activities"
          className="flex items-center text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          ← العودة إلى الأنشطة
        </Link>
      </div>

      <AnimatedContainer>
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          {!editMode ? (
            <div>
              <div className="flex flex-wrap justify-between items-start gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <span className={`text-3xl ${style.color}`}>{style.icon}</span>
                  <div>
                    <h1 className="text-2xl font-bold text-white">
                      {activity.title}
                    </h1>
                    <p className="text-gray-400">{activity.date}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditMode(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
                  >
                    تعديل
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="bg-rose-600 hover:bg-rose-700 text-white py-2 px-4 rounded-lg"
                  >
                    حذف
                  </button>
                </div>
              </div>

              <div
                className={`p-4 rounded-lg mb-6 ${style.bgColor} border ${style.border}`}
              >
                <div className="flex flex-wrap gap-y-3 gap-x-6">
                  <div>
                    <div className="text-gray-400 text-sm">الوقت</div>
                    <div className="text-white font-medium">{activity.time}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">المدة</div>
                    <div className="text-white font-medium">
                      {activity.duration}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">النوع</div>
                    <div className="text-white font-medium">
                      {activity.timeMode === "estimated"
                        ? "تقديري"
                        : "من / إلى"}
                    </div>
                  </div>
                  {history.length > 1 && (
                    <>
                      <div>
                        <div className="text-gray-400 text-sm">
                          إجمالي الوقت المتابع
                        </div>
                        <div className="text-white font-medium">
                          {formatMinutes(totalTrackedMinutes)}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm">مرات التسجيل</div>
                        <div className="text-white font-medium">
                          {history.length} مرة
                        </div>
                      </div>
                    </>
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

              {history.length > 1 && (
                <div className="mt-6">
                  <button
                    type="button"
                    className="text-indigo-400 hover:text-indigo-300 text-sm"
                    onClick={() => setShowHistory((v) => !v)}
                  >
                    {showHistory ? "إخفاء السجل" : "عرض سجل النشاط"}
                  </button>
                  {showHistory && (
                    <div className="mt-3 overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-700">
                            <th className="text-right py-2 px-3 text-gray-300">
                              التاريخ
                            </th>
                            <th className="text-right py-2 px-3 text-gray-300">
                              الوقت
                            </th>
                            <th className="text-right py-2 px-3 text-gray-300">
                              المدة
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {history.map((item) => (
                            <tr
                              key={item.id}
                              className={
                                item.id === id
                                  ? "bg-indigo-900/20 border-l-4 border-indigo-500"
                                  : ""
                              }
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
                    </div>
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
                      متأكد إنك عايز تحذف النشاط؟ مش هترجع.
                    </p>
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(false)}
                        className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg"
                      >
                        إلغاء
                      </button>
                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={deleteMutation.isPending}
                        className="bg-rose-600 hover:bg-rose-700 text-white py-2 px-4 rounded-lg"
                      >
                        {deleteMutation.isPending ? "جاري..." : "حذف"}
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
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg"
                >
                  إلغاء
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">
                    العنوان
                  </label>
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">
                    التاريخ
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTimeMode("range")}
                    className={`py-2 rounded-lg text-sm ${
                      timeMode === "range"
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-700 text-gray-300"
                    }`}
                  >
                    من وقت لوقت
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeMode("estimated")}
                    className={`py-2 rounded-lg text-sm ${
                      timeMode === "estimated"
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-700 text-gray-300"
                    }`}
                  >
                    مدة تقديرية
                  </button>
                </div>

                {timeMode === "range" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">
                        بدء
                      </label>
                      <input
                        type="time"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleChange}
                        className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">
                        انتهاء
                      </label>
                      <input
                        type="time"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleChange}
                        className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">
                        ساعات
                      </label>
                      <input
                        type="number"
                        name="estHours"
                        min="0"
                        value={formData.estHours}
                        onChange={handleChange}
                        className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">
                        دقائق
                      </label>
                      <input
                        type="number"
                        name="estMinutes"
                        min="0"
                        max="59"
                        value={formData.estMinutes}
                        onChange={handleChange}
                        className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-gray-300 text-sm mb-2">
                    الوصف
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2"
                  />
                </div>

                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium py-3 px-6 rounded-lg w-full"
                >
                  {updateMutation.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
                </button>
              </form>
            </div>
          )}
        </div>
      </AnimatedContainer>
    </>
  );
}
