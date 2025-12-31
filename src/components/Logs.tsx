import { useRSS } from '../hooks/useRSS';

export const Logs = () => {
  const { logs, loading } = useRSS('jiroken', 'Jiroken'); 

  return (
    <div className="flex-1 min-h-0 overflow-hidden flex flex-col p-6 border border-[#00FF41] bg-black shadow-[0_0_15px_rgba(0,255,65,0.1)]">
      <div className="flex justify-between items-center mb-4 border-b border-[#00FF41]/30 pb-2">
        <h2 className="text-xs font-bold tracking-[0.4em]">[ SYSTEM_LOG ]</h2>
        {loading && <span className="text-[10px] animate-pulse">LOADING...</span>}
      </div>
      
      <div className="overflow-y-auto pr-2 custom-scrollbar">
        {logs.length === 0 && !loading ? (
          <div className="text-sm opacity-40 italic">No log entries found.</div>
        ) : (
          logs.map((log) => (
            <a 
              key={log.id} 
              href={log.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group block w-full py-3 border-b border-[#00FF41]/10 hover:bg-[#00FF41]/5 transition-all"
            >
              {/* メタデータ行：日付とソース */}
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[10px] opacity-40 font-mono">
                  {log.date}
                </span>
                <span className="text-[9px] px-1 border border-[#00FF41]/40 opacity-70 group-hover:opacity-100 group-hover:bg-[#00FF41] group-hover:text-black transition-all">
                  {log.source}
                </span>
              </div>
              
              {/* タイトル行：ここで「改行」されて表示されるイメージ */}
              <div className="text-[14px] leading-relaxed group-hover:text-white transition-colors">
                <span className="mr-2 opacity-50 font-mono">{`>`}</span>
                {log.title}
              </div>
            </a>
          ))
        )}
        
        {/* 末尾のカーソル演出 */}
        <div className="text-[12px] py-4 opacity-40 font-mono">
          {`[SYSTEM] LOG_FETCH_COMPLETE`}
          <br />
          {`> WAITING...`}<span className="cursor-blink">_</span>
        </div>
      </div>
    </div>
  );
};