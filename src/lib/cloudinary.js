// Simple Cloudinary URL optimizer
export const optimizeImage = (url) => {
  if (!url || !url.includes('cloudinary.com')) return url
  
  // Add auto optimization parameters to any Cloudinary URL
  return url.replace('/upload/', '/upload/f_auto,q_auto,w_auto,c_limit/')
}