// Cloudflare Workers - Slack Webhook to GitHub Actions Dispatcher

export default {
  async fetch(request, env, ctx) {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const bodyText = await request.text();
    const headers = request.headers;

    // 1. 先にペイロードを解析して URL Verification に即座に対応できるようにする
    let payload;
    try {
      payload = JSON.parse(bodyText);
    } catch (err) {
      return new Response('Bad Request: Invalid JSON', { status: 400 });
    }

    // Slack URL Verification (チャレンジ応答) は署名検証の前に無条件で返す
    if (payload.type === 'url_verification') {
      return new Response(payload.challenge, {
        headers: { 'content-type': 'text/plain' }
      });
    }

    // 2. Slack 署名の検証 (セキュリティ - url_verification以外のイベントに適用)
    if (env.SLACK_SIGNING_SECRET) {
      const signature = headers.get('x-slack-signature');
      const timestamp = headers.get('x-slack-request-timestamp');

      if (!signature || !timestamp) {
        return new Response('Unauthorized: Missing signature headers', { status: 401 });
      }

      // 5分以上古いリクエストはリプレイ攻撃防止のため拒否
      const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 60 * 5;
      if (parseInt(timestamp, 10) < fiveMinutesAgo) {
        return new Response('Unauthorized: Request too old', { status: 401 });
      }

      const isValid = await verifySlackSignature(
        bodyText,
        timestamp,
        signature,
        env.SLACK_SIGNING_SECRET
      );

      if (!isValid) {
        return new Response('Unauthorized: Invalid signature', { status: 401 });
      }
    }

    // イベントの処理
    if (payload.type === 'event_callback' && payload.event) {
      const event = payload.event;

      // メッセージイベントで、かつ画像ファイルが含まれている場合
      // (botからの投稿や、ファイルがない通常メッセージ、スレッド返信等はスルー)
      if (
        event.type === 'message' &&
        !event.bot_id &&
        !event.subtype &&
        event.files &&
        event.files.length > 0
      ) {
        // 画像ファイルを抽出
        const imageFiles = event.files.filter(f => f.mimetype && f.mimetype.startsWith('image/'));

        if (imageFiles.length > 0) {
          const file = imageFiles[0]; // 最初の1枚を対象にする
          const text = event.text || '';

          // GitHub Actions リポジトリディスパッチの実行 (非同期でバックグラウンド実行)
          ctx.waitUntil(
            triggerGitHubActions(
              env.GITHUB_OWNER,
              env.GITHUB_REPO,
              env.GITHUB_PAT,
              {
                file_id: file.id,
                file_url: file.url_private,
                text: text,
                timestamp: event.ts
              }
            )
          );
        }
      }
    }

    // Slack への即時 HTTP 200 応答 (3秒ルール対策)
    return new Response('OK', { status: 200 });
  }
};

// GitHub Actions をトリガーする非同期関数
async function triggerGitHubActions(owner, repo, pat, clientPayload) {
  const url = `https://api.github.com/repos/${owner}/${repo}/dispatches`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${pat}`,
        'User-Agent': 'cloudflare-worker-slack-photo',
        'X-GitHub-Api-Version': '2022-11-28'
      },
      body: JSON.stringify({
        event_type: 'slack-photo-uploaded',
        client_payload: clientPayload
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`GitHub API Error: ${response.status} ${response.statusText} - ${errText}`);
    } else {
      console.log(`Successfully dispatched GitHub Actions workflow for file ID: ${clientPayload.file_id}`);
    }
  } catch (err) {
    console.error('Failed to trigger GitHub Actions:', err);
  }
}

// Slack の署名検証 (Web Crypto API)
async function verifySlackSignature(body, timestamp, signature, signingSecret) {
  const encoder = new TextEncoder();
  const signatureBase = `v0:${timestamp}:${body}`;

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(signingSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(signatureBase)
  );

  // Buffer を Hex 文字列に変換
  const hashArray = Array.from(new Uint8Array(signatureBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  const calculatedSignature = `v0=${hashHex}`;

  // Timing-safe comparison (タイムアタック攻撃対策)
  // signature が v0=... の形式であることを検証しつつ、定数時間で比較します
  return timingSafeEqual(calculatedSignature, signature);
}

// 定数時間比較ヘルパー
function timingSafeEqual(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
