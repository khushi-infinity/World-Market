import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  ChevronDown,
  Coins,
  LayoutDashboard,
  LogOut,
  Menu,
  MessagesSquare,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { api, timeAgo } from "../lib/api";
import { useAuth } from "../lib/auth";
import { useTopic } from "../lib/realtime";
import type { Notification } from "../lib/types";
import { Logo } from "./Logo";
import { SigilAvatar } from "./SigilAvatar";

const LINKS = [
  { to: "/jobs", label: "Decrees" },
  { to: "/artisans", label: "Artisans" },
  { to: "/counsel", label: "The Oracle" },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setNotifOpen(false);
    setUserOpen(false);
  }, [location.pathname]);

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api<Notification[]>("/notifications"),
    enabled: Boolean(user),
    refetchInterval: 60000,
  });

  const unread = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  useTopic<Notification>(
    user ? `/topic/users/${user.id}/notifications` : null,
    () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  );

  const markRead = async () => {
    await api("/notifications/read-all", { method: "POST" });
    void queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      <header className={`nav-shell fixed inset-x-0 top-0 z-50 ${scrolled ? "scrolled" : ""}`}>
        <div className="container-hall flex h-[72px] items-center justify-between gap-4">
          <Logo />

          <nav className="hidden items-center gap-8 lg:flex">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              >
                {link.label}
              </NavLink>
            ))}
            {user && (
              <NavLink
                to="/dashboard"
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              >
                The Hall
              </NavLink>
            )}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <>
                <Link
                  to="/messages"
                  className="relative hidden h-9 w-9 place-items-center text-parchment/55 transition hover:text-gold sm:grid"
                  aria-label="Ravens"
                >
                  <MessagesSquare size={17} />
                </Link>
                <Link
                  to="/treasury"
                  className="hidden h-9 w-9 place-items-center text-parchment/55 transition hover:text-gold sm:grid"
                  aria-label="Treasury"
                >
                  <Coins size={17} />
                </Link>
                <button
                  onClick={() => {
                    setNotifOpen((v) => !v);
                    setUserOpen(false);
                  }}
                  className="relative grid h-9 w-9 place-items-center text-parchment/55 transition hover:text-gold"
                  aria-label="Notifications"
                >
                  <Bell size={17} />
                  {unread > 0 && (
                    <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-crimson px-1 text-[9px] font-semibold text-parchment">
                      {unread}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => {
                    setUserOpen((v) => !v);
                    setNotifOpen(false);
                  }}
                  className="flex items-center gap-2 border-l border-parchment/10 pl-3"
                >
                  <SigilAvatar name={user.name} color={user.avatarColor} size={32} ring={false} />
                  <span className="hidden text-left md:block">
                    <span className="block text-[11px] font-medium text-parchment/85">{user.name}</span>
                    <span className="block text-[9px] uppercase tracking-[0.16em] text-parchment/35">
                      {user.role === "ARTISAN" ? "Artisan" : "Patron"}
                    </span>
                  </span>
                  <ChevronDown size={13} className="text-parchment/35" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-quiet hidden sm:inline-flex">
                  Sign in
                </Link>
                <Link to="/join" className="btn btn-gold !px-4 !py-2.5 !text-[10px]">
                  Enter the hall
                </Link>
              </>
            )}
            <button
              className="grid h-9 w-9 place-items-center text-parchment/70 lg:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {notifOpen && user && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="panel fixed right-4 top-[76px] z-50 w-[min(92vw,390px)] overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-gold/15 px-4 py-3">
                <span className="eyebrow">Ravens received</span>
                <button onClick={markRead} className="text-[10px] uppercase tracking-wider text-parchment/40 hover:text-gold">
                  Mark all read
                </button>
              </div>
              <div className="max-h-[420px] overflow-y-auto scroll-thin">
                {notifications.length === 0 && (
                  <p className="px-4 py-8 text-center text-sm text-parchment/40">No ravens have arrived.</p>
                )}
                {notifications.map((n) => (
                  <Link
                    key={n.id}
                    to={n.link ?? "/dashboard"}
                    onClick={() => setNotifOpen(false)}
                    className={`block border-b border-parchment/6 px-4 py-3 transition hover:bg-gold/5 ${
                      n.read ? "opacity-55" : ""
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {!n.read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />}
                      <div>
                        <p className="text-[12px] font-medium text-parchment/85">{n.title}</p>
                        <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-parchment/45">
                          {n.body}
                        </p>
                        <p className="mt-1 text-[9px] uppercase tracking-wider text-parchment/25">
                          {timeAgo(n.createdAt)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {userOpen && user && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setUserOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="panel fixed right-4 top-[76px] z-50 w-64 overflow-hidden"
            >
              <div className="border-b border-gold/15 px-4 py-4">
                <p className="font-display text-sm text-parchment">{user.name}</p>
                <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-parchment/35">
                  @{user.handle}
                </p>
              </div>
              <div className="py-1.5">
                {[
                  { to: "/dashboard", icon: LayoutDashboard, label: "The Hall" },
                  { to: "/messages", icon: MessagesSquare, label: "Ravens" },
                  { to: "/treasury", icon: Coins, label: "Treasury" },
                  { to: "/settings", icon: Settings, label: "Settings" },
                  { to: "/counsel", icon: Sparkles, label: "Consult the Oracle" },
                ].map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex items-center gap-3 px-4 py-2.5 text-[12px] text-parchment/65 transition hover:bg-gold/5 hover:text-parchment"
                  >
                    <item.icon size={14} className="text-gold/60" />
                    {item.label}
                  </Link>
                ))}
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 border-t border-parchment/8 px-4 py-3 text-[12px] text-parchment/55 transition hover:bg-crimson/10 hover:text-parchment"
              >
                <LogOut size={14} />
                Depart the hall
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed inset-x-0 top-[72px] z-40 overflow-hidden border-b border-gold/15 bg-[#0a0907]/98 backdrop-blur-xl lg:hidden"
          >
            <nav className="container-hall flex flex-col py-4">
              {[...LINKS, ...(user ? [{ to: "/dashboard", label: "The Hall" }, { to: "/messages", label: "Ravens" }, { to: "/treasury", label: "Treasury" }] : [])].map(
                (link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="border-b border-parchment/6 py-3 text-[11px] uppercase tracking-[0.2em] text-parchment/65"
                  >
                    {link.label}
                  </Link>
                ),
              )}
              {!user && (
                <Link to="/login" className="py-3 text-[11px] uppercase tracking-[0.2em] text-gold">
                  Sign in
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
