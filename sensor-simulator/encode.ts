/**
 * Encode weather data to binary
 * @param {Object} data - { timestamp: number, temperature: number, humidity: number }
 * @returns {Uint8Array}

 * LM92s (Temperature sensor) are 8-bit sensors, so we need to encode the data into 8-bit chunks
 * HDC3020s (Humidity sensor) are 16-bit sensors, so we need to encode the data into 16-bit chunks
 * Cortex-M3 based MCU is used to read the data from the sensors
 */
export function encodeWeatherData(data: {
  timestamp: number;
  temperature: number;
  humidity: number;
}): Uint8Array {
  const buffer = new ArrayBuffer(8); // 4 + 2 + 2 bytes
  const view = new DataView(buffer);

  view.setUint32(0, data.timestamp); // 4 bytes
  view.setInt16(4, Math.round(data.temperature * 100)); // 2 bytes
  view.setUint16(6, Math.round(data.humidity * 100)); // 2 bytes

  return new Uint8Array(buffer);
}
