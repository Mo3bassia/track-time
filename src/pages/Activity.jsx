import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AnimatedContainer from "../components/AnimatedContainer";
import {
  useCreateActivity,
  usePreviousTitles,
} from "../hooks/useActivities";
import {
  calcDurationMinutes,
  parseEstimatedInput,
} from "../lib/activityHelpers";

export default function Activity() {
  const navigate = useNavigate();
  const createMutation = useCreateActivity();
  const previousTitles = usePreviousTitles();

  const [timeMode, setTimeMode] = useState("range");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "10:00",
    estHours: "1",
    estMinutes: "0",
  });
  const [filteredTitles, setFilteredTitles] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  useEffect(() => {
    if (formData.title.trim().length > 0) {
      const filtered = previousTitles.filter((title) =>
        title.toLowerCase().includes(formData.title.toLowerCase()),
      );
      setFilteredTitles(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setFilteredTitles([]);
      setShowSuggestions(false);
    }
    setSelectedSuggestionIndex(-1);
  }, [formData.title, previousTitles]);

  const showMsg = (message, type = "success") => {
    if (type === "error") toast.error(message);
    else toast.success(message);
  };

  const handleSuggestionClick = (title) => {
    setFormData((prev) => ({ ...prev, title }));
    setShowSuggestions(false);
    setFilteredTitles([]);
    setSelectedSuggestionIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) =>
        prev < filteredTitles.length - 1 ? prev + 1 : 0,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) =>
        prev > 0 ? prev - 1 : filteredTitles.length - 1,
      );
    } else if (e.key === "Enter" && selectedSuggestionIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(filteredTitles[selectedSuggestionIndex]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
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
        showMsg("وقت الانتهاء لازم يكون بعد وقت البدء", "error");
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
        showMsg("حط مدة تقديرية أكبر من صفر", "error");
        return;
      }
    }

    try {
      const created = await createMutation.mutateAsync({
        title: formData.title.trim(),
        description: formData.description.trim(),
        activityDate: formData.date,
        startTime,
        endTime,
        durationMinutes,
        timeMode,
      });
      showMsg(`تم إضافة نشاط "${formData.title}"`);
      setTimeout(() => {
        navigate(`/activities/${created.id}`);
      }, 400);
    } catch (err) {
      showMsg(err?.message || "فشل الحفظ", "error");
    }
  };

  return (
    <AnimatedContainer>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">إضافة نشاط جديد</h1>

        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, title: e.target.value }))
                  }
                  onKeyDown={handleKeyDown}
                  onFocus={() => {
                    if (filteredTitles.length > 0) setShowSuggestions(true);
                  }}
                  autoComplete="off"
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="أدخل عنوان النشاط"
                  required
                />
                {showSuggestions && filteredTitles.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <ul className="py-1">
                      {filteredTitles.map((title, index) => (
                        <li key={title}>
                          <button
                            type="button"
                            className={`w-full text-start px-4 py-2 text-white ${
                              selectedSuggestionIndex === index
                                ? "bg-indigo-900/30"
                                : "hover:bg-gray-600"
                            }`}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleSuggestionClick(title);
                            }}
                          >
                            {title}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {previousTitles.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm text-gray-400 mb-2">أنشطة سابقة:</p>
                  <div className="flex flex-wrap gap-2">
                    {previousTitles.slice(0, 8).map((title) => (
                      <button
                        key={title}
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
                onChange={(e) =>
                  setFormData((p) => ({ ...p, description: e.target.value }))
                }
                rows="4"
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="أضف أي تفاصيل إضافية عن نشاطك"
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
                value={formData.date}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, date: e.target.value }))
                }
                required
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <p className="block text-gray-300 text-sm font-medium mb-2">
                طريقة تسجيل الوقت
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTimeMode("range")}
                  className={`py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    timeMode === "range"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  من وقت لوقت
                </button>
                <button
                  type="button"
                  onClick={() => setTimeMode("estimated")}
                  className={`py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    timeMode === "estimated"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  مدة تقديرية
                </button>
              </div>
            </div>

            {timeMode === "range" ? (
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
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, startTime: e.target.value }))
                    }
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
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, endTime: e.target.value }))
                    }
                    required
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="estHours"
                    className="block text-gray-300 text-sm font-medium mb-2"
                  >
                    ساعات
                  </label>
                  <input
                    type="number"
                    id="estHours"
                    min="0"
                    max="24"
                    value={formData.estHours}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, estHours: e.target.value }))
                    }
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="estMinutes"
                    className="block text-gray-300 text-sm font-medium mb-2"
                  >
                    دقائق
                  </label>
                  <input
                    type="number"
                    id="estMinutes"
                    min="0"
                    max="59"
                    value={formData.estMinutes}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        estMinutes: e.target.value,
                      }))
                    }
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-300"
            >
              {createMutation.isPending ? "جاري الحفظ..." : "حفظ النشاط"}
            </button>
          </form>
        </div>
      </div>
    </AnimatedContainer>
  );
}
