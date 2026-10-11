/**
 * تنسيق التاريخ بصيغة عربية مناسبة
 * مثال: "السبت، 8 مارس 2025"
 */
export const formatDate = (date) => {
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

    // التأكد من أن date هو كائن تاريخ
    const dateObj = date instanceof Date ? date : new Date(date);
    
    const dayName = days[dateObj.getDay()];
    const day = dateObj.getDate();
    const monthName = months[dateObj.getMonth()];
    const year = dateObj.getFullYear();

    return `${dayName}، ${day} ${monthName} ${year}`;
  } catch (error) {
    console.error("Error formatting date:", error, date);
    // إرجاع نص افتراضي أو التاريخ الأصلي في حالة الخطأ
    return typeof date === 'string' ? date : String(date);
  }
};

/**
 * تنسيق الوقت بصيغة عربية مناسبة
 * مثال: "10:30 صباحاً"
 */
export const formatTime = (timeStr) => {
  try {
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours);
    const period = hour >= 12 ? "مساءً" : "صباحاً";
    const formattedHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${formattedHour}:${minutes} ${period}`;
  } catch (error) {
    console.error("Error formatting time:", error);
    return timeStr; // إعادة النص الأصلي في حالة الخطأ
  }
};

/**
 * تحويل المدة من ساعات ودقائق إلى نص
 * مثال: من "2h 30m" إلى "ساعتان ونصف"
 */
export const formatDuration = (durationStr) => {
  try {
    const hourMatch = durationStr.match(/(\d+)h/);
    const minuteMatch = durationStr.match(/(\d+)m/);
    
    const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
    const minutes = minuteMatch ? parseInt(minuteMatch[1]) : 0;
    
    const totalMinutes = hours * 60 + minutes;
    
    return formatMinutes(totalMinutes);
  } catch (error) {
    console.error("Error formatting duration:", error);
    return durationStr; // إعادة النص الأصلي في حالة الخطأ
  }
};

/**
 * تنسيق الدقائق بشكل مقروء
 */
export const formatMinutes = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours} ساعة ${minutes > 0 ? `و ${minutes} دقيقة` : ""}`;
  } else {
    return `${minutes} دقيقة`;
  }
};

/**
 * تحويل نص المدة إلى دقائق
 */
export const durationToMinutes = (duration) => {
  try {
    // تحليل النص مثل "2h 30m"
    const hourMatch = duration.match(/(\d+)h/);
    const minuteMatch = duration.match(/(\d+)m/);

    const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
    const minutes = minuteMatch ? parseInt(minuteMatch[1]) : 0;

    return hours * 60 + minutes;
  } catch (error) {
    console.error("Error parsing duration:", duration, error);
    return 0;
  }
};

/**
 * إنشاء البيانات الوصفية للتاريخ
 */
export const getDateMetadata = (date) => {
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    return {
      day: dateObj.getDate(),
      month: dateObj.getMonth() + 1,
      year: dateObj.getFullYear(),
      // تنسيق يسهل عملية المقارنة
      dateKey: `${dateObj.getDate()}-${dateObj.getMonth() + 1}-${dateObj.getFullYear()}`,
    };
  } catch (error) {
    console.error("Error creating date metadata:", error);
    return {
      day: 1, month: 1, year: 2023, dateKey: "1-1-2023"
    };
  }
};
