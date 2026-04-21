// pages/api/cloudinary/delete.js
import cloudinary from 'cloudinary'

cloudinary.v2.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { public_id } = req.body

  if (!public_id) {
    return res.status(400).json({ error: 'Missing public_id' })
  }

  try {
    const result = await cloudinary.v2.uploader.destroy(public_id)
    res.status(200).json(result)
  } catch (error) {
    console.error('Cloudinary delete error:', error)
    res.status(500).json({ error: 'Failed to delete image' })
  }
}