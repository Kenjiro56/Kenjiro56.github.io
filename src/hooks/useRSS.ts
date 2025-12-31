import { useState, useEffect } from 'react';

export type LogEntry = {
  id: string;
  date: string;
  source: 'ZENN' | 'QIITA';
  title: string;
  link: string;
};

export const useRSS = (zennUser: string, qiitaUser: string) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeeds = async () => {
      try {
        const zennUrl = `https://api.rss2json.com/v1/api.json?rss_url=https://zenn.dev/${zennUser}/feed`;
        const qiitaUrl = `https://api.rss2json.com/v1/api.json?rss_url=https://qiita.com/${qiitaUser}/feed`;

        const [zennRes, qiitaRes] = await Promise.all([
          fetch(zennUrl).then(r => r.json()),
          fetch(qiitaUrl).then(r => r.json())
        ]);

        const combined: LogEntry[] = [
          ...(zennRes.items || []).map((i: any) => ({
            id: i.guid,
            date: i.pubDate.split(' ')[0].replace(/-/g, '.'),
            source: 'ZENN',
            title: i.title,
            link: i.link
          })),
          ...(qiitaRes.items || []).map((i: any) => ({
            id: i.guid,
            date: i.pubDate.split(' ')[0].replace(/-/g, '.'),
            source: 'QIITA',
            title: i.title,
            link: i.link
          }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setLogs(combined);
      } catch (err) {
        console.error("Feed error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeeds();
  }, [zennUser, qiitaUser]);

  return { logs, loading };
};