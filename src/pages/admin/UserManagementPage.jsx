import React, { useState, useEffect } from "react";
import { userService } from "../../services/userService";
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

import { USER_ROLES, USER_STATUS } from "@/constants";

const ROLE_BADGE = {
  [USER_ROLES.ADMIN]: "bg-red-100 text-red-700 border border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
  [USER_ROLES.MANAGER]: "bg-purple-100 text-purple-700 border border-purple-300 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800",
  [USER_ROLES.STAFF]: "bg-blue-100 text-blue-700 border border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  [USER_ROLES.DRIVER]: "bg-slate-100 text-slate-600 border border-slate-300 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800",
};

const STATUS_BADGE = {
  [USER_STATUS.ACTIVE]: "bg-emerald-100 text-emerald-700 border border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
  [USER_STATUS.LOCKED]: "bg-red-100 text-red-700 border border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
  [USER_STATUS.INACTIVE]: "bg-slate-100 text-slate-500 border border-slate-300 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800",
};

const ROLES = Object.values(USER_ROLES);
const STATUSES = Object.values(USER_STATUS);

const EMPTY_FORM = { username: "", fullName: "", email: "", phone: "", role: USER_ROLES.STAFF, password: "" };

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterRole, setFilterRole] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchText, setSearchText] = useState("");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
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

  const filtered = users.filter((u) => {
    const matchRole = filterRole === "ALL" || u.role === filterRole;
    const matchStatus = filterStatus === "ALL" || u.status === filterStatus;
    const matchSearch = !searchText || u.username.includes(searchText) || u.fullName.toLowerCase().includes(searchText.toLowerCase());
    return matchRole && matchStatus && matchSearch;
  });

  // Validate
  const validate = (data, isCreate) => {
    const errs = {};
    if (!data.fullName?.trim()) errs.fullName = "Bắt buộc";
    if (isCreate && !data.username?.trim()) errs.username = "Bắt buộc";
    if (isCreate && !data.password?.trim()) errs.password = "Bắt buộc";
    if (!data.role) errs.role = "Bắt buộc";
    if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) errs.email = "Email không hợp lệ";
    return errs;
  };

  // Create
  const handleCreate = async () => {
    const errs = validate(form, true);
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    try {
      const newUser = await userService.addUser(form);
      setUsers((prev) => [...prev, newUser]);
      setShowCreateModal(false);
      setForm(EMPTY_FORM);
      setFormErrors({});
      toast.success("Tạo người dùng thành công!");
    } catch (err) {
      toast.error(err.message || "Tạo người dùng thất bại");
    }
  };

  // Edit
  const openEdit = (user) => { setSelectedUser(user); setForm({ fullName: user.fullName, email: user.email, phone: user.phone, role: user.role }); setFormErrors({}); setShowEditModal(true); };
  const handleEdit = async () => {
    const errs = validate(form, false);
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    try {
      const updated = await userService.updateUser(selectedUser.id, form);
      setUsers((prev) => prev.map((u) => u.id === selectedUser.id ? updated : u));
      setShowEditModal(false);
      toast.success("Cập nhật thông tin thành công!");
    } catch (err) {
      toast.error(err.message || "Cập nhật thất bại");
    }
  };

  // Change role
  const openRole = (user) => { setSelectedUser(user); setForm({ role: user.role }); setFormErrors({}); setShowRoleModal(true); };
  const handleRole = async () => {
    try {
      const updated = await userService.updateUserRole(selectedUser.id, form.role);
      setUsers((prev) => prev.map((u) => u.id === selectedUser.id ? updated : u));
      setShowRoleModal(false);
      toast.success(`Đã đổi vai trò thành ${form.role}`);
    } catch (err) {
      toast.error(err.message || "Đổi vai trò thất bại");
    }
  };

  // Change status
  const openStatus = (user) => { setSelectedUser(user); setForm({ status: user.status }); setShowStatusModal(true); };
  const handleStatus = async () => {
    try {
      const updated = await userService.updateUserStatus(selectedUser.id, form.status);
      setUsers((prev) => prev.map((u) => u.id === selectedUser.id ? updated : u));
      setShowStatusModal(false);
      toast.success(`Đã cập nhật trạng thái thành ${form.status}`);
    } catch (err) {
      toast.error(err.message || "Cập nhật trạng thái thất bại");
    }
  };

  const setField = (name, value) => setForm((p) => ({ ...p, [name]: value }));

  const Field = ({ label, name, type = "text", placeholder, required, value, onChange, error }) => (
    <div className="space-y-1">
      <label className="block text-xs font-bold text-slate-600 uppercase">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
      <Input type={type} value={value} onChange={(e) => onChange(name, e.target.value)} placeholder={placeholder}
        className={error ? "border-red-400 bg-red-50 focus-visible:ring-red-400" : ""}
      />
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800">Quản Lý Người Dùng</h2>
          <p className="text-sm text-slate-500 mt-0.5">Quản lý tài khoản nội bộ: Admin, Manager, Staff</p>
        </div>
        <Button onClick={() => { setForm(EMPTY_FORM); setFormErrors({}); setShowCreateModal(true); }}>
          + Tạo người dùng
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center bg-white rounded-xl border border-slate-200 px-5 py-3 shadow-sm">
        <Input 
          type="text" 
          placeholder="🔍 Tìm username, họ tên..." 
          value={searchText} 
          onChange={(e) => setSearchText(e.target.value)}
          className="max-w-[240px]" 
        />
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tất cả vai trò" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả vai trò</SelectItem>
            {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tất cả trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="text-xs text-slate-400 ml-auto">{filtered.length} người dùng</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3 animate-pulse">{[1,2,3].map(i => <div key={i} className="h-12 bg-slate-100 rounded"/>)}</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400"><p className="text-4xl mb-3">👤</p><p className="font-semibold">Không có người dùng phù hợp</p></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-wider">
                <TableHead className="px-5 py-3 text-left">Username</TableHead>
                <TableHead className="px-5 py-3 text-left">Họ & Tên</TableHead>
                <TableHead className="px-5 py-3 text-left">Email</TableHead>
                <TableHead className="px-5 py-3 text-left">Điện Thoại</TableHead>
                <TableHead className="px-5 py-3 text-center">Vai Trò</TableHead>
                <TableHead className="px-5 py-3 text-center">Trạng Thái</TableHead>
                <TableHead className="px-5 py-3 text-center">Thao Tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {filtered.map((user) => (
                <TableRow key={user.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="px-5 py-3 font-mono font-bold text-slate-800">{user.username}</TableCell>
                  <TableCell className="px-5 py-3 font-semibold text-slate-700">{user.fullName}</TableCell>
                  <TableCell className="px-5 py-3 text-slate-500">{user.email || "—"}</TableCell>
                  <TableCell className="px-5 py-3 text-slate-500">{user.phone || "—"}</TableCell>
                  <TableCell className="px-5 py-3 text-center">
                    <Badge variant="outline" className={`px-2 py-0.5 rounded-full text-xs font-black border ${ROLE_BADGE[user.role]}`}>{user.role}</Badge>
                  </TableCell>
                  <TableCell className="px-5 py-3 text-center">
                    <Badge variant="outline" className={`px-2 py-0.5 rounded-full text-xs font-black border ${STATUS_BADGE[user.status]}`}>{user.status}</Badge>
                  </TableCell>
                  <TableCell className="px-5 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(user)} className="text-xs font-bold text-blue-600 hover:text-blue-700">Sửa</Button>
                      <Button variant="ghost" size="sm" onClick={() => openRole(user)} className="text-xs font-bold text-purple-600 hover:text-purple-700">Vai Trò</Button>
                      <Button variant="ghost" size="sm" onClick={() => openStatus(user)} className="text-xs font-bold text-amber-600 hover:text-amber-700">Trạng Thái</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
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
              <label className="block text-xs font-bold text-slate-600 uppercase">Vai Trò <span className="text-red-500">*</span></label>
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
            <Button onClick={handleCreate}>Tạo Tài Khoản</Button>
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
            <Button onClick={handleEdit}>Lưu</Button>
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
            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Vai Trò Mới</label>
            <div className="space-y-2">
              {ROLES.map((r) => (
                <label key={r} className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-slate-50 border border-transparent hover:border-slate-200 transition">
                  <input type="radio" name="role" value={r} checked={form.role === r} onChange={() => setField("role", r)} className="accent-purple-600"/>
                  <Badge variant="outline" className={`px-2 py-0.5 rounded-full text-xs font-black border ${ROLE_BADGE[r]}`}>{r}</Badge>
                </label>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleModal(false)}>Hủy</Button>
            <Button onClick={handleRole} className="bg-purple-600 hover:bg-purple-700 text-white">Đổi Vai Trò</Button>
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
            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Trạng Thái Mới</label>
            <div className="space-y-2">
              {STATUSES.map((s) => (
                <label key={s} className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-slate-50 border border-transparent hover:border-slate-200 transition">
                  <input type="radio" name="status" value={s} checked={form.status === s} onChange={() => setField("status", s)} className="accent-amber-600"/>
                  <Badge variant="outline" className={`px-2 py-0.5 rounded-full text-xs font-black border ${STATUS_BADGE[s]}`}>{s}</Badge>
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
