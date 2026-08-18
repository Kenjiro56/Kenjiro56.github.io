import fs from 'fs';
import path from 'path';
import exifr from 'exifr';
import sharp from 'sharp';

// 環境変数の取得
const slackBotToken = process.env.SLACK_BOT_TOKEN;
const fileUrl = process.env.SLACK_FILE_URL;
const fileId = process.env.SLACK_FILE_ID;
const slackText = process.env.SLACK_TEXT || '';

if (!slackBotToken || !fileUrl || !fileId) {
  console.error('Missing required environment variables: SLACK_BOT_TOKEN, SLACK_FILE_URL, SLACK_FILE_ID');
  process.exit(1);
}

const photosDir = path.join(process.cwd(), 'public', 'photos');
const metadataPath = path.join(process.cwd(), 'src', 'data', 'photos-metadata.json');

// ディレクトリの自動作成
if (!fs.existsSync(photosDir)) {
  fs.mkdirSync(photosDir, { recursive: true });
}
const metadataDir = path.dirname(metadataPath);
if (!fs.existsSync(metadataDir)) {
  fs.mkdirSync(metadataDir, { recursive: true });
}

// 1. 画像のダウンロード
async function downloadImage(url, token) {
  console.log(`Downloading image from: ${url}`);
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText} (${response.status})`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// 2. メッセージのパース (タイトル、場所、説明、座標の手動指定)
function parseSlackText(text) {
  const lines = text.split('\n').map(line => line.trim());
  let title = '';
  let locationName = '';
  let description = '';
  let latitude = null;
  let longitude = null;

  const titleRegex = /^(?:タイトル|【タイトル】|title|\[title\])\s*[:：]\s*(.*)$/i;
  const locationRegex = /^(?:場所|【場所】|location|\[location\])\s*[:：]\s*(.*)$/i;
  const descriptionRegex = /^(?:説明|【説明】|description|\[description\])\s*[:：]\s*(.*)$/i;
  // 座標指定: 座標: 35.6586, 139.7454 もしくは gps: 35.6586,139.7454
  const coordsRegex = /^(?:座標|【座標】|gps|coordinates)\s*[:：]\s*([-\d.]+)\s*[,，/]\s*([-\d.]+)$/i;

  for (const line of lines) {
    if (titleRegex.test(line)) {
      title = line.match(titleRegex)[1];
    } else if (locationRegex.test(line)) {
      locationName = line.match(locationRegex)[1];
    } else if (descriptionRegex.test(line)) {
      description = line.match(descriptionRegex)[1];
    } else if (coordsRegex.test(line)) {
      const match = line.match(coordsRegex);
      latitude = parseFloat(match[1]);
      longitude = parseFloat(match[2]);
    }
  }

  // フォールバック処理
  if (!title) {
    title = lines[0] ? lines[0].substring(0, 40) : 'Slack Photo';
    if (title.match(/^(場所|説明|座標|location|description|gps)/i)) {
      title = 'Slack Photo';
    }
  }

  if (!locationName) {
    locationName = 'Unknown Location';
  }

  if (!description) {
    description = text.replace(/^(タイトル|場所|説明|座標|title|location|description|gps).*$/gim, '').trim() || 'Slackからアップロードされた写真です。';
  }

  return { title, locationName, description, latitude, longitude };
}

async function main() {
  try {
    const imageBuffer = await downloadImage(fileUrl, slackBotToken);

    // Exif パース
    console.log('Extracting Exif metadata...');
    let exifData = null;
    try {
      exifData = await exifr.parse(imageBuffer, {
        gps: true,
        pick: ['GPSLatitude', 'GPSLongitude', 'DateTimeOriginal', 'Make', 'Model']
      });
    } catch (exifErr) {
      console.warn('Failed to parse Exif metadata. Proceeding without Exif.', exifErr.message);
    }

    // WebPへの変換と最適化
    const outputFilename = `${fileId}.webp`;
    const outputPath = path.join(photosDir, outputFilename);

    console.log(`Optimizing image and saving to ${outputPath}...`);
    await sharp(imageBuffer)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath);

    console.log('Image optimization complete.');

    // メッセージのパース
    const parsedMeta = parseSlackText(slackText);

    // メタデータの読込・更新
    let metadata = {};
    if (fs.existsSync(metadataPath)) {
      try {
        metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
      } catch (err) {
        console.error('Error reading existing metadata, starting fresh:', err);
      }
    }

    // メタデータを追加 (座標が手動指定されていた場合はそれを使用)
    metadata[outputFilename] = {
      title: parsedMeta.title,
      locationName: parsedMeta.locationName,
      description: parsedMeta.description
    };

    if (parsedMeta.latitude !== null && parsedMeta.longitude !== null) {
      metadata[outputFilename].latitude = parsedMeta.latitude;
      metadata[outputFilename].longitude = parsedMeta.longitude;
    }

    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');
    console.log(`Metadata successfully updated in: ${metadataPath}`);
    console.log('Processed photo details:', {
      file: outputFilename,
      title: parsedMeta.title,
      locationName: parsedMeta.locationName,
      hasGPS: !!(exifData?.latitude || exifData?.GPSLatitude || parsedMeta.latitude !== null)
    });

  } catch (err) {
    console.error('Processing failed:', err);
    process.exit(1);
  }
}

main();
