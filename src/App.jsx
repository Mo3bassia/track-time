import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Stats from "./pages/Stats";
import Activity from "./pages/Activity";
import Activities from "./pages/Activities";
import ActivityDetails from "./pages/ActivityDetails";
import Backup from "./pages/Backup"; // إضافة استيراد صفحة النسخ الاحتياطي

export default function App() {
  // تطبيق الوضع المظلم دائما عند بدء التطبيق
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="stats" element={<Stats />} />
          <Route path="activity" element={<Activity />} />
          <Route path="activities" element={<Activities />} />
          <Route path="activities/:id" element={<ActivityDetails />} />
          <Route path="backup" element={<Backup />} />{" "}
          {/* إضافة مسار النسخ الاحتياطي */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
