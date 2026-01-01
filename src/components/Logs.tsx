import { useRSS } from '../hooks/useRSS';

export const Logs = () => {
  const { logs, loading } = useRSS('jiroken', 'Jiroken'); 

  if (loading) return <div className="animate-pulse">LOADING_DATA_PACKETS...</div>;

  return (
    <div className="flex flex-col gap-2">
      {logs.map((log) => (
        <>
          <a 
            key={log.id} 
            href={log.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="group block hover:bg-[#00FF00] hover:text-black px-2 transition-colors whitespace-nowrap overflow-hidden text-ellipsis"
          >
            <span className="mr-4 text-sm opacity-70">[{log.date}]</span>
            <span className="mr-4 text-sm font-bold">[{log.source}]</span>
            <span>{log.title}</span>
          </a>
          <br/>
        </>
      ))}
    </div>
  );
};