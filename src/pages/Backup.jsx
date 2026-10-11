import { useState, useRef } from "react";
import { motion } from "framer-motion";
import AnimatedContainer from "../components/AnimatedContainer";
import Toast from "../components/Toast";

export default function Backup() {
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importedData, setImportedData] = useState(null);
  const [importConfirm, setImportConfirm] = useState(false);

  const fileInputRef = useRef(null);

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

  // تصدير البيانات
  const handleExport = async () => {
    try {
      setIsExporting(true);

      // جمع كل بيانات التطبيق من localStorage
      const appData = {
        activities: JSON.parse(
          localStorage.getItem("recentActivities") || "[]"
        ),
        exportDate: new Date().toISOString(),
        appVersion: "1.0.0", // يمكن تحديث هذا مع إصدار التطبيق
      };

      // تحويل البيانات إلى نص JSON منسق
      const jsonString = JSON.stringify(appData, null, 2);

      // إنشاء Blob للتنزيل
      const blob = new Blob([jsonString], { type: "application/json" });

      // إنشاء رابط تنزيل
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      // تنسيق اسم الملف مع التاريخ الحالي
      const now = new Date();
      const dateStr = now.toISOString().split("T")[0]; // مثال: 2023-11-15

      link.href = url;
      link.download = `time-tracker-backup-${dateStr}.json`;

      // تنزيل الملف
      document.body.appendChild(link);
      link.click();

      // تنظيف
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast("تم تصدير البيانات بنجاح");
    } catch (error) {
      console.error("Error exporting data:", error);
      showToast("حدث خطأ أثناء تصدير البيانات", "error");
    } finally {
      setIsExporting(false);
    }
  };

  // فتح مربع حوار اختيار الملف
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  // معالجة استيراد الملف
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);

      // قراءة محتوى الملف
      const text = await file.text();
      const data = JSON.parse(text);

      // التحقق من صحة البيانات
      if (!data.activities || !Array.isArray(data.activities)) {
        throw new Error("تنسيق الملف غير صحيح");
      }

      // حفظ البيانات للتأكيد
      setImportedData(data);

      // إظهار مربع حوار التأكيد
      setImportConfirm(true);
    } catch (error) {
      console.error("Error importing data:", error);
      showToast("حدث خطأ أثناء استيراد البيانات", "error");
    } finally {
      setIsImporting(false);
      // إعادة تعيين حقل الملف
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // تأكيد استيراد البيانات
  const handleConfirmImport = () => {
    try {
      if (!importedData) return;

      // حفظ البيانات في localStorage
      localStorage.setItem(
        "recentActivities",
        JSON.stringify(importedData.activities)
      );

      showToast("تم استيراد البيانات بنجاح");
      setImportConfirm(false);
      setImportedData(null);
    } catch (error) {
      console.error("Error saving imported data:", error);
      showToast("حدث خطأ أثناء حفظ البيانات", "error");
    }
  };

  // إلغاء استيراد البيانات
  const handleCancelImport = () => {
    setImportConfirm(false);
    setImportedData(null);
  };

  // تنسيق تاريخ التصدير
  const formatExportDate = (dateString) => {
    if (!dateString) return "غير معروف";

    const date = new Date(dateString);
    return date.toLocaleString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // أنيميشن للبطاقات
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-8">
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={hideToast}
      />

      <AnimatedContainer>
        <h1 className="text-3xl font-bold text-white mb-8 text-center mt-10">
          النسخ الاحتياطي واستعادة البيانات
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* بطاقة النسخ الاحتياطي */}
          <motion.div
            className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-indigo-600/20 text-indigo-500 rounded-full">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white text-center mb-4">
              تصدير البيانات
            </h2>
            <p className="text-gray-300 text-center mb-6">
              قم بتصدير جميع بيانات التطبيق إلى ملف JSON للنسخ الاحتياطي أو
              النقل إلى جهاز آخر.
            </p>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center ${
                isExporting ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white mr-2"></div>
                  جاري التصدير...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  تصدير البيانات
                </>
              )}
            </button>
          </motion.div>

          {/* بطاقة استيراد البيانات */}
          <motion.div
            className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-blue-600/20 text-blue-500 rounded-full">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                  transform="rotate(180 10 10)"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white text-center mb-4">
              استيراد البيانات
            </h2>
            <p className="text-gray-300 text-center mb-6">
              استعد بياناتك من ملف نسخة احتياطية سابقة. سيؤدي هذا إلى استبدال
              البيانات الحالية.
            </p>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={handleImportClick}
              disabled={isImporting}
              className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center ${
                isImporting ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {isImporting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white mr-2"></div>
                  جاري الاستيراد...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                      clipRule="evenodd"
                      transform="rotate(180 10 10)"
                    />
                  </svg>
                  استيراد البيانات
                </>
              )}
            </button>
          </motion.div>
        </div>
      </AnimatedContainer>

      {/* قسم المعلومات */}
      <AnimatedContainer delay={0.2}>
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">
            معلومات عن النسخ الاحتياطي
          </h2>

          <div className="space-y-4 text-gray-300">
            <div className="flex flex-col space-y-1">
              <h3 className="font-medium text-white">
                البيانات التي يتم تصديرها:
              </h3>
              <ul className="list-disc list-inside mr-6 space-y-1">
                <li>جميع الأنشطة المسجلة</li>
                <li>تواريخ وأوقات الأنشطة</li>
                <li>تفاصيل ووصف كل نشاط</li>
              </ul>
            </div>

            <div className="flex flex-col space-y-1">
              <h3 className="font-medium text-white">نصائح مهمة:</h3>
              <ul className="list-disc list-inside mr-6 space-y-1">
                <li>قم بعمل نسخ احتياطي بانتظام لتجنب فقدان البيانات</li>
                <li>استيراد البيانات سيستبدل جميع البيانات الحالية</li>
                <li>احتفظ بالملفات المصدرة في مكان آمن</li>
              </ul>
            </div>
          </div>
        </div>
      </AnimatedContainer>

      {/* مربع حوار تأكيد الاستيراد */}
      {importConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <motion.div
            className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-xl font-bold text-white mb-2">
              تأكيد استيراد البيانات
            </h3>

            <div className="bg-gray-700 rounded-lg p-4 my-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-300">تاريخ النسخة:</span>
                <span className="text-white">
                  {formatExportDate(importedData?.exportDate)}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-300">عدد الأنشطة:</span>
                <span className="text-white">
                  {importedData?.activities?.length || 0} نشاط
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">إصدار التطبيق:</span>
                <span className="text-white">
                  {importedData?.appVersion || "غير معروف"}
                </span>
              </div>
            </div>

            <p className="text-amber-400 mb-6">
              <svg
                className="w-5 h-5 inline-block mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              سيؤدي هذا إلى استبدال جميع البيانات الحالية بالبيانات المستوردة.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancelImport}
                className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmImport}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                استيراد البيانات
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
