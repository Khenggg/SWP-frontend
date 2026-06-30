import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRightFromLine,
  BarChart3,
  BellDot,
  BookOpenCheck,
  CalendarClock,
  CarFront,
  ClipboardCheck,
  CreditCard,
  FileClock,
  LayoutDashboard,
  LogOut,
  Menu,
  MoreHorizontal,
  ParkingCircle,
  RadioTower,
  Search,
  Settings,
  ShieldAlert,
  UserRoundCog,
  UsersRound,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { USER_ROLES } from "@/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const MENUS = {
  [USER_ROLES.STAFF]: [
    { label: "Cho xe vào", path: "/staff/entry", icon: ParkingCircle },
    { label: "Cho xe ra", path: "/staff/exit", icon: ArrowRightFromLine },
    { label: "Giả lập cổng", path: "/simulator/gate", icon: RadioTower },
    { label: "Báo mất thẻ", path: "/staff/lost-card", icon: ShieldAlert },
    { label: "Tìm phiên gửi", path: "/staff/sessions", icon: Search },
  ],
  [USER_ROLES.MANAGER]: [
    { label: "Bảng vận hành", path: "/manager/dashboard", icon: LayoutDashboard },
    { label: "Báo cáo", path: "/manager/reports", icon: BarChart3 },
    { label: "Duyệt mất thẻ", path: "/manager/lost-card-approvals", icon: ClipboardCheck },
    { label: "Lệch biển số", path: "/manager/mismatch-approvals", icon: BellDot },
    { label: "Quản lý thẻ", path: "/manager/cards", icon: CreditCard },
    { label: "Sơ đồ bãi xe", path: "/manager/structures", icon: CarFront },
    { label: "Cấu hình giá", path: "/manager/pricing", icon: Settings },
    { label: "Vé tháng", path: "/manager/monthly-passes", icon: CalendarClock },
    { label: "Nhật ký", path: "/manager/audit-logs", icon: FileClock },
    { label: "Cổng ra Staff", path: "/staff/exit", icon: ArrowRightFromLine },
    { label: "Giả lập cổng", path: "/simulator/gate", icon: RadioTower },
  ],
  [USER_ROLES.ADMIN]: [
    { label: "Người dùng", path: "/admin/users", icon: UsersRound },
    { label: "Quản trị phiên", path: "/admin/sessions-administration", icon: UserRoundCog },
    { label: "Nhật ký", path: "/admin/audit-logs", icon: FileClock },
    { label: "Giả lập cổng", path: "/simulator/gate", icon: RadioTower },
  ],
  [USER_ROLES.DRIVER]: [
    { label: "Hồ sơ", path: "/driver/profile", icon: UserRoundCog },
    { label: "Đặt chỗ", path: "/driver/booking", icon: CalendarClock },
    { label: "Xe của tôi", path: "/driver/vehicles", icon: CarFront },
    { label: "Lịch sử", path: "/driver/history", icon: BookOpenCheck },
  ],
};

const ROLE_META = {
  [USER_ROLES.STAFF]: { label: "Staff", tone: "bg-emerald-100 text-emerald-900" },
  [USER_ROLES.MANAGER]: { label: "Manager", tone: "bg-sky-100 text-sky-900" },
  [USER_ROLES.ADMIN]: { label: "Admin", tone: "bg-amber-100 text-amber-900" },
  [USER_ROLES.DRIVER]: { label: "Driver", tone: "bg-slate-100 text-slate-900" },
};

function isActivePath(currentPath, itemPath) {
  return currentPath === itemPath;
}

export default function AppShell({ currentUser, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const mainRef = useRef(null);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("sidebar-collapsed") === "true";
  });
  const role = currentUser?.role || USER_ROLES.STAFF;
  const activeMenu = MENUS[role] || [];
  const mobileItems = activeMenu.slice(0, 4);
  const activeItem = useMemo(
    () => activeMenu.find((item) => isActivePath(location.pathname, item.path)) || activeMenu[0],
    [activeMenu, location.pathname]
  );
  const roleMeta = ROLE_META[role] || ROLE_META[USER_ROLES.STAFF];

  const handleLogout = () => {
    if (window.confirm("Xác nhận đăng xuất khỏi hệ thống?")) {
      onLogout();
      navigate("/login");
    }
  };

  return (
    <div className="relative flex min-h-dvh bg-[color:var(--app-canvas)] text-foreground md:h-dvh md:overflow-hidden">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:rounded-lg focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:font-black focus:text-foreground focus:shadow-lg focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        Bỏ qua đến nội dung chính
      </a>

      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Đóng menu"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-foreground/35 backdrop-blur-sm focus-visible:ring-3 focus-visible:ring-ring/50 md:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r bg-[color:var(--nav-bg)] text-[color:var(--nav-foreground)] shadow-2xl transition-all duration-300 ease-in-out md:sticky md:top-0 md:h-dvh md:max-h-dvh md:shrink-0 md:translate-x-0 md:self-start md:overflow-hidden md:shadow-none",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "w-[min(21rem,calc(100vw-1.5rem))] md:w-20" : "w-[min(21rem,calc(100vw-1.5rem))] md:w-60"
        )}
      >
        <div className={cn(
          "flex h-20 items-center border-b border-[color:var(--nav-border)] transition-all duration-300",
          isCollapsed ? "justify-center px-2" : "justify-between px-5"
        )}>
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[color:var(--nav-active-strong)] font-black text-white shadow-sm">
              <span className="absolute inset-x-0 bottom-0 h-1.5 bg-[color:var(--nav-warm)]" />
              PB
            </div>
            {!isCollapsed && (
              <div className="min-w-0 animate-in fade-in duration-200">
                <p className="truncate text-sm font-black">Parking Building</p>
                <p className="truncate text-xs font-semibold text-[color:var(--nav-muted)]">Operations Console</p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="rounded-lg p-1 text-[color:var(--nav-muted)] transition-colors hover:bg-[color:var(--nav-hover)] hover:text-[color:var(--nav-foreground)] md:hidden"
              aria-label="Đóng menu"
            >
              <X aria-hidden="true" />
            </button>
          )}
        </div>

        <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3" aria-label="Điều hướng chính">
          {activeMenu.map((item) => (
            <NavItem
              key={item.path}
              item={item}
              isActive={isActivePath(location.pathname, item.path)}
              onNavigate={() => setIsSidebarOpen(false)}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>

        <div className="mt-auto p-3 border-t border-[color:var(--nav-border)]">
          <button
            type="button"
            onClick={() => {
              const nextVal = !isCollapsed;
              setIsCollapsed(nextVal);
              localStorage.setItem("sidebar-collapsed", String(nextVal));
            }}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold text-[color:var(--nav-muted)] hover:bg-[color:var(--nav-hover)] hover:text-[color:var(--nav-foreground)] transition-colors",
              isCollapsed ? "justify-center" : ""
            )}
            aria-label={isCollapsed ? "Mở rộng menu" : "Thu gọn menu"}
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[color:var(--nav-hover)] text-[color:var(--nav-muted)]">
              {isCollapsed ? <ChevronRight aria-hidden="true" className="size-4" /> : <ChevronLeft aria-hidden="true" className="size-4" />}
            </span>
            {!isCollapsed && <span className="truncate">Thu gọn menu</span>}
          </button>
        </div>

        <div className="border-t border-[color:var(--nav-border)] p-4">
          <div className={cn(
            "rounded-xl border border-[color:var(--nav-border)] bg-white shadow-sm transition-all duration-300",
            isCollapsed ? "p-2 text-center flex justify-center" : "p-3"
          )}>
            {isCollapsed ? (
              <span className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-black uppercase", roleMeta.tone)}>
                {roleMeta.label[0]}
              </span>
            ) : (
              <>
                <p className="truncate text-sm font-black">{currentUser?.fullName || currentUser?.username || "Nhân viên"}</p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="truncate text-xs font-semibold text-[color:var(--nav-muted)]">{currentUser?.username || "operator"}</span>
                  <span className={cn("rounded-md px-2 py-1 text-xs font-black uppercase", roleMeta.tone)}>{roleMeta.label}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </aside>

      <div className="flex min-h-dvh min-w-0 flex-1 flex-col md:h-dvh md:min-h-0">
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b bg-background/90 px-4 backdrop-blur md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="rounded-lg border bg-card p-2 text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground md:hidden"
              aria-label="Mở menu"
            >
              <Menu aria-hidden="true" />
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-foreground md:text-base">
                {activeItem?.label || "Hệ thống vận hành"}
              </p>
              <p className="hidden truncate text-xs font-semibold text-muted-foreground sm:block">
                Bãi đỗ xe thông minh · giám sát, xử lý, kiểm soát ngoại lệ
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden min-w-0 items-center gap-2 rounded-lg border bg-card px-3 py-2 shadow-sm sm:flex">
              <span className="max-w-44 truncate text-sm font-bold">
                {currentUser?.fullName || currentUser?.username || "Nhân viên"}
              </span>
              <span className={cn("rounded-md px-2 py-1 text-xs font-black uppercase", roleMeta.tone)}>{roleMeta.label}</span>
            </div>
            <Button variant="outline" onClick={handleLogout} aria-label="Đăng xuất">
              <LogOut data-icon="inline-start" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </Button>
          </div>
        </header>

        <main
          ref={mainRef}
          id="main-content"
          className="flex-1 p-4 pb-24 md:min-h-0 md:overflow-y-auto md:p-6"
        >
          <Outlet context={{ currentUser }} />
        </main>
      </div>

      <nav className={cn("fixed inset-x-3 bottom-3 z-20 rounded-2xl border bg-background/95 p-2 shadow-2xl backdrop-blur md:hidden", isSidebarOpen && "hidden")} aria-label="Điều hướng nhanh">
        <div className="grid grid-cols-5 gap-1">
          {mobileItems.map((item) => (
            <MobileNavItem key={item.path} item={item} isActive={isActivePath(location.pathname, item.path)} />
          ))}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-2 text-xs font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <MoreHorizontal aria-hidden="true" />
            <span className="max-w-full truncate">Thêm</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

function NavItem({ item, isActive, onNavigate, isCollapsed }) {
  const Icon = item.icon;

  return (
    <Link
      to={item.path}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "group relative flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold transition-colors",
        isActive
          ? "bg-[color:var(--nav-active)] text-[color:var(--nav-foreground)] shadow-sm ring-1 ring-[color:var(--nav-active-strong)]/20"
          : "text-[color:var(--nav-muted)] hover:bg-[color:var(--nav-hover)] hover:text-[color:var(--nav-foreground)]",
        isCollapsed ? "justify-center px-2" : ""
      )}
      title={isCollapsed ? item.label : undefined}
    >
      {isActive && <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[color:var(--nav-active-strong)]" />}
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors",
          isActive ? "bg-[color:var(--nav-active-strong)] text-white" : "bg-[color:var(--nav-hover)] text-[color:var(--nav-muted)] group-hover:text-[color:var(--nav-foreground)]"
        )}
      >
        <Icon aria-hidden="true" />
      </span>
      {!isCollapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}

function MobileNavItem({ item, isActive }) {
  const Icon = item.icon;

  return (
    <Link
      to={item.path}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-2 text-xs font-bold transition-colors",
        isActive ? "bg-[color:var(--nav-active)] text-[color:var(--nav-foreground)]" : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon aria-hidden="true" />
      <span className="max-w-full truncate">{item.label}</span>
    </Link>
  );
}
