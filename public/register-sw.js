// تسجيل Service Worker إذا كان مدعوماً
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('ServiceWorker registration successful');
      
      // الاستماع للتحديثات
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // إرسال حدث يفيد بوجود تحديث
            const event = new Event('swUpdate');
            window.dispatchEvent(event);
          }
        });
      });
    }).catch(error => {
      console.error('ServiceWorker registration failed:', error);
    });
    
    // التحقق من التحديثات عند تغيير حالة الشبكة
    window.addEventListener('online', () => {
      navigator.serviceWorker.getRegistration().then(reg => {
        if (reg) reg.update();
      });
    });
  });
}
