import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Stats from "./pages/Stats";
import Activity from "./pages/Activity";
import Activities from "./pages/Activities";
import ActivityDetails from "./pages/ActivityDetails";
import ActivityEdit from "./pages/ActivityEdit";
import Login from "./pages/Login";
import RequireAuth from "./components/RequireAuth";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route path="/" element={<Home />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/activities/:id/edit" element={<ActivityEdit />} />
          <Route path="/activities/:id" element={<ActivityDetails />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
