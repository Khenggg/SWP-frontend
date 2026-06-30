import React, { useState } from "react";
import { List, Search, ChevronDown, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import EmptyState from "@/components/ui/empty-state";

// ─── STATIC RULES DATA ────────────────────────────────────────────────────────
const STATIC_RULES = [
  {
    id: "entry",
    title: "Quy Định Vào Bãi",
    icon: "→",
    items: [
      "Quý khách vui lòng dừng xe đúng vạch quy định để camera nhận dạng biển số.",
      "Nhận vé xe (thẻ từ) từ nhân viên hoặc máy phát tự động trước khi vào bãi.",
      "Tuyệt đối không mang chất cháy nổ, vũ khí hoặc hàng hóa cấm vào bãi gửi xe.",
      "Đối với xe ô tô, vui lòng hạ kính xe để nhân viên kiểm tra (nếu có yêu cầu).",
    ],
  },
  {
    id: "parking",
    title: "Quy Định Đỗ Xe",
    icon: "🅿️",
    items: [
      "Đỗ xe đúng trong vạch kẻ quy định của từng ô đỗ, không lấn vạch.",
      "Đỗ đúng khu vực dành riêng cho từng loại xe (xe máy, ô tô, xe điện).",
      "Tắt máy, khóa xe cẩn thận và tự bảo quản tư trang, tài sản cá nhân có giá trị.",
      "Nghiêm cấm vứt rác bừa bãi, hút thuốc hoặc gây mất vệ sinh khu vực bãi xe.",
    ],
  },
  {
    id: "exit",
    title: "Quy Định Ra Bãi",
    icon: "←",
    items: [
      "Giao lại vé xe (thẻ từ) cho nhân viên soát vé tại cổng ra.",
      "Thanh toán đầy đủ phí gửi xe theo bảng giá quy định trước khi rời đi.",
      "Biển số xe ra phải trùng khớp hoàn toàn với biển số xe lúc vào.",
      "Trong trường hợp hệ thống không nhận diện được, quý khách vui lòng hợp tác với nhân viên kiểm tra.",
    ],
  },
  {
    id: "lost_card",
    title: "Mất Thẻ & Sự Cố",
    icon: "⚠",
    items: [
      "Nếu làm mất thẻ/vé, quý khách phải lập tức thông báo cho ban quản lý bãi xe.",
      "Cần xuất trình Giấy đăng ký xe (Cà vẹt) và CCCD/CMND để xác minh sở hữu xe.",
      "Phí làm mất thẻ/vé sẽ được thu theo quy định hiện hành của bãi xe.",
      "Thời gian giải quyết xe mất thẻ có thể kéo dài để đảm bảo an ninh, mong quý khách thông cảm.",
    ],
  },
  {
    id: "monthly_pass",
    title: "Khách Hàng Vé Tháng",
    icon: "📋",
    items: [
      "Thẻ vé tháng chỉ có giá trị sử dụng cho đúng 01 xe đã đăng ký biển số.",
      "Vui lòng đóng phí gia hạn trước ngày mùng 5 hàng tháng để thẻ không bị khóa.",
      "Không tự ý cho mượn thẻ vé tháng dưới bất kỳ hình thức nào.",
    ],
  },
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function RulesPage() {
  const [openSection, setOpenSection] = useState("entry");
  const [searchText, setSearchText]   = useState("");

  const filteredRules = STATIC_RULES
    .map(s => ({
      ...s,
      items: searchText.trim()
        ? s.items.filter(item => item.toLowerCase().includes(searchText.toLowerCase()))
        : s.items,
    }))
    .filter(s => !searchText.trim() || s.items.length > 0);

  return (
    <div className="bg-gray-50 min-h-full">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <List size={20} className="text-blue-600" />
            </div>
            <h1 className="text-2xl font-black text-gray-900">Nội Quy Bãi Xe</h1>
          </div>
          <p className="text-gray-500 text-sm">
            Vui lòng tuân thủ các quy định dưới đây để đảm bảo an toàn và trật tự cho bãi đỗ xe.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-5">
        {/* Search */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 z-10">
            <Search size={15} />
          </span>
          <Input
            type="text"
            placeholder="Tìm kiếm quy định..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-10 pr-10 py-6 rounded-xl border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 focus-visible:ring-2 focus-visible:ring-blue-500 shadow-sm"
          />
          {searchText && (
            <button 
              onClick={() => setSearchText("")} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center text-xs z-10"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Content */}
        {filteredRules.length === 0 ? (
          <EmptyState 
            icon={<Search size={36} />} 
            title="Không tìm thấy quy định" 
            description="Thử sử dụng từ khóa ngắn gọn hơn." 
          />
        ) : (
          <div className="space-y-3">
            {filteredRules.map((section) => {
              const isOpen = openSection === section.id || !!searchText;
              return (
                <div key={section.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${isOpen ? "border-blue-200" : "border-gray-100"}`}>
                  <button
                    onClick={() => setOpenSection(isOpen && !searchText ? null : section.id)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black transition-colors ${isOpen ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600"}`}>
                        {section.icon}
                      </div>
                      <div>
                        <span className={`font-bold text-sm ${isOpen ? "text-blue-700" : "text-gray-800"}`}>{section.title}</span>
                        <span className="block text-xs text-gray-400">{section.items.length} quy định</span>
                      </div>
                    </div>
                    {!searchText && (
                      <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    )}
                  </button>

                  <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: isOpen ? "1000px" : "0px" }}>
                    <div className="border-t border-gray-100 px-5 py-4 bg-blue-50/30">
                      <ul className="space-y-3">
                        {section.items.map((item, idx) => (
                          <li key={idx} className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center">{idx + 1}</span>
                            <span
                              className="text-sm text-gray-700 leading-relaxed mt-0.5"
                              dangerouslySetInnerHTML={{
                                __html: searchText
                                  ? item.replace(new RegExp(`(${searchText})`, "gi"), '<mark class="bg-yellow-200 text-yellow-900 rounded px-0.5">$1</mark>')
                                  : item,
                              }}
                            />
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer note */}
        <div className="text-center pt-4 pb-4">
          <p className="text-xs text-gray-400">
            Nội quy có hiệu lực từ 01/01/2026. Liên hệ hotline <strong className="text-blue-600">1900 1234</strong> để được hỗ trợ.
          </p>
        </div>
      </div>
    </div>
  );
}
