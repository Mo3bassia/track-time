import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Toast({
  message,
  type = "success",
  isVisible,
  onClose,
  autoClose = true,
  duration = 3000,
}) {
  // أنواع الإشعارات والأيقونات
  const types = {
    success: {
      icon: "✅",
      bgColor: "bg-green-800",
      textColor: "text-green-100",
    },
    error: {
      icon: "❌",
      bgColor: "bg-red-800",
      textColor: "text-red-100",
    },
    info: {
      icon: "ℹ️",
      bgColor: "bg-blue-800",
      textColor: "text-blue-100",
    },
  };

  // تطبيق إغلاق تلقائي بعد مدة محددة
  useEffect(() => {
    if (isVisible && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, autoClose, onClose, duration]);

  // الحصول على تنسيق حسب النوع
  const { icon, bgColor, textColor } = types[type] || types.info;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div
            className={`${bgColor} ${textColor} px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2`}
          >
            <span className="ml-2">{icon}</span>
            <p className="font-medium">{message}</p>
            <button
              onClick={onClose}
              className="opacity-70 hover:opacity-100 transition-opacity ml-4"
              aria-label="إغلاق"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
