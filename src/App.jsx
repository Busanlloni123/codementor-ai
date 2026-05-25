import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "./context/AuthContext";
import Sidebar from "./components/layout/Sidebar";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import LoadingSpinner from "./components/ui/LoadingSpinner";

function ProtectedLayout({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            user ? <Navigate to="/chat" replace /> : <Home />
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedLayout>
              <Chat />
            </ProtectedLayout>
          }
        />
        <Route
          path="/chat/:conversationId"
          element={
            <ProtectedLayout>
              <Chat />
            </ProtectedLayout>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}