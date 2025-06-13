export function getCachedImage(userId: string) {
  if (typeof window === 'undefined') return null // SSR対応

  const cacheKey = `profile_image_${userId}`
  const cached = localStorage.getItem(cacheKey)

  if (cached) {
    try {
      const cacheData = JSON.parse(cached)
      const isExpired =
        Date.now() - cacheData.timestamp > 7 * 24 * 60 * 60 * 1000

      if (!isExpired) {
        return cacheData.image
      }
      localStorage.removeItem(cacheKey)
    } catch (_error) {
      localStorage.removeItem(cacheKey)
    }
  }
  return null
}

export async function cacheImage(imageUrl: string, userId: string) {
  if (typeof window === 'undefined') return null

  try {
    const response = await fetch(imageUrl)
    if (response.ok) {
      const blob = await response.blob()
      const base64 = await new Promise(resolve => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.readAsDataURL(blob)
      })

      const cacheData = {
        image: base64,
        timestamp: Date.now(),
        userId: userId,
      }

      localStorage.setItem(`profile_image_${userId}`, JSON.stringify(cacheData))
      return base64
    }
  } catch (error) {
    console.error('Image caching failed:', error)
  }
  return null
}
