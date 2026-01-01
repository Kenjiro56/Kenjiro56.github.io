import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';

const data = [
  { subject: 'Go', A: 20 },
  { subject: 'Next', A: 40 },
  { subject: 'React', A: 50 },
  { subject: 'TS', A: 50 },
  { subject: 'Security', A: 40 },
];

export const SkillRadarChart = () => {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);
  if (!isMounted) return <div className="h-44" />;

  return (
    <div className="h-44 w-full flex flex-col items-center">
    <ResponsiveContainer width="30%" aspect={1.2}>
      <RadarChart cx="50%" cy="50%" outerRadius="50%" data={data}>
          <PolarGrid stroke="#6925CE" strokeOpacity={0.3} />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#00FF00', fontSize: 12, fontWeight: 'bold' }} />
          <Radar name="Skills" dataKey="A" stroke="#00FF00" fill="#00FF00" fillOpacity={0.3} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};