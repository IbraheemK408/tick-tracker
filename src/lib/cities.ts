// The API only gives a city name for each sighting, so we keep our own
// latitude/longitude for every city in the dataset to place it on the map.
export const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  Birmingham: { lat: 52.4862, lng: -1.8904 },
  Bristol: { lat: 51.4545, lng: -2.5879 },
  Cardiff: { lat: 51.4816, lng: -3.1791 },
  Edinburgh: { lat: 55.9533, lng: -3.1883 },
  Glasgow: { lat: 55.8642, lng: -4.2518 },
  Leeds: { lat: 53.8008, lng: -1.5491 },
  Leicester: { lat: 52.6369, lng: -1.1398 },
  Liverpool: { lat: 53.4084, lng: -2.9916 },
  London: { lat: 51.5074, lng: -0.1278 },
  Manchester: { lat: 53.4808, lng: -2.2426 },
  Newcastle: { lat: 54.9783, lng: -1.6178 },
  Nottingham: { lat: 52.9548, lng: -1.1581 },
  Sheffield: { lat: 53.3811, lng: -1.4701 },
  Southampton: { lat: 50.9097, lng: -1.4044 },
};
