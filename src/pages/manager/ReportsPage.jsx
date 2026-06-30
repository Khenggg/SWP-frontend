import React, { useCallback, useEffect, useState } from "react";
import { Download, Calendar } from "lucide-react";
import { toast } from "sonner";
import { reportService } from "@/services/reportService";
import { approvalService } from "@/services/approvalService";
import { Button } from "@/components/ui/button";

import ReportStatCards from "@/components/manager/reports/ReportStatCards";
import ReportCharts from "@/components/manager/reports/ReportCharts";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("tong_quan");
  const [isLoading, setIsLoading] = useState(true);

  // States
  const [summary, setSummary] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [occupancy, setOccupancy] = useState([]);
  const [lostCardsPending, setLostCardsPending] = useState(0);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [summaryData, revenueData, occupancyData, lostCases] = await Promise.all([
        reportService.getSummary({}),
        reportService.getRevenue({}),
        reportService.getOccupancy({}),
        approvalService.getLostCardCases()
      ]);
      setSummary(summaryData);
      setRevenue(revenueData);
      setOccupancy(occupancyData);
      setLostCardsPending(lostCases?.filter(c => c.status === "PENDING").length || 0);
    } catch (error) {
      toast.error(error.message || "Không thể tải dữ liệu báo cáo.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExport = async () => {
    try {
      toast.info("Đang xuất báo cáo...");
      const blob = await reportService.exportExcel({});
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `BaoCao_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success("Xuất báo cáo thành công!");
    } catch (error) {
      toast.error("Lỗi xuất báo cáo: " + error.message);
    }
  };

  const tabs = [
    { id: "tong_quan", label: "Tổng quan" },
    { id: "doanh_thu", label: "Doanh thu" },
    { id: "luot_xe", label: "Lượt xe" },
    { id: "the_ve", label: "Thẻ & Vé tháng" },
    { id: "tang_khu", label: "Tầng & Khu vực" },
  ];

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center text-slate-500 font-bold animate-pulse">Đang tải dữ liệu báo cáo...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-2 md:p-6 pb-20 space-y-6 max-w-[1600px] mx-auto">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Báo cáo & Thống kê</h2>
          <p className="text-sm text-slate-500 mt-1">Xem, phân tích và xuất báo cáo hoạt động hệ thống gửi xe</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="bg-white border-slate-200 text-slate-700 font-semibold shadow-sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Xuất báo cáo
          </Button>
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 shadow-sm cursor-pointer hover:bg-slate-50">
            01/06/2026 - 21/06/2026
            <Calendar className="w-4 h-4 text-slate-400 ml-2" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-slate-200 overflow-x-auto no-scrollbar">
        {tabs.map(tab => (
          <div 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-sm font-semibold cursor-pointer whitespace-nowrap transition-colors relative ${
              activeTab === tab.id ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full"></div>
            )}
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      {activeTab === "tong_quan" ? (
        <div className="space-y-6">
          <ReportStatCards summary={summary} lostCardsPending={lostCardsPending} />
          <ReportCharts revenue={revenue} occupancy={occupancy} />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Tính năng đang được phát triển</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            Chi tiết báo cáo cho mục <span className="font-semibold text-blue-600">"{tabs.find(t => t.id === activeTab)?.label}"</span> hiện đang trong quá trình xây dựng và sẽ sớm ra mắt trong phiên bản tiếp theo.
          </p>
          <Button variant="outline" className="mt-6" onClick={() => setActiveTab("tong_quan")}>
            Quay lại Tổng quan
          </Button>
        </div>
      )}
    </div>
  );
}
