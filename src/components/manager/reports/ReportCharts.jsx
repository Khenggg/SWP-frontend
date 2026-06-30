import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatVND } from "@/lib/format";
import {
  LineChart, Line, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#f43f5e'];

export default function ReportCharts({ revenue, occupancy }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Revenue Chart */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-2 border-b border-slate-100 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold text-slate-800">Doanh thu theo ngày (VNĐ)</CardTitle>
          <select className="text-xs font-medium text-slate-500 bg-transparent border-none outline-none">
            <option>Theo ngày</option>
            <option>Theo tuần</option>
          </select>
        </CardHeader>
        <CardContent className="pt-4 h-[250px]">
          {revenue && revenue.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenue} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `${v / 1000000}M`} />
                <Tooltip formatter={(value) => formatVND(value)} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ r: 3, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-slate-400 font-medium">Chưa có dữ liệu</div>
          )}
        </CardContent>
      </Card>

      {/* Occupancy Chart */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-2 border-b border-slate-100 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold text-slate-800">Tỷ lệ lấp đầy theo tầng (TB %)</CardTitle>
          <select className="text-xs font-medium text-slate-500 bg-transparent border-none outline-none">
            <option>Theo tầng</option>
            <option>Theo khu vực</option>
          </select>
        </CardHeader>
        <CardContent className="pt-4 h-[250px]">
          {occupancy && occupancy.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={occupancy} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(val) => `${val}%`} />
                <Tooltip formatter={(val) => [`${val}%`, 'Lấp đầy']} cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="occupancy" radius={[4, 4, 0, 0]}>
                   {occupancy.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-slate-400 font-medium">Chưa có dữ liệu</div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
