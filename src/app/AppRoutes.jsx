import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { USER_ROLES } from "../constants";

import PublicLayout from "../components/layout/PublicLayout";
import AppShell from "../components/layout/AppShell";
import NotFoundPage from "../pages/error/NotFoundPage";
import UnauthorizedPage from "../pages/error/UnauthorizedPage";
import LoginPage from "../pages/public/LoginPage";

import ParkingInfoPage from "../pages/public/ParkingInfoPage";
import RulesPage from "../pages/public/RulesPage";
import PublicPricingPage from "../pages/public/PublicPricingPage";
import AvailableSlotsPage from "../pages/public/AvailableSlotsPage";
import QRLookupPage from "../pages/public/QRLookupPage";
import RegisterPage from "../pages/public/RegisterPage";
import ForgotPasswordPage from "../pages/public/ForgotPasswordPage";

import UserManagementPage from "../pages/admin/UserManagementPage";
import SessionsAdministrationPage from "../pages/admin/SessionsAdministrationPage";

import CardManagementPage from "../pages/manager/CardManagementPage";
import StructureManagementPage from "../pages/manager/StructureManagementPage";
import PricingManagementPage from "../pages/manager/PricingManagementPage";
import MonthlyPassManagementPage from "../pages/manager/MonthlyPassManagementPage";
import ManagerDashboardPage from "../pages/manager/ManagerDashboardPage";
import ReportsPage from "../pages/manager/ReportsPage";
import LostCardApprovalsPage from "../pages/manager/LostCardApprovalsPage";
import MismatchApprovalsPage from "../pages/manager/MismatchApprovalsPage";
import AuditLogsPage from "../pages/manager/AuditLogsPage";
import AdminAuditLogPage from "../pages/admin/AdminAuditLogPage";

import StaffEntryPage from "../pages/staff/StaffEntryPage";
import StaffExitPage from "../pages/staff/StaffExitPage";
import StaffLostCardPage from "../pages/staff/StaffLostCardPage";
import StaffSessionsPage from "../pages/staff/StaffSessionsPage";
import GateSimulatorPage from "../pages/simulator/GateSimulatorPage";
import DriverProfilePage from "../pages/driver/DriverProfilePage";
import DriverVehiclesPage from "../pages/driver/DriverVehiclesPage";
import DriverHistoryPage from "../pages/driver/DriverHistoryPage";
import DriverBookingPage from "../pages/driver/DriverBookingPage";

const RequireAuth = ({ isAuthenticated }) => {
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

const RequireRole = ({ userRole, allowedRoles }) => {
  return allowedRoles.includes(userRole) ? <Outlet /> : <Navigate to="/unauthorized" replace />;
};

export default function AppRoutes({ isAuthenticated, userRole, currentUser, onLoginSuccess, onLogout }) {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<ParkingInfoPage />} />
        <Route path="/parking-info" element={<ParkingInfoPage />} />
        <Route path="/rules" element={<RulesPage />} />
        <Route path="/pricing" element={<PublicPricingPage />} />
        <Route path="/available-slots" element={<AvailableSlotsPage />} />
        <Route path="/card/:qrToken" element={<QRLookupPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              userRole === USER_ROLES.ADMIN ? (
                <Navigate to="/admin/users" replace />
              ) : userRole === USER_ROLES.MANAGER ? (
                <Navigate to="/manager/dashboard" replace />
              ) : userRole === USER_ROLES.STAFF ? (
                <Navigate to="/staff/entry" replace />
              ) : userRole === USER_ROLES.DRIVER ? (
                <Navigate to="/driver/profile" replace />
              ) : (
                <Navigate to="/" replace />
              )
            ) : (
              <LoginPage onLoginSuccess={onLoginSuccess} />
            )
          }
        />
      </Route>
      <Route element={<RequireAuth isAuthenticated={isAuthenticated} />}>
        <Route element={<AppShell currentUser={currentUser} onLogout={onLogout} />}>
          <Route element={<RequireRole userRole={userRole} allowedRoles={[USER_ROLES.MANAGER]} />}>
            <Route path="/manager/dashboard" element={<ManagerDashboardPage />} />
            <Route path="/manager/reports" element={<ReportsPage />} />
            <Route path="/manager/lost-card-approvals" element={<LostCardApprovalsPage />} />
            <Route path="/manager/mismatch-approvals" element={<MismatchApprovalsPage />} />
            <Route path="/manager/cards" element={<CardManagementPage />} />
            <Route path="/manager/structures" element={<StructureManagementPage />} />
            <Route path="/manager/pricing" element={<PricingManagementPage />} />
            <Route path="/manager/monthly-passes" element={<MonthlyPassManagementPage />} />
            <Route path="/manager/audit-logs" element={<AuditLogsPage scope="manager" />} />
          </Route>

          <Route element={<RequireRole userRole={userRole} allowedRoles={[USER_ROLES.ADMIN]} />}>
            <Route path="/admin/users" element={<UserManagementPage />} />
            <Route path="/admin/audit-logs" element={<AdminAuditLogPage />} />
            <Route path="/admin/sessions-administration" element={<SessionsAdministrationPage />} />
          </Route>

          <Route element={<RequireRole userRole={userRole} allowedRoles={[USER_ROLES.STAFF, USER_ROLES.MANAGER]} />}>
            <Route path="/staff/entry" element={<StaffEntryPage />} />
            <Route path="/staff/exit" element={<StaffExitPage />} />
            <Route path="/staff/lost-card" element={<StaffLostCardPage />} />
            <Route path="/staff/sessions" element={<StaffSessionsPage />} />
          </Route>

          <Route element={<RequireRole userRole={userRole} allowedRoles={[USER_ROLES.STAFF, USER_ROLES.MANAGER, USER_ROLES.ADMIN]} />}>
            <Route path="/simulator/gate" element={<GateSimulatorPage />} />
          </Route>

          <Route element={<RequireRole userRole={userRole} allowedRoles={[USER_ROLES.DRIVER]} />}>
            <Route path="/driver/profile" element={<DriverProfilePage />} />
            <Route path="/driver/vehicles" element={<DriverVehiclesPage />} />
            <Route path="/driver/history" element={<DriverHistoryPage />} />
            <Route path="/driver/booking" element={<DriverBookingPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
