import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showMessage, setShowMessage] = useState(!navigator.onLine);

  useEffect(() => {
    function onlineHandler() {
      setIsOnline(true);

      // عرض رسالة الاتصال لمدة 5 ثوانٍ ثم إخفاؤها
      setShowMessage(true);
      setTimeout(() => {
        setShowMessage(false);
      }, 5000); // 5 ثوانٍ
    }

    function offlineHandler() {
      setIsOnline(false);

      // عرض رسالة عدم الاتصال لمدة 5 ثوانٍ ثم إخفاؤها
      setShowMessage(true);
      setTimeout(() => {
        setShowMessage(false);
      }, 5000); // 5 ثوانٍ
    }

    // إذا كان غير متصل، نبدأ بعرض الرسالة ثم نخفيها بعد 5 ثوانٍ
    if (!navigator.onLine) {
      setShowMessage(true);
      setTimeout(() => {
        setShowMessage(false);
      }, 5000);
    }

    window.addEventListener("online", onlineHandler);
    window.addEventListener("offline", offlineHandler);

    return () => {
      window.removeEventListener("online", onlineHandler);
      window.removeEventListener("offline", offlineHandler);
    };
  }, []);

  // دالة لإغلاق الرسالة يدويًا إذا أراد المستخدم
  const closeMessage = () => {
    setShowMessage(false);
  };

  // الانيميشن للرسالة
  const messageVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <AnimatePresence>
      {showMessage && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={messageVariants}
          transition={{ duration: 0.3 }}
          className={`fixed top-16 z-50 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg
            ${
              isOnline ? "bg-green-600 text-white" : "bg-amber-600 text-white"
            }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {isOnline ? (
                <>
                  <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse mr-2" />
                  <span>تم استعادة الاتصال بالإنترنت</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-amber-300 rounded-full mr-2" />
                  <span>
                    أنت الآن في وضع عدم الاتصال، ولكن التطبيق سيعمل بشكل طبيعي
                  </span>
                </>
              )}
            </div>

            {/* زر الإغلاق */}
            <button
              onClick={closeMessage}
              className="ml-3 text-white hover:text-white/80 focus:outline-none"
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
