import { useState, useEffect } from "react";

export default function InstallPWA() {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    // التحقق من دعم التثبيت
    const handler = (event) => {
      event.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(event);
      setShowInstall(true);
      console.log("يمكن تثبيت التطبيق", event);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // التحقق إذا كان التطبيق مثبتًا بالفعل
    if (window.matchMedia("(display-mode: standalone)").matches) {
      console.log("التطبيق مثبت بالفعل");
      setShowInstall(false);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // دالة التثبيت
  const handleInstall = async () => {
    if (!promptInstall) {
      console.log("لا يمكن التثبيت - ناقص Event");
      return;
    }

    // إظهار مربع حوار التثبيت
    promptInstall.prompt();

    // انتظار اختيار المستخدم
    const { outcome } = await promptInstall.userChoice;
    console.log(`اختيار المستخدم: ${outcome}`);

    // إخفاء الزر بعد الاختيار
    setShowInstall(false);
  };

  // لا نعرض شيئًا إذا كان التطبيق غير قابل للتثبيت
  if (!supportsPWA || !showInstall) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <button
        onClick={handleInstall}
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg flex items-center space-x-2 space-x-reverse shadow-lg"
      >
        <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 3a1 1 0 011 1v9.586l2.293-2.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 13.586V4a1 1 0 011-1z"
            clipRule="evenodd"
          />
        </svg>
        <span>تثبيت التطبيق</span>
      </button>
    </div>
  );
}
