import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

const data = [
  { subject: 'Go', A: 90 },
  { subject: 'Next.js', A: 85 },
  { subject: 'React', A: 80 },
  { subject: 'TypeScript', A: 85 },
  { subject: 'Network Sec', A: 75 },
  { subject: 'Log Analysis', A: 95 },
];

export const SkillRadarChart = () => (
  <div className="h-72 w-full p-4 glow-border bg-black/40">
    <div className="text-[10px] mb-4 opacity-70 tracking-[0.2em]">
      {`> CAPABILITY_ANALYSIS_v2.0`}
    </div>
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid stroke="#00FF41" strokeOpacity={0.2} />
        <PolarAngleAxis dataKey="subject" tick={{ fill: '#00FF41', fontSize: 10, fontWeight: 'bold' }} />
        <Radar
          name="Skills"
          dataKey="A"
          stroke="#00FF41"
          fill="#00FF41"
          fillOpacity={0.4}
        />
      </RadarChart>
    </ResponsiveContainer>
  </div>
);