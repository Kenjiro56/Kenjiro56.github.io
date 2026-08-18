import fs from 'fs';
import path from 'path';
import exifr from 'exifr';

export interface PhotoItem {
  id: string;
  url: string;
  title: string;
  locationName: string;
  latitude: number;
  longitude: number;
  date: string;
  camera?: string;
  description?: string;
}

// メタデータJSONの読み込み（Exifにタイトルや特定の場所名が含まれない場合に補完するマップ）
const metadataPath = path.join(process.cwd(), 'src', 'data', 'photos-metadata.json');
let metadataMap: Record<string, { title: string; locationName: string; description: string; latitude?: number; longitude?: number }> = {};
if (fs.existsSync(metadataPath)) {
  try {
    metadataMap = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
  } catch (err) {
    console.error('Failed to load photos-metadata.json:', err);
  }
}

export async function getPhotos(): Promise<PhotoItem[]> {
  const photosDir = path.join(process.cwd(), 'public', 'photos');
  
  if (!fs.existsSync(photosDir)) {
    return [];
  }

  const files = fs.readdirSync(photosDir).filter((file) =>
    /\.(jpe?g|png|webp)$/i.test(file)
  );

  const photos: PhotoItem[] = [];

  for (const file of files) {
    const filePath = path.join(photosDir, file);
    try {
      // exifrでExifメタデータを抽出
      const exifData = await exifr.parse(filePath, {
        gps: true,
        pick: ['GPSLatitude', 'GPSLongitude', 'DateTimeOriginal', 'Make', 'Model', 'ImageDescription'],
      });

      // 日時のフォーマット
      let dateStr = '';
      if (exifData?.DateTimeOriginal) {
        const d = new Date(exifData.DateTimeOriginal);
        if (!isNaN(d.getTime())) {
          dateStr = d.toISOString().split('T')[0];
        } else if (typeof exifData.DateTimeOriginal === 'string') {
          dateStr = exifData.DateTimeOriginal.split(' ')[0].replace(/:/g, '-');
        }
      }

      // ファイルの更新日時などをフォールバック
      if (!dateStr) {
        const stats = fs.statSync(filePath);
        dateStr = stats.mtime.toISOString().split('T')[0];
      }

      const metaFallback = metadataMap[file] || {
        title: file.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        locationName: 'Unknown Location',
        description: 'Exif情報から抽出された写真です。',
        latitude: undefined,
        longitude: undefined,
      };

      // メタデータJSONに設定された座標を優先し、無ければExifから取得
      let lat = metaFallback.latitude ?? exifData?.latitude ?? exifData?.GPSLatitude;
      let lng = metaFallback.longitude ?? exifData?.longitude ?? exifData?.GPSLongitude;

      // デモ用デフォルト位置（もしExifにもメタデータJSONにもGPSデータが無い場合）
      if (lat === undefined || lng === undefined) {
        if (file.includes('tokyo')) { lat = 35.6586; lng = 139.7454; }
        else if (file.includes('kyoto')) { lat = 35.0394; lng = 135.7292; }
        else if (file.includes('paris')) { lat = 48.8584; lng = 2.2945; }
        else if (file.includes('ny') || file.includes('times')) { lat = 40.7580; lng = -73.9855; }
        else if (file.includes('switzerland')) { lat = 45.9763; lng = 7.7491; }
        else { lat = 35.6812; lng = 139.7671; }
      }

      const cameraInfo = exifData?.Make && exifData?.Model
        ? `${exifData.Make} ${exifData.Model}`
        : (exifData?.Model || 'Fujifilm X-T5');

      photos.push({
        id: file,
        url: `/photos/${file}`,
        title: metaFallback.title,
        locationName: metaFallback.locationName,
        latitude: Number(lat),
        longitude: Number(lng),
        date: dateStr,
        camera: cameraInfo,
        description: exifData?.ImageDescription || metaFallback.description,
      });
    } catch (err) {
      console.error(`Failed to extract Exif from ${file}:`, err);
    }
  }

  // 撮影日時の新しい順にソート
  return photos.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
