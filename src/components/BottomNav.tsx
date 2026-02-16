import { Home, Newspaper, Sparkles, BookOpen, PenTool } from "lucide-react";

export default function BottomNav() {
  return (
    <div className="fixed bottom-0 w-full bg-white border-t border-red-100 pb-8 pt-2 px-6 z-50 shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.05)]">
      <div className="flex justify-between items-center max-w-md mx-auto">
        <NavItem icon={<Home size={22} />} label="Home" active />
        <NavItem icon={<Newspaper size={22} />} label="News" />
        <div className="flex flex-col items-center gap-1 -mt-10 cursor-pointer group">
          <div className="bg-red-600 p-4 rounded-2xl shadow-lg shadow-red-600/30 transform group-hover:-translate-y-1 transition-all border-4 border-white">
            <Sparkles
              size={24}
              className="text-white fill-white animate-pulse"
            />
          </div>
          <span className="text-[10px] text-red-600 font-bold uppercase tracking-wide">
            Ask AI
          </span>
        </div>
        <NavItem icon={<BookOpen size={22} />} label="Prelims" />
        <NavItem icon={<PenTool size={22} />} label="Mains" />
      </div>
    </div>
  );
}

function NavItem({
  icon,
  label,
  active = false,
}: {
  icon: any;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-1 cursor-pointer group ${
        active ? "text-red-600" : "text-slate-400"
      }`}
    >
      <div className="group-hover:text-red-500 transition-transform">
        {icon}
      </div>
      <span className="text-[10px] font-bold group-hover:text-red-500">
        {label}
      </span>
    </div>
  );
}
