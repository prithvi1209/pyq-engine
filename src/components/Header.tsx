import { Flame, Bell, User } from "lucide-react";

export default function Header() {
  return (
    <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-red-100 px-4 py-3 flex justify-between items-center shadow-sm">
      <div className="group cursor-pointer">
        <h1 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest group-hover:text-red-600 transition-colors">
          Prelims 2026
        </h1>
        <h2 className="text-slate-900 font-black text-lg group-hover:text-red-600 transition-colors">
          UPSC.BRAIN
        </h2>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <Flame size={16} className="text-red-600 fill-red-600" />
          <span className="text-red-900 font-bold text-sm">0</span>
        </div>
        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-slate-200 hover:border-red-500 hover:text-red-600 transition-all cursor-pointer">
          <User size={16} className="text-slate-600" />
        </div>
      </div>
    </div>
  );
}
