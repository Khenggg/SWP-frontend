import React, { useState, useEffect, useMemo } from "react";
import { userService } from "../../services/userService";
import { auditService } from "../../services/auditService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  Search,
  RefreshCcw,
  Plus,
  Users,
  Shield,
  Briefcase,
  UserCheck,
  Lock,
  Eye,
  Edit,
  UserCog,
  Trash2,
  Maximize2,
  Mail,
  Phone,
  FileText,
  Activity
} from "lucide-react";

import { USER_ROLES, USER_STATUS } from "@/constants";

const ROLE_BADGE = {
  [USER_ROLES.ADMIN]: "bg-red-50 text-red-700 border-red-200",
  [USER_ROLES.MANAGER]: "bg-blue-50 text-blue-700 border-blue-200",
  [USER_ROLES.STAFF]: "bg-emerald-50 text-emerald-700 border-emerald-200",
  [USER_ROLES.DRIVER]: "bg-slate-50 text-slate-700 border-slate-200",
};

const STATUS_BADGE = {
  [USER_STATUS.ACTIVE]: "bg-emerald-50 text-emerald-700 border-emerald-200",
  [USER_STATUS.LOCKED]: "bg-red-50 text-red-700 border-red-200",
  [USER_STATUS.INACTIVE]: "bg-slate-50 text-slate-500 border-slate-200",
};

const ROLES = Object.values(USER_ROLES);
const STATUSES = Object.values(USER_STATUS);

const EMPTY_FORM = { username: "", fullName: "", email: "", phone: "", role: USER_ROLES.STAFF, password: "" };

const Field = ({ label, error, ...props }) => (
  <div>
    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
      {label} {props.required && <span className="text-red-500">*</span>}
    </label>
    <Input className={error ? "border-red-500" : ""} {...props} />
    {error && <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>}
  </div>
);

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [filterRole, setFilterRole] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchText, setSearchText] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  // Selection & Audit
  const [selectedUser, setSelectedUser] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await userService.getUsers();
      setUsers(data);
    } catch (err) {
      toast.error(err.message || "Không thể tải danh sách người dùng");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchUserActivities(selectedUser.username);
    } else {
      setRecentActivities([]);
    }
  }, [selectedUser]);

  const fetchUserActivities = async (username) => {
    try {
      setIsLoadingActivities(true);
      // Gọi API F054
      const logs = await auditService.getAuditLogs({ targetUser: username, limit: 5 });
      setRecentActivities(logs || []);
    } catch (err) {
      console.error("Lỗi khi tải hoạt động:", err);
      setRecentActivities([]);
    } finally {
      setIsLoadingActivities(false);
    }
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = users.length;
    const adminCount = users.filter(u => u.role === USER_ROLES.ADMIN).length;
    const managerCount = users.filter(u => u.role === USER_ROLES.MANAGER).length;
    const staffCount = users.filter(u => u.role === USER_ROLES.STAFF).length;
    const lockedCount = users.filter(u => u.status === USER_STATUS.LOCKED).length;
    
    const getPercent = (count) => total > 0 ? ((count / total) * 100).toFixed(1) : 0;
    
    return {
      total,
      admin: { count: adminCount, percent: getPercent(adminCount) },
      manager: { count: managerCount, percent: getPercent(managerCount) },
      staff: { count: staffCount, percent: getPercent(staffCount) },
      locked: { count: lockedCount, percent: getPercent(lockedCount) },
    };
  }, [users]);

  // Filtering
  const filtered = users.filter((u) => {
    const matchRole = filterRole === "ALL" || u.role === filterRole;
    const matchStatus = filterStatus === "ALL" || u.status === filterStatus;
    const matchSearch = !appliedSearch || 
      u.username.toLowerCase().includes(appliedSearch.toLowerCase()) || 
      u.fullName.toLowerCase().includes(appliedSearch.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(appliedSearch.toLowerCase())) ||
      (u.phone && u.phone.includes(appliedSearch));
    return matchRole && matchStatus && matchSearch;
  });

  const handleSearch = () => setAppliedSearch(searchText);
  const handleReset = () => {
    setSearchText("");
    setAppliedSearch("");
    setFilterRole("ALL");
    setFilterStatus("ALL");
  };

  // Validations
  const validate = (data, isCreate) => {
    const errs = {};
    if (!data.fullName?.trim()) errs.fullName = "Bắt buộc";
    if (isCreate && !data.username?.trim()) errs.username = "Bắt buộc";
    if (isCreate && !data.password?.trim()) errs.password = "Bắt buộc";
    if (!data.role) errs.role = "Bắt buộc";
    if (data.email && !/^\S+@\S+\\.\S+$/.test(data.email)) errs.email = "Email không hợp lệ";
    return errs;
  };

  const setField = (e, val) => {
    if (typeof e === "string") {
      setForm((p) => ({ ...p, [e]: val }));
      setFormErrors((p) => ({ ...p, [e]: undefined }));
    } else {
      const { name, value } = e.target;
      setForm((p) => ({ ...p, [name]: value }));
      setFormErrors((p) => ({ ...p, [name]: undefined }));
    }
  };

  // Modals Handlers
  const openCreate = () => { setForm(EMPTY_FORM); setFormErrors({}); setShowCreateModal(true); };
  const openEdit = (u) => { setForm({ ...u }); setFormErrors({}); setSelectedUser(u); setShowEditModal(true); };
  const openRole = (u) => { setForm({ ...u }); setSelectedUser(u); setShowRoleModal(true); };
  const openStatus = (u) => { setForm({ ...u }); setSelectedUser(u); setShowStatusModal(true); };

  const handleCreate = async () => {
    const errs = validate(form, true);
    if (Object.keys(errs).length > 0) return setFormErrors(errs);
    try {
      const created = await userService.addUser(form);
      setUsers((prev) => [...prev, created]);
      setShowCreateModal(false);
      toast.success("Tạo người dùng thành công!");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleEdit = async () => {
    const errs = validate(form, false);
    if (Object.keys(errs).length > 0) return setFormErrors(errs);
    try {
      const updated = await userService.updateUser(selectedUser.id, form);
      setUsers((prev) => prev.map((u) => u.id === selectedUser.id ? updated : u));
      if (selectedUser?.id === updated.id) setSelectedUser(updated);
      setShowEditModal(false);
      toast.success("Cập nhật thông tin thành công!");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRole = async () => {
    try {
      const updated = await userService.updateUserRole(selectedUser.id, form.role);
      setUsers((prev) => prev.map((u) => u.id === selectedUser.id ? updated : u));
      if (selectedUser?.id === updated.id) setSelectedUser(updated);
      setShowRoleModal(false);
      toast.success(`Đã đổi vai trò thành ${form.role}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleStatus = async () => {
    try {
      const updated = await userService.updateUserStatus(selectedUser.id, form.status);
      setUsers((prev) => prev.map((u) => u.id === selectedUser.id ? updated : u));
      if (selectedUser?.id === updated.id) setSelectedUser(updated);
      setShowStatusModal(false);
      toast.success(`Đã cập nhật trạng thái thành ${form.status}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto p-2 pb-10">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Quản lý Tài khoản</h1>
        <p className="text-sm text-slate-500 mt-1">Tạo, cập nhật, khóa/mở khóa tài khoản và thay đổi vai trò người dùng nội bộ</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng tài khoản</p>
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-slate-800">{stats.total}</span>
            <p className="text-xs text-slate-400 font-medium mt-1">Toàn hệ thống</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Admin</p>
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-slate-800">{stats.admin.count}</span>
            <p className="text-xs text-slate-400 font-medium mt-1">{stats.admin.percent}% tổng số</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Manager</p>
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-slate-800">{stats.manager.count}</span>
            <p className="text-xs text-slate-400 font-medium mt-1">{stats.manager.percent}% tổng số</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Staff</p>
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-slate-800">{stats.staff.count}</span>
            <p className="text-xs text-slate-400 font-medium mt-1">{stats.staff.percent}% tổng số</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tài khoản bị khóa</p>
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-slate-800">{stats.locked.count}</span>
            <p className="text-xs text-slate-400 font-medium mt-1">{stats.locked.percent}% tổng số</p>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="flex flex-col xl:flex-row gap-6 min-h-0">
        
        {/* Left Column (Table & Filters) */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          
          {/* Filters */}
          <div className="p-4 border-b border-slate-100 flex flex-wrap lg:flex-nowrap items-end gap-3 bg-slate-50/50">
            <div className="flex-1 min-w-[250px]">
              <label className="text-xs font-bold text-slate-500 mb-1.5 block">Tìm kiếm</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <Input 
                  placeholder="Tên, username, email, SĐT..." 
                  className="pl-9 h-9 text-sm bg-white border-slate-200 shadow-sm"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
            <div className="w-40">
              <label className="text-xs font-bold text-slate-500 mb-1.5 block">Vai trò</label>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="h-9 bg-white border-slate-200 shadow-sm text-sm font-medium">
                  <SelectValue placeholder="Tất cả vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả vai trò</SelectItem>
                  {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="w-40">
              <label className="text-xs font-bold text-slate-500 mb-1.5 block">Trạng thái</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-9 bg-white border-slate-200 shadow-sm text-sm font-medium">
                  <SelectValue placeholder="Tất cả trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                  {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 mt-auto">
              <Button onClick={handleSearch} className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-bold">
                <Search className="w-4 h-4 mr-2" />
                Tìm kiếm
              </Button>
              <Button variant="outline" onClick={handleReset} className="h-9 px-3 border-slate-200 text-slate-600 hover:bg-slate-50 font-bold">
                <RefreshCcw className="w-4 h-4" />
              </Button>
              <div className="w-px h-9 bg-slate-200 mx-1"></div>
              <Button onClick={openCreate} className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-bold">
                <Plus className="w-4 h-4 mr-2" />
                Tạo tài khoản
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto min-h-[400px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-48 text-slate-400 font-medium text-sm">
                Đang tải dữ liệu...
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm">
                  <TableRow className="border-b border-slate-100">
                    <TableHead className="font-bold text-slate-500 text-xs uppercase tracking-wider py-4">Mã user</TableHead>
                    <TableHead className="font-bold text-slate-500 text-xs uppercase tracking-wider py-4">Họ tên</TableHead>
                    <TableHead className="font-bold text-slate-500 text-xs uppercase tracking-wider py-4">Username</TableHead>
                    <TableHead className="font-bold text-slate-500 text-xs uppercase tracking-wider py-4">Email</TableHead>
                    <TableHead className="font-bold text-slate-500 text-xs uppercase tracking-wider py-4">SĐT</TableHead>
                    <TableHead className="font-bold text-slate-500 text-xs uppercase tracking-wider py-4 text-center">Vai trò</TableHead>
                    <TableHead className="font-bold text-slate-500 text-xs uppercase tracking-wider py-4 text-center">Trạng thái</TableHead>
                    <TableHead className="font-bold text-slate-500 text-xs uppercase tracking-wider py-4 text-center">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-50">
                  {filtered.length === 0 ? (
                     <TableRow>
                       <TableCell colSpan={8} className="h-48 text-center text-slate-400 font-medium">
                         Không tìm thấy tài khoản nào phù hợp
                       </TableCell>
                     </TableRow>
                  ) : (
                    filtered.map((user, idx) => (
                      <TableRow 
                        key={user.id} 
                        className={`transition-colors cursor-pointer hover:bg-slate-50/80 ${selectedUser?.id === user.id ? 'bg-indigo-50/50' : ''}`}
                        onClick={() => setSelectedUser(user)}
                      >
                        <TableCell className="py-3 font-mono text-xs font-bold text-slate-500">U{String(idx + 1).padStart(3, '0')}</TableCell>
                        <TableCell className="py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0 overflow-hidden">
                               {user.fullName.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-slate-700 text-sm whitespace-nowrap">{user.fullName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 font-medium text-slate-700">{user.username}</TableCell>
                        <TableCell className="py-3 text-slate-500 text-sm">{user.email || "-"}</TableCell>
                        <TableCell className="py-3 font-mono text-slate-600 text-sm">{user.phone || "-"}</TableCell>
                        <TableCell className="py-3 text-center">
                          <Badge variant="outline" className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase border ${ROLE_BADGE[user.role]}`}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3 text-center">
                          <Badge variant="outline" className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase border ${STATUS_BADGE[user.status]}`}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3 text-center">
                          <div className="flex justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                             <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50" onClick={() => setSelectedUser(user)}>
                               <Eye className="w-4 h-4" />
                             </Button>
                             <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-blue-600 hover:bg-blue-50" onClick={() => openEdit(user)}>
                               <Edit className="w-4 h-4" />
                             </Button>
                             <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-amber-600 hover:bg-amber-50" onClick={() => openRole(user)}>
                               <UserCog className="w-4 h-4" />
                             </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
          
          {/* Pagination Placeholder */}
          <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500 bg-slate-50/50 mt-auto">
             <span>Hiển thị {filtered.length > 0 ? 1 : 0} - {filtered.length} trong {filtered.length} kết quả</span>
             {/* Simulating pagination UI from mockup */}
             <div className="flex items-center gap-1">
                <span className="mr-2">10 / trang</span>
                <Button variant="outline" size="icon" className="h-7 w-7 border-slate-200" disabled>&laquo;</Button>
                <Button variant="outline" size="icon" className="h-7 w-7 border-indigo-600 bg-indigo-600 text-white">1</Button>
                <Button variant="outline" size="icon" className="h-7 w-7 border-slate-200 text-slate-600 disabled">&raquo;</Button>
             </div>
          </div>
        </div>

        {/* Right Column (Details & Activities) */}
        <div className="w-full xl:w-[360px] 2xl:w-[400px] shrink-0 flex flex-col gap-6">
          
          {/* Account Details */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col relative overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Chi tiết tài khoản</h3>
              <Maximize2 className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-600" />
            </div>

            {!selectedUser ? (
              <div className="p-10 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                  <UserCheck className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-slate-500 text-sm font-medium">Chọn một tài khoản từ danh sách<br/>để xem thông tin chi tiết</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-5 flex flex-col">
                <div className="flex items-center gap-4 mb-6">
                   <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-black text-xl shrink-0">
                      {selectedUser.fullName.charAt(0).toUpperCase()}
                   </div>
                   <div>
                     <div className="flex items-center gap-2 mb-1">
                       <h2 className="text-lg font-black text-slate-800">{selectedUser.fullName}</h2>
                       <Badge variant="outline" className={`px-1.5 py-0 text-[9px] font-black uppercase border ${ROLE_BADGE[selectedUser.role]}`}>
                         {selectedUser.role}
                       </Badge>
                     </div>
                     <div className="flex items-center gap-2">
                       <span className="font-mono text-sm font-medium text-slate-500">{selectedUser.username}</span>
                       <Badge variant="outline" className={`px-1.5 py-0 text-[9px] font-black uppercase border ${STATUS_BADGE[selectedUser.status]}`}>
                         {selectedUser.status}
                       </Badge>
                     </div>
                   </div>
                </div>

                <div className="space-y-4 mb-8 text-sm">
                  <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                    <div className="flex items-center gap-1.5 text-slate-500 font-medium text-xs">
                       <Mail className="w-3.5 h-3.5" /> Email
                    </div>
                    <div className="font-semibold text-slate-700 truncate">{selectedUser.email || "-"}</div>
                  </div>
                  <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                    <div className="flex items-center gap-1.5 text-slate-500 font-medium text-xs">
                       <Phone className="w-3.5 h-3.5" /> SĐT
                    </div>
                    <div className="font-mono font-medium text-slate-700">{selectedUser.phone || "-"}</div>
                  </div>
                  <div className="grid grid-cols-[100px_1fr] items-start gap-2">
                    <div className="flex items-center gap-1.5 text-slate-500 font-medium text-xs mt-0.5">
                       <FileText className="w-3.5 h-3.5" /> Ghi chú
                    </div>
                    <div className="font-medium text-slate-700 text-xs leading-relaxed">
                      Chưa có ghi chú hệ thống.
                    </div>
                  </div>
                </div>

                <div className="mt-auto space-y-2">
                  <Button variant="default" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 shadow-sm" onClick={() => openEdit(selectedUser)}>
                    <Edit className="w-4 h-4 mr-2" /> Chỉnh sửa
                  </Button>
                  <Button variant="outline" className="w-full border-slate-200 text-slate-700 font-bold hover:bg-slate-50 h-10 shadow-sm" onClick={() => openRole(selectedUser)}>
                    <UserCog className="w-4 h-4 mr-2 text-slate-400" /> Đổi vai trò
                  </Button>
                  <Button variant="outline" className="w-full border-slate-200 text-red-600 font-bold hover:bg-red-50 hover:border-red-200 h-10 shadow-sm" onClick={() => openStatus(selectedUser)}>
                    <Lock className="w-4 h-4 mr-2 text-red-500" /> Khóa tài khoản
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col flex-1 relative overflow-hidden min-h-[300px]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Hoạt động gần đây (API F054)</h3>
            </div>
            
            <div className="p-5 flex-1 overflow-y-auto">
               {!selectedUser ? (
                 <div className="h-full flex flex-col items-center justify-center text-center">
                    <Activity className="w-8 h-8 text-slate-200 mb-2" />
                    <p className="text-xs font-medium text-slate-400">Chọn tài khoản để xem</p>
                 </div>
               ) : isLoadingActivities ? (
                 <div className="h-full flex flex-col items-center justify-center text-center">
                    <RefreshCcw className="w-6 h-6 text-indigo-400 animate-spin mb-2" />
                    <p className="text-xs font-medium text-slate-400">Đang tải...</p>
                 </div>
               ) : recentActivities.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                       <Activity className="w-5 h-5 text-slate-300" />
                    </div>
                    <p className="text-xs font-medium text-slate-400">Chưa có hoạt động nào được ghi nhận.</p>
                 </div>
               ) : (
                 <div className="space-y-4">
                   {recentActivities.map((act, i) => (
                      <div key={i} className="flex gap-3 relative">
                        <div className="w-2 h-full absolute left-[15px] top-6 bg-slate-100 -z-10"></div>
                        <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 z-10 text-slate-500">
                          <Activity className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 pb-2">
                          <p className="text-sm text-slate-700 font-medium leading-snug">{act.action}</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{act.time}</p>
                        </div>
                      </div>
                   ))}
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tạo Người Dùng Mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Field label="Username" name="username" placeholder="vd: staff03" required value={form.username || ""} onChange={setField} error={formErrors.username} />
            <Field label="Họ & Tên" name="fullName" placeholder="Nguyễn Văn A" required value={form.fullName || ""} onChange={setField} error={formErrors.fullName} />
            <Field label="Email" name="email" type="email" placeholder="abc@parking.vn" value={form.email || ""} onChange={setField} error={formErrors.email} />
            <Field label="Điện Thoại" name="phone" placeholder="09xxxxxxxx" value={form.phone || ""} onChange={setField} />
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Vai Trò <span className="text-red-500">*</span></label>
              <Select value={form.role || "STAFF"} onValueChange={(val) => setField("role", val)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Field label="Mật Khẩu" name="password" type="password" placeholder="••••••••" required value={form.password || ""} onChange={setField} error={formErrors.password} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>Hủy</Button>
            <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">Tạo Tài Khoản</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sửa Thông Tin: {selectedUser?.username}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Field label="Họ & Tên" name="fullName" required value={form.fullName || ""} onChange={setField} error={formErrors.fullName} />
            <Field label="Email" name="email" type="email" value={form.email || ""} onChange={setField} error={formErrors.email} />
            <Field label="Điện Thoại" name="phone" value={form.phone || ""} onChange={setField} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>Hủy</Button>
            <Button onClick={handleEdit} className="bg-blue-600 hover:bg-blue-700">Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Modal */}
      <Dialog open={showRoleModal} onOpenChange={setShowRoleModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Đổi Vai Trò: {selectedUser?.username}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="block text-xs font-bold text-slate-600 uppercase mb-3">Vai Trò Mới</label>
            <div className="space-y-2">
              {ROLES.map((r) => (
                <label key={r} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 border border-slate-200 transition">
                  <input type="radio" name="role" value={r} checked={form.role === r} onChange={() => setField("role", r)} className="accent-indigo-600 w-4 h-4"/>
                  <Badge variant="outline" className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase border ${ROLE_BADGE[r]}`}>{r}</Badge>
                </label>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleModal(false)}>Hủy</Button>
            <Button onClick={handleRole} className="bg-indigo-600 hover:bg-indigo-700 text-white">Đổi Vai Trò</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Modal */}
      <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Đổi Trạng Thái: {selectedUser?.username}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="block text-xs font-bold text-slate-600 uppercase mb-3">Trạng Thái Mới</label>
            <div className="space-y-2">
              {STATUSES.map((s) => (
                <label key={s} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 border border-slate-200 transition">
                  <input type="radio" name="status" value={s} checked={form.status === s} onChange={() => setField("status", s)} className="accent-amber-600 w-4 h-4"/>
                  <Badge variant="outline" className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase border ${STATUS_BADGE[s]}`}>{s}</Badge>
                </label>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusModal(false)}>Hủy</Button>
            <Button onClick={handleStatus} className="bg-amber-600 hover:bg-amber-700 text-white">Cập nhật</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
