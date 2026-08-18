import Parser from 'rss-parser';
import { SPEAKERDECK_USERNAME, manualSlides } from '../config/slides';
import type { SlideItem } from '../components/SlideCard.astro';

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Portfolio Slide Fetcher)',
  },
  timeout: 8000,
});

// 通信エラーやRSS解析失敗時のフォールバックデータ
const FALLBACK_SLIDES: SlideItem[] = [
  {
    id: 'slide-1',
    title: 'Astro v5 と Leaflet で作る次世代ポートフォリオの設計実践',
    event: 'Web Tech Conference 2026',
    date: '2026-08-10',
    platform: 'Speaker Deck',
    embedUrl: 'https://speakerdeck.com/player/a362f6bbd68846bbba92a95c37482f63',
    linkUrl: 'https://speakerdeck.com',
    description: 'ビルド時 Exif 抽出による自動マップピン生成と SSG パフォーマンス最適化手法。',
  },
];

export async function getSlides(): Promise<SlideItem[]> {
  let speakerdeckSlides: SlideItem[] = [];

  if (SPEAKERDECK_USERNAME) {
    try {
      const feedUrl = `https://speakerdeck.com/${SPEAKERDECK_USERNAME}.rss`;
      console.log(`Fetching Speaker Deck RSS from: ${feedUrl}`);
      const feed = await parser.parseURL(feedUrl);

      if (feed && feed.items) {
        const parsedSlides = await Promise.all(
          feed.items.map(async (item, index) => {
            const linkUrl = item.link || '';
            let embedUrl = '';

            // OEmbed から埋め込み用プレイヤーのURLを解決
            if (linkUrl) {
              try {
                const oembedUrl = `https://speakerdeck.com/oembed.json?url=${encodeURIComponent(linkUrl)}`;
                const oembedRes = await fetch(oembedUrl);
                if (oembedRes.ok) {
                  const oembedData = await oembedRes.json() as { html?: string };
                  if (oembedData.html) {
                    const embedUrlMatch = oembedData.html.match(/src="([^"]+)"/);
                    if (embedUrlMatch) {
                      embedUrl = embedUrlMatch[1];
                    }
                  }
                }
              } catch (e) {
                console.error(`Failed to get oembed for ${linkUrl}:`, e);
              }
            }

            // YYYY-MM-DD 形式の日付にフォーマット
            let dateStr = '';
            if (item.pubDate) {
              const d = new Date(item.pubDate);
              if (!isNaN(d.getTime())) {
                dateStr = d.toISOString().split('T')[0];
              }
            }

            return {
              id: `sd-${index}`,
              title: item.title || 'Untitled Slide',
              event: 'Speaker Deck Presentation', // デフォルトイベント名
              date: dateStr,
              platform: 'Speaker Deck' as const,
              embedUrl: embedUrl,
              linkUrl: linkUrl,
              description: item.contentSnippet || '',
            };
          })
        );
        speakerdeckSlides = parsedSlides.filter(s => s.embedUrl !== '');
      }
    } catch (err) {
      console.error('Failed to fetch or parse Speaker Deck RSS:', err);
    }
  }

  // 取得したスライドがない、かつ手動スライドも空の場合はフォールバックデータを返す
  if (speakerdeckSlides.length === 0 && manualSlides.length === 0) {
    return FALLBACK_SLIDES;
  }

  // 手動登録スライドとマージして日付降順でソート
  return [...manualSlides, ...speakerdeckSlides].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}
