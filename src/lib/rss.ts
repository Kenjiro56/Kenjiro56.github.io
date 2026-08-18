import Parser from 'rss-parser';
import { FEED_CONFIGS, type FeedConfig } from '../config/feeds';

export interface Article {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  source: 'Zenn' | 'Qiita' | 'Hatena' | string;
  snippet?: string;
}

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Portfolio RSS Fetcher)',
  },
  timeout: 8000,
});

// フォールバックデモ用サンプル記事
const FALLBACK_ARTICLES: Article[] = [
  {
    id: 'zenn-demo-1',
    title: 'Astro v5 + Tailwind CSS で構築する超軽量ポートフォリオサイト',
    link: 'https://zenn.dev',
    pubDate: '2026-08-15',
    source: 'Zenn',
    snippet: 'ビルド時 Exif 抽出や外部 RSS フィードの自動統合を行ったモダン Web サイトの構築記録。',
  },
  {
    id: 'qiita-demo-1',
    title: 'TypeScript 5.x における型安全性向上と実践的デザインパターン',
    link: 'https://qiita.com',
    pubDate: '2026-07-28',
    source: 'Qiita',
    snippet: '高度な型パズルを避けつつメンテナンス性を極限まで高める TypeScript の設計ノウハウ。',
  },
  {
    id: 'hatena-demo-1',
    title: 'はてなブログで振り返る年間技術アウトプットとキャリア構築',
    link: 'https://hatenablog.com',
    pubDate: '2026-06-10',
    source: 'Hatena',
    snippet: '日々の開発で得た知見やカンファレンス参加録を効率的にまとめ続ける方法。',
  },
];

export async function fetchAllArticles(feeds: FeedConfig[] = FEED_CONFIGS): Promise<Article[]> {
  const articles: Article[] = [];

  for (const feed of feeds) {
    try {
      const feedData = await parser.parseURL(feed.url);
      feedData.items.forEach((item, index) => {
        if (item.title && item.link) {
          let dateStr = '';
          const rawDate = item.isoDate || item.pubDate;
          if (rawDate) {
            const d = new Date(rawDate);
            if (!isNaN(d.getTime())) {
              dateStr = d.toISOString().split('T')[0];
            }
          }

          // HTMLタグ除去処理
          const cleanSnippet = (item.contentSnippet || item.summary || '')
            .replace(/<[^>]*>?/gm, '')
            .trim()
            .slice(0, 140);

          articles.push({
            id: `${feed.source}-${index}-${item.link}`,
            title: item.title,
            link: item.link,
            pubDate: dateStr || new Date().toISOString().split('T')[0],
            source: feed.source,
            snippet: cleanSnippet ? `${cleanSnippet}...` : undefined,
          });
        }
      });
    } catch (err) {
      console.warn(`[RSS Parser Warning] Failed to fetch feed from ${feed.source} (${feed.url}):`, err);
    }
  }

  const resultArticles = articles.length > 0 ? articles : FALLBACK_ARTICLES;

  // 公開日の降順（新しい順）でソート
  return resultArticles.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
}
