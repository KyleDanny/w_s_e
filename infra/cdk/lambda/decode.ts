/**
 * Decode binary weather data
 * @param bytes - 8-byte array
 * @returns Decoded weather data
 */
export function decodeWeatherData(bytes: Uint8Array): {
  timestamp: number;
  temperature: number;
  humidity: number;
} {
  const view = new DataView(bytes.buffer);

  const timestamp = view.getUint32(0);
  const temperature = view.getInt16(4) / 100;
  const humidity = view.getUint16(6) / 100;

  return { timestamp, temperature, humidity };
}
