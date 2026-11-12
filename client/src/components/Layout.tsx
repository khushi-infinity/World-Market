import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { usePresenceHeartbeat } from "../lib/presence";
import { LoadingHall } from "./EmptyState";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";
import { OracleDock } from "./OracleDock";

export function ScrollToTop() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location.pathname]);
  return null;
}

export function Layout() {
  usePresenceHeartbeat();
  return (
    <div className="relative min-h-screen">
      <div className="site-atmosphere" />
      <div className="site-grain" />
      <div className="relative z-[2]">
        <Navbar />
        <main>
          <Outlet />
        </main>
        <Footer />
        <OracleDock />
      </div>
    </div>
  );
}

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="container-hall">
        <LoadingHall />
      </div>
    );
  }
  if (!user) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  }
  return <Outlet />;
}
