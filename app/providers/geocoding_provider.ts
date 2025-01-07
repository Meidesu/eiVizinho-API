import opencage from 'opencage-api-client'

interface Coordinates {
  latitude: number
  longitude: number
}

export default class GeocodingProvider {
  async reverseGeocode({ latitude, longitude }: Coordinates): Promise<string> {
    const coordinates = `${latitude},${longitude}`

    const request = {
      q: coordinates,
      key: process.env.OPENCAGE_API_KEY,
      language: 'pt-BR',
    }

    const response = await opencage.geocode(request)

    if (response.status.code !== 200 || response.results.length <= 0) {
      return 'Endereço não encontrado'
    }

    const { formatted } = response.results[0]

    return formatted
  }
}
