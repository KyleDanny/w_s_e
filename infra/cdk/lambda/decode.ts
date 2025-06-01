/**
 * Decode binary weather data
 * @param bytes - 8-byte array
 * @returns Decoded weather data
 */
export function decodeWeatherData(data: Uint8Array) {
  const view = new DataView(data.buffer);

  const timestamp = view.getUint32(0);
  const temperature = view.getInt16(4) / 100;
  const humidity = view.getUint16(6) / 100;

  const deviceIdBytes = data.slice(8, 28); // 20 bytes
  const deviceId = new TextDecoder().decode(deviceIdBytes).replace(/\0/g, "");

  return { timestamp, temperature, humidity, deviceId };
}
