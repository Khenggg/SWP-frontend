import React, { useState } from "react";
import { STATIC_RULES } from "@/mocks/mockData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RulesPage() {
  const [openSection, setOpenSection] = useState("entry");
  const [searchText, setSearchText] = useState("");

  const filteredRules = STATIC_RULES.map((section) => ({
    ...section,
    items: searchText.trim()
      ? section.items.filter((item) =>
          item.toLowerCase().includes(searchText.toLowerCase())
        )
      : section.items,
  })).filter((section) => !searchText.trim() || section.items.length > 0);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-600 to-amber-800 text-white">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <h1 className="text-3xl font-black mb-2">Nội Quy Bãi Đỗ Xe</h1>
          <p className="text-amber-200 text-sm">
            Vui lòng đọc kỹ các quy định trước khi sử dụng dịch vụ.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Search */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm select-none">🔍</span>
          <Input
            type="text"
            placeholder="Tìm kiếm quy định..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 bg-white"
          />
          {searchText && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchText("")}
              className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 h-8 w-8"
            >
              ×
            </Button>
          )}
        </div>

        {/* Accordion */}
        {filteredRules.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-semibold">Không tìm thấy quy định phù hợp</p>
            <p className="text-sm mt-1">Thử từ khóa khác</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRules.map((section) => {
              const isOpen = openSection === section.id || !!searchText;
              return (
                <Card
                  key={section.id}
                  className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setOpenSection(isOpen && !searchText ? null : section.id)
                    }
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl select-none">{section.icon}</span>
                      <span className="font-bold text-slate-800 text-sm">
                        {section.title}
                      </span>
                      <Badge variant="outline" className="text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full border-amber-200">
                        {section.items.length} quy định
                      </Badge>
                    </div>
                    {!searchText && (
                      <span className={`text-slate-400 text-lg transition-transform ${isOpen ? "rotate-180" : ""}`}>
                        ▾
                      </span>
                    )}
                  </button>

                  {(isOpen) && (
                    <div className="border-t border-slate-100 px-5 py-4 bg-slate-50">
                      <ul className="space-y-2">
                        {section.items.map((item, idx) => (
                          <li key={idx} className="flex gap-3 text-sm text-slate-700">
                            <span className="text-amber-500 font-black mt-0.5 shrink-0">
                              {idx + 1}.
                            </span>
                            <span
                              dangerouslySetInnerHTML={{
                                __html: searchText
                                  ? item.replace(
                                      new RegExp(`(${searchText})`, "gi"),
                                      '<mark class="bg-amber-200 rounded px-0.5">$1</mark>'
                                    )
                                  : item,
                              }}
                            />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* Footer note */}
        <p className="text-center text-xs text-slate-400 pb-6">
          Nội quy có hiệu lực từ 01/01/2026. Liên hệ hotline{" "}
          <strong className="text-amber-600">1800 1234</strong> để được hỗ trợ.
        </p>
      </div>
    </div>
  );
}
