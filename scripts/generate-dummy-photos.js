import fs from 'fs';
import path from 'path';
import piexif from 'piexifjs';

// ダミー写真データ定義 (写真ファイル名, タイトル, 緯度, 経度, 撮影日時, 背景色Hex)
const dummyPhotos = [
  {
    filename: 'tokyo-tower.jpg',
    title: '東京タワーの夜景',
    locationName: '東京, 日本',
    lat: 35.6586,
    lng: 139.7454,
    date: '2025:11:15 19:30:00',
    color: '#3b82f6',
    description: '秋晴れの夜、ライトアップされた東京タワーを撮影。',
  },
  {
    filename: 'kyoto-kinkakuji.jpg',
    title: '金閣寺と紅葉',
    locationName: '京都, 日本',
    lat: 35.0394,
    lng: 135.7292,
    date: '2025:10:20 11:15:00',
    color: '#eab308',
    description: '鮮やかな紅葉に包まれた鹿苑寺金閣。',
  },
  {
    filename: 'paris-eiffel.jpg',
    title: 'エッフェル塔の夕暮れ',
    locationName: 'パリ, フランス',
    lat: 48.8584,
    lng: 2.2945,
    date: '2024:07:14 20:45:00',
    color: '#ec4899',
    description: 'セーヌ川沿いから望む夕刻のエッフェル塔。',
  },
  {
    filename: 'ny-times-square.jpg',
    title: 'タイムズスクエアの熱気',
    locationName: 'ニューヨーク, アメリカ',
    lat: 40.7580,
    lng: -73.9855,
    date: '2024:01:01 00:05:00',
    color: '#8b5cf6',
    description: 'カウントダウン直後の煌びやかなタイムズスクエア。',
  },
  {
    filename: 'switzerland-alps.jpg',
    title: 'スイス・アルプスの絶景',
    locationName: 'ツェルマット, スイス',
    lat: 45.9763,
    lng: 7.7491,
    date: '2023:08:12 09:00:00',
    color: '#10b981',
    description: 'マッターホルンを望む早朝のハイキングルート。',
  }
];

// 度分秒 (DMS) 形式に変換ヘルパー
function degToDmsRational(deg) {
  const absolute = Math.abs(deg);
  const d = Math.floor(absolute);
  const minFloat = (absolute - d) * 60;
  const m = Math.floor(minFloat);
  const s = Math.round((minFloat - m) * 60 * 100);
  return [[d, 1], [m, 1], [s, 100]];
}

// 最小限のJPEGベース64（1x1単色画像をスケール指定で生成）
// 200x150 のSVGをJPEGっぽく見せる簡易JPEGプレースホルダーを作るか、シンプルなJPEGデータヘッダー
// piexifjs は data:image/jpeg;base64,... 形式の文字列を受け取るため、
// Node側で簡易JPEGベース64を出力します。

// 簡易JPEGヘッダー（赤い/青いグラデーション風JPEG画像のダミーbase64）
const baseJpegData = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAAKAAoBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";

const outputDir = path.join(process.cwd(), 'public', 'photos');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

dummyPhotos.forEach((item) => {
  const zeroth = {};
  const exif = {};
  const gps = {};

  // 日時
  zeroth[piexif.ImageIFD.Make] = "Fujifilm";
  zeroth[piexif.ImageIFD.Model] = "X-T5";
  zeroth[piexif.ImageIFD.ImageDescription] = `${item.title} - ${item.description}`;
  zeroth[piexif.ImageIFD.DateTime] = item.date;

  exif[piexif.ExifIFD.DateTimeOriginal] = item.date;

  // GPS
  gps[piexif.GPSIFD.GPSLatitudeRef] = item.lat >= 0 ? 'N' : 'S';
  gps[piexif.GPSIFD.GPSLatitude] = degToDmsRational(item.lat);
  gps[piexif.GPSIFD.GPSLongitudeRef] = item.lng >= 0 ? 'E' : 'W';
  gps[piexif.GPSIFD.GPSLongitude] = degToDmsRational(item.lng);

  const exifObj = { "0th": zeroth, "Exif": exif, "GPS": gps };
  const exifBytes = piexif.dump(exifObj);
  const newJpeg = piexif.insert(exifBytes, baseJpegData);

  const buffer = Buffer.from(newJpeg.replace(/^data:image\/jpeg;base64,/, ""), 'base64');
  const filePath = path.join(outputDir, item.filename);
  fs.writeFileSync(filePath, buffer);
  console.log(`Generated Exif photo: ${filePath}`);
});
