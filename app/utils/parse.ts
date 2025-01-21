export function strToCoordinates(coordinates: string) {
  const coordinatesArray = coordinates.split(', ').map(parseFloat)

  if (coordinatesArray.length !== 2 || coordinatesArray.filter(isNaN).length > 0) {
    return null
  }

  const [latitude, longitude] = coordinatesArray

  return {
    latitude,
    longitude,
  }
}
