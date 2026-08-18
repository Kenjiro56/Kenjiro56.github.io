export const SPEAKERDECK_USERNAME = 'Kenjiro56'; // 自身のSpeaker Deckユーザー名に変更してください

export interface ManualSlide {
  id: string;
  title: string;
  event: string;
  date: string;
  platform: 'Speaker Deck' | 'Docswell' | 'SlideShare';
  embedUrl: string;
  linkUrl: string;
  description?: string;
}

// Speaker Deck以外（DocswellやGoogle Slidesなど）のスライド、または手動で登録したいものを定義します
export const manualSlides: ManualSlide[] = [];
