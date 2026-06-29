import React, { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart3, CarFront, Download, Gauge, RefreshCw, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { reportService } from "@/services/reportService";
import { formatVND } from "@/lib/format";
import { PageHeader, PageShell, MetricCard } from "@/components/layout/PageScaffold";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const INITIAL_DATE_RANGE = {
  from: "2026-06-10",
  to: "2026-06-16",
};

function formatAxisVND(value) {
  const number = Number(value || 0);
  if (number >= 1000000) return `${Number((number / 1000000).toFixed(1))}tr`;
  if (number >= 1000) return `${Math.round(number / 1000)}k`;
  return `${number}`;
}

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState(INITIAL_DATE_RANGE);
  const [summary, setSummary] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [traffic, setTraffic] = useState([]);
  const [occupancy, setOccupancy] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = { from: dateRange.from, to: dateRange.to };
      const [summaryData, revenueData, trafficData, occupancyData] = await Promise.all([
        reportService.getSummary(params),
        reportService.getRevenue(params),
        reportService.getTraffic(params),
        reportService.getOccupancy(params),
      ]);
      setSummary(summaryData);
      setRevenue(revenueData);
      setTraffic(trafficData);
      setOccupancy(occupancyData);
    } catch (error) {
      toast.error(error.message || "Không thể tải báo cáo.");
    } finally {
      setIsLoading(false);
    }
  }, [dateRange.from, dateRange.to]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const csvRows = useMemo(() => {
    const rows = [["Loai", "Nhan", "Gia tri 1", "Gia tri 2"]];
    revenue.forEach((item) => rows.push(["Doanh thu", item.label, item.revenue, ""]));
    traffic.forEach((item) => rows.push(["Luu luong", item.label, item.entry, item.exit]));
    occupancy.forEach((item) => rows.push(["Lap day", item.label, item.occupancy, ""]));
    return rows;
  }, [revenue, traffic, occupancy]);

  const exportCsv = () => {
    const csv = csvRows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `parking-report-${dateRange.from}-${dateRange.to}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Đã xuất CSV báo cáo.");
  };

  const stats = [
    {
      label: "Doanh thu hôm nay",
      value: formatVND(summary?.revenueToday),
      sub: `+${summary?.revenueDelta || 0}% so với kỳ trước`,
      icon: TrendingUp,
      tone: "success",
    },
    {
      label: "Lượt xe vào",
      value: summary?.entriesToday || 0,
      sub: "Entry lane",
      icon: CarFront,
      tone: "info",
    },
    {
      label: "Lượt xe ra",
      value: summary?.exitsToday || 0,
      sub: "Exit lane",
      icon: BarChart3,
      tone: "default",
    },
    {
      label: "Mật độ lấp đầy",
      value: `${summary?.occupancyRate || 0}%`,
      sub: `${summary?.activeSessions || 0} phiên active`,
      icon: Gauge,
      tone: "warning",
    },
  ];

  return (
    <PageShell>
      <PageHeader
        eyebrow="Manager · Sprint 5"
        title="Báo cáo & thống kê"
        description="Theo dõi doanh thu, lưu lượng xe và mật độ lấp đầy bằng cùng một bố cục dữ liệu, sẵn sàng xuất CSV cho Excel."
        icon={BarChart3}
        actions={
          <>
            <Button variant="outline" onClick={loadReports} disabled={isLoading}>
              <RefreshCw data-icon="inline-start" />
              Tải lại
            </Button>
            <Button onClick={exportCsv}>
              <Download data-icon="inline-start" />
              Xuất CSV
            </Button>
          </>
        }
      />

      <Card className="app-card">
        <CardHeader>
          <CardTitle>Bộ lọc thời gian</CardTitle>
          <CardDescription>Khoảng ngày áp dụng cho dữ liệu báo cáo và file CSV.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <label className="flex flex-col gap-1.5">
              <span className="app-field-label">Từ ngày</span>
              <Input
                type="date"
                name="report-from"
                autoComplete="off"
                value={dateRange.from}
                onChange={(event) => setDateRange((current) => ({ ...current, from: event.target.value }))}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="app-field-label">Đến ngày</span>
              <Input
                type="date"
                name="report-to"
                autoComplete="off"
                value={dateRange.to}
                onChange={(event) => setDateRange((current) => ({ ...current, to: event.target.value }))}
              />
            </label>
            <div className="flex items-end">
              <Button variant="outline" onClick={loadReports} disabled={isLoading} className="w-full md:w-auto">
                Áp dụng
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <MetricCard key={item.label} {...item} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Doanh thu theo ngày" description="Tổng tiền đã thu theo từng ngày">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenue}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} tickFormatter={formatAxisVND} width={48} />
              <Tooltip formatter={(value) => formatVND(value)} />
              <Area type="monotone" dataKey="revenue" stroke="var(--chart-1)" fill="var(--accent)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Lưu lượng xe" description="So sánh xe vào và xe ra theo khung giờ">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={traffic}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="entry" name="Xe vào" stroke="var(--chart-1)" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="exit" name="Xe ra" stroke="var(--chart-3)" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Mật độ lấp đầy theo khu" description="Tỷ lệ sử dụng từng khu trong bãi">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={occupancy}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip formatter={(value) => `${value}%`} />
            <Bar dataKey="occupancy" name="Lấp đầy" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </PageShell>
  );
}

function ChartCard({ title, description, children }) {
  return (
    <Card className="app-card">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
