export interface FeedConfig {
  source: 'Zenn' | 'Qiita' | 'Hatena' | string;
  url: string;
}

/**
 * 外部RSSフィードの設定
 * ご自身の Zenn / Qiita / はてなブログ のユーザーID・URLに合わせて設定してください。
 * 
 * - Zenn: https://zenn.dev/<あなたのZenn_ID>/feed
 * - Qiita: https://qiita.com/<あなたのQiita_ID>/feed
 * - はてなブログ: https://<あなたのIDまたはドメイン>.hatenablog.com/rss
 */
export const FEED_CONFIGS: FeedConfig[] = [
  {
    source: 'Zenn',
    url: 'https://zenn.dev/jiroken/feed', // デモ用（ご自身のIDに変更してください）
  },
  {
    source: 'Qiita',
    url: 'https://qiita.com/jiroken/feed',   // デモ用（ご自身のIDに変更してください）
  },
  {
    source: 'Hatena',
    url: 'https://jackmer.hatenablog.com/rss', // デモ用（ご自身のID/ドメインに変更してください）
  },
];
