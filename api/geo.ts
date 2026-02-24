import type { VercelRequest, VercelResponse } from '@vercel/node';

const COUNTRY_TO_LANG: Record<string, string> = {
  JP: 'ja',
  CN: 'zh-CN',
  TW: 'zh-TW',
  HK: 'zh-TW',
  MO: 'zh-TW',
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  const country = (req.headers['x-vercel-ip-country'] as string) || '';
  const lang = COUNTRY_TO_LANG[country] || 'en';
  res.setHeader('Cache-Control', 'no-store');
  res.json({ lang, country });
}
