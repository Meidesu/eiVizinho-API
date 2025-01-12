import { Exception } from '@adonisjs/core/exceptions'
import {
  Client,
  Language,
  ReverseGeocodeRequest,
  Status,
} from '@googlemaps/google-maps-services-js'

interface Coordinates {
  latitude: number
  longitude: number
}

export default class GeocodingProvider {
  private client: Client

  constructor() {
    this.client = new Client({})
  }

  async reverseGeocode({ latitude, longitude }: Coordinates): Promise<string> {
    const request: ReverseGeocodeRequest = {
      params: {
        key: process.env.GOOGLE_MAPS_API_KEY || '',
        latlng: [latitude, longitude],
        language: Language.pt_BR,
      },
    }

    return this.client
      .reverseGeocode(request)
      .then((response) => {
        if (response.data.status !== Status.OK) {
          return ''
        }

        const { formatted_address: formattedAddress } = response.data.results[0]

        return formattedAddress
      })
      .catch((err) => {
        throw new Exception('Erro ao realizar geocoding.', {
          code: 'GEOCODING_ERROR',
          status: 500,
          cause: err.message,
        })
      })
  }
}
