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
  <div className="h-20 w-full p-4  bg-black/40">
    <div className="text-[10px] mb-4 opacity-70 tracking-[0.2em]">
      {`> CAPABILITY_ANALYSIS_v2.0`}
    </div>
    <ResponsiveContainer width="30%" aspect={1.2}>
      <RadarChart cx="50%" cy="50%" outerRadius="50%" data={data}>
        <PolarGrid stroke="#00FF41" strokeOpacity={0.2} />
        <PolarAngleAxis dataKey="subject" tick={{ fill: '#000', fontSize: 15, fontWeight: 'bold' }} />
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