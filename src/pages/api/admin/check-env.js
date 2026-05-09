// pages/api/admin/check-env.js
export default function handler(req, res) {
  res.status(200).json({
    email: process.env.ADMIN_EMAIL || 'NOT SET',
    hasHash: !!process.env.ADMIN_PASSWORD_HASH,
    hashStart: process.env.ADMIN_PASSWORD_HASH?.substring(0, 20) || 'NOT SET',
    sessionHours: process.env.ADMIN_SESSION_HOURS || 'NOT SET',
    jwtSecret: process.env.JWT_SECRET ? 'SET' : 'NOT SET'
  });
}