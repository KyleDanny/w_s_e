/**
 * Encode weather data to binary
 * @param {Object} data - { timestamp: number, temperature: number, humidity: number }
 * @returns {Uint8Array}

 * LM92s (Temperature sensor) are 8-bit sensors, so we need to encode the data into 8-bit chunks
 * HDC3020s (Humidity sensor) are 16-bit sensors, so we need to encode the data into 16-bit chunks
 * Cortex-M3 based MCU is used to read the data from the sensors
 */
export function encodeWeatherData(data: {
  deviceId: string;
  timestamp: number;
  temperature: number;
  humidity: number;
}): Uint8Array {
  const deviceIdBytes = new TextEncoder().encode(data.deviceId);
  const idBuffer = new Uint8Array(20);
  idBuffer.set(deviceIdBytes.slice(0, 20)); // truncate if too long

  const buffer = new ArrayBuffer(28); // 20 bytes, id + 4 bytes, temp + 2 bytes, humidity
  const view = new DataView(buffer);

  view.setUint32(0, data.timestamp); // 4 bytes
  view.setInt16(4, Math.round(data.temperature * 100)); // 2 bytes
  view.setUint16(6, Math.round(data.humidity * 100)); // 2 bytes

  const fullArray = new Uint8Array(buffer);
  fullArray.set(idBuffer, 8); // add deviceId at the end

  return fullArray;
}
