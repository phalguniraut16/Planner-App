import { lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthProvider";
import Layout from "./components/layout/Layout";

const Login = lazy(() => import("./pages/Login"));
const SignUp = lazy(() => import("./pages/SignUp"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const MyDay = lazy(() => import("./pages/MyDay"));
const Tasks = lazy(() => import("./pages/Tasks"));
const Habits = lazy(() => import("./pages/Habits"));
const Calendar = lazy(() => import("./pages/Calendar"));
const Finance = lazy(() => import("./pages/Finance"));
const Notes = lazy(() => import("./pages/Notes"));

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />

      <Route
        element={
          user ? (
            <Layout user={user} onLogout={() => {}} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="my-day" element={<MyDay />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="habits" element={<Habits />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="finance" element={<Finance />} />
        <Route path="notes" element={<Notes />} />
        <Route path="study" element={<div className="p-8">Study Planner (Stage 3)</div>} />
        <Route path="goals" element={<div className="p-8">Goals (Stage 3)</div>} />
        <Route path="projects" element={<div className="p-8">Projects (Stage 3)</div>} />
        <Route path="events" element={<div className="p-8">Events (Stage 3)</div>} />
        <Route path="analytics" element={<div className="p-8">Analytics (Stage 3)</div>} />
        <Route path="settings" element={<div className="p-8">Settings (Stage 4)</div>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
