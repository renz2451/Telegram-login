// api/auth.js
const crypto = require('crypto');

// ⚠️ PASTE YOUR NEW BOT TOKEN (revoked old one!)
const BOT_TOKEN = '8686830402:AAHIvJw3dH7oNH6rUWEEsoAYASDKVi5PHvA';

// Helper to validate Telegram data
function validateTelegramData(query) {
  const authDate = parseInt(query.auth_date);
  if (Date.now() / 1000 - authDate > 86400) return false; // 24h expiry

  const { hash, ...data } = query;
  const dataCheckStr = Object.keys(data)
    .sort()
    .map(k => `${k}=${data[k]}`)
    .join('\n');
  const secret = crypto.createHash('sha256').update(BOT_TOKEN).digest();
  const computed = crypto.createHmac('sha256', secret)
    .update(dataCheckStr)
    .digest('hex');
  return computed === hash;
}

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const query = req.query;
  if (!validateTelegramData(query)) {
    return res.status(401).json({ error: 'Invalid login data' });
  }

  // If valid, redirect back to frontend with user data as query params
  // or you can set a session cookie and redirect to a dashboard.
  const { id, first_name, last_name, username, photo_url } = query;
  const redirectUrl = `https://2451.github.io/telegram-login/?id=${id}&first_name=${encodeURIComponent(first_name)}&last_name=${encodeURIComponent(last_name || '')}&username=${username}&photo_url=${encodeURIComponent(photo_url || '')}`;
  
  // For security, you might want to set an HTTP‑only cookie here instead.
  res.redirect(302, redirectUrl);
}
