"use client";
import React from "react";
import AIChat from "@/components/AIChat.jsx";
import SOSButton from "@/components/SOSButton.jsx";



export default function AIChatPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 flex flex-col items-center justify-center gap-6 max-w-md mx-auto">
      <div className="text-center w-full border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-blue-500 flex items-center justify-center gap-2">
          🤖 Zenith AI Chat
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          24/7 AI-Powered Support Companion
        </p>
      </div>

      {/* Main AI Chat Box Component */}
      <div className="w-full flex-1 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden min-h-[400px] flex flex-col">
        <AIChat />
      </div>

      {/* Emergency Trigger Button */}
      <div className="w-full bg-slate-800 p-4 rounded-xl border border-slate-700 text-center">
        <p className="text-xs text-slate-400 mb-2">
          Need immediate official crisis assistance?
        </p>
        <SOSButton />
      </div>
    </div>
  );
}

