import React from "react";
import bgImage from "@/assets/parking_bg.png";

export default function AuthSplitLayout({ 
  title, 
  subtitle, 
  heroDescription, 
  featureItems, 
  children 
}) {
  return (
    <div className="flex w-full min-h-[calc(100vh-64px)] font-sans">
      {/* LEFT SECTION - Image & Branding */}
      <div className="hidden lg:flex w-1/2 relative bg-blue-900 text-white overflow-hidden">
        {/* Background Image with Dark Blue Overlay */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-blue-950/85"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 py-12 w-full h-full">
          <p className="text-xl text-blue-100 mb-2">{title}</p>
          <h1 className="text-5xl font-black mb-2 tracking-tight">
            SWP BUILDING
          </h1>
          <h2 className="text-3xl font-black text-blue-400 mb-6 uppercase tracking-wide">
            Smart Parking
          </h2>
          <p className="text-blue-100/80 text-base mb-12 max-w-md leading-relaxed">
            {heroDescription}
          </p>

          {/* Features */}
          <div className="space-y-6">
            {featureItems.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 font-bold text-white">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm mb-1">{feature.title}</h3>
                  <p className="text-xs text-blue-200/70">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT SECTION - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 sm:p-10">
          {children}
        </div>
      </div>
    </div>
  );
}
