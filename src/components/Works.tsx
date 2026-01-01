

export const Works = () => {
//   const projects = [
//     {
//       date: "2026.Q1",
//       tech: "GO/LLM",
//       title: "STATIC_ANALYSIS_AGENT",
//       status: "IN_PROGRESS...",
//       isActive: true
//     },
//     {
//       date: "2026.Q1",
//       tech: "TS/REACT",
//       title: "PERSONAL_PORTFOLIO_V1.4",
//       status: "STABLE/DEPLOYED",
//       isActive: false
//     },
//     {
//       date: "2026.Q2",
//       tech: "RUST",
//       title: "EXPERIMENTAL_SECURITY_TOOL",
//       status: "INITIALIZING...",
//       isActive: false
//     }
//   ];

  return (
    <div className="flex flex-col gap-2 items-start font-mono">
      {/* {projects.map((project, index) => (
        <div key={index} className="px-2 group w-fit hover:bg-[#00FF00] hover:text-black transition-colors">
          <span className="mr-4 text-sm opacity-70">[{project.date}]</span>
          <span className="mr-4 text-sm font-bold text-[#FFEF00] group-hover:text-black">
            [{project.tech}]
          </span>
          <span className="mr-2">{project.title}</span>
          <span className={`text-xs opacity-50 ${project.isActive ? 'animate-pulse' : ''}`}>
            -- STATUS: {project.status}
          </span>
        </div>
      ))} */}

      {/* Coming Soon メッセージ */}
      <div className="mt-4 px-2 text-[#FFEF00] opacity-70 animate-pulse italic mb-20">
        {`> MORE_WORKS_COMING_SOON...`}
        <br/>
      </div>
    </div>
  );
};