import { SkillRadarChart } from './components/SkillRadarChart';
import { Logs } from './components/Logs';
import { Github, User, Activity, ExternalLink } from 'lucide-react';

function App() {
  const identity = {
    name: "Kenjiro Hirose",
    role: "SECURITY ENGINEER / SOC ANALYST",
    status: "ACTIVE"
  };

  const links = [
    { name: 'Github', icon: <Github size={14} />, url: 'https://github.com/Kenjiro56' },
    { name: 'Zenn', icon: <ExternalLink size={14} />, url: 'https://zenn.dev/jiroken' },
    { name: 'Qiita', icon: <ExternalLink size={14} />, url: 'https://qiita.com/Jiroken' },
  ];

  return (
    <div className="h-screen w-screen flex flex-col bg-black text-[#00FF41] font-mono overflow-hidden">
      
      {/* HEADER: システム情報のサマリー */}
      <header className="px-6 py-2 border-b border-[#00FF41]/20 flex justify-between items-center bg-black">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Activity size={16} className="animate-pulse" />
            <span className="text-[10px] tracking-[0.2em] opacity-80">SOC_OPERATOR_SYSTEM_V1.1</span>
          </div>
          <div className="hidden sm:block h-4 w-[1px] bg-[#00FF41]/20"></div>
          <span className="text-[10px] opacity-40 uppercase hidden sm:block">Location: Tokyo_JPN</span>
        </div>
        <div className="text-[10px] font-bold">
          {new Date().toLocaleTimeString()}
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row min-h-0">
        
        {/* LEFT PANEL: IDENTITY & NAV */}
        <aside className="w-full md:w-[320px] border-r border-[#00FF41]/20 flex flex-col p-8 overflow-y-auto">
          
          {/* 名前とロール */}
          <section className="mb-10">
            <h1 className="text-3xl font-black tracking-tighter text-white mb-2 leading-none">
              {identity.name}
            </h1>
            <p className="text-[11px] font-bold border-l-2 border-[#00FF41] pl-3 py-1 opacity-90 leading-relaxed">
              {identity.role}
            </p>
          </section>

          {/* 外部リンク: 縦並び構成 */}
          <section className="mb-10">
            <div className="text-[9px] tracking-widest opacity-40 uppercase mb-4">External_Nodes</div>
            <nav className="flex flex-col gap-2">
              {links.map((link) => (
                <a 
                  key={link.name} 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 border border-[#00FF41]/30 bg-black hover:bg-[#00FF41] hover:text-black transition-all group"
                >
                  <div className="flex items-center gap-3">
                    {link.icon}
                    <span className="text-xs font-bold tracking-widest">{link.name}</span>
                  </div>
                </a>
              ))}
            </nav>
          </section>

          {/* 技術スタック */}
          <section>
            <div className="text-[9px] tracking-widest opacity-40 uppercase mb-4">Skill_Calibration</div>
            <div className="p-2 border border-[#00FF41]/10">
              <SkillRadarChart />
            </div>
          </section>
        </aside>

        {/* RIGHT PANEL: LOGS */}
        <section className="flex-1 flex flex-col min-h-0 bg-black">
          <Logs />
        </section>
      </main>

      {/* FOOTER */}
      <footer className="px-6 py-2 border-t border-[#00FF41]/20 text-[9px] opacity-30 flex justify-between bg-black">
        <span>SECURITY_LEVEL: 04 // ACCESS_GRANTED</span>
        <span>© Kenjiro Hirose</span>
      </footer>
    </div>
  );
}

export default App;