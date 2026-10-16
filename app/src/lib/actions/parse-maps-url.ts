'use server'

/**
 * Parses a Google Maps URL (including short URLs like maps.app.goo.gl)
 * and extracts coordinates and place name.
 */
export async function parseGoogleMapsUrl(url: string): Promise<{
  name: string
  latitude: number
  longitude: number
} | null> {
  try {
    // Follow redirects to get the full URL
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Linux; Android 10; Pixel 4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
      },
    })

    const finalUrl = response.url
    const html = await response.text()

    // Try to extract from the final URL
    // Pattern: @lat,lng,zoom or ?q=lat,lng or !3d lat !4d lng
    const atPattern = /@(-?\d+\.\d+),(-?\d+\.\d+)/
    const qPattern = /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/
    const llPattern = /[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/
    const d3Pattern = /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/

    let lat: number | null = null
    let lng: number | null = null

    for (const pattern of [atPattern, qPattern, llPattern, d3Pattern]) {
      const match = finalUrl.match(pattern)
      if (match) {
        lat = parseFloat(match[1])
        lng = parseFloat(match[2])
        break
      }
    }

    // Try from HTML metadata if URL parsing failed
    if (lat === null || lng === null) {
      const metaPattern = /center=(-?\d+\.\d+)%2C(-?\d+\.\d+)/
      const metaMatch = html.match(metaPattern)
      if (metaMatch) {
        lat = parseFloat(metaMatch[1])
        lng = parseFloat(metaMatch[2])
      }
    }

    if (lat === null || lng === null) return null

    // Extract name from title tag
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/)
    let name = 'Lugar importado'
    if (titleMatch) {
      name = titleMatch[1]
        .replace(' - Google Maps', '')
        .replace(' – Google Maps', '')
        .trim()
    }

    return { name, latitude: lat, longitude: lng }
  } catch {
    return null
  }
}
