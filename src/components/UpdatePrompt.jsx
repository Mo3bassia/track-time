import { useState, useEffect } from "react";

// مكون UpdatePrompt بسيط لا يعتمد على مكتبات PWA
export default function UpdatePrompt() {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [registration, setRegistration] = useState(null);

  // التحقق من وجود تحديثات في service worker
  useEffect(() => {
    // التحقق من دعم service worker
    if ("serviceWorker" in navigator) {
      // الاستماع لحدث تحديث
      const handleUpdate = () => {
        setShowUpdatePrompt(true);
      };

      // تسجيل حدث التحديث
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.addEventListener(
          "controllerchange",
          handleUpdate
        );
      }

      // التحقق من service worker المسجل
      navigator.serviceWorker.getRegistration().then((reg) => {
        setRegistration(reg);

        // التحقق من التحديثات دورياً
        const interval = setInterval(() => {
          if (reg) {
            reg.update().catch(console.error);
          }
        }, 60 * 60 * 1000); // كل ساعة

        return () => clearInterval(interval);
      });

      return () => {
        navigator.serviceWorker.removeEventListener(
          "controllerchange",
          handleUpdate
        );
      };
    }
  }, []);

  // تطبيق التحديث
  const handleUpdate = () => {
    if (registration && registration.waiting) {
      // إرسال رسالة لتطبيق التحديث
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    }
    setShowUpdatePrompt(false);
    // إعادة تحميل الصفحة
    window.location.reload();
  };

  const handleClose = () => {
    setShowUpdatePrompt(false);
  };

  // لا نعرض شيئًا إذا لم يكن هناك تحديث
  if (!showUpdatePrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 border border-gray-700 p-4 rounded-lg shadow-lg z-50 w-full max-w-xs">
      <h3 className="font-bold text-white text-lg mb-2">تحديث جديد متاح</h3>
      <p className="text-gray-300 mb-4">
        يوجد تحديث جديد للتطبيق، هل تريد التحديث الآن؟
      </p>
      <div className="flex justify-end space-x-2 space-x-reverse">
        <button
          onClick={handleClose}
          className="bg-gray-700 text-white px-3 py-1.5 rounded-md text-sm hover:bg-gray-600 transition-colors"
        >
          لاحقاً
        </button>
        <button
          onClick={handleUpdate}
          className="bg-indigo-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-indigo-700 transition-colors"
        >
          تحديث الآن
        </button>
      </div>
    </div>
  );
}
