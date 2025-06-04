describe("Weather Data Decoder", () => {
  let decodeWeatherData: any;

  beforeAll(async () => {
    const module = await import("../lambda/decode.js");
    decodeWeatherData = module.decodeWeatherData;
  });

  test("validates data structure and types", () => {
    const buffer = new ArrayBuffer(28);
    const view = new DataView(buffer);

    view.setUint32(0, 1716825600);
    view.setInt16(4, 2500);
    view.setUint16(6, 5000);

    const uint8Array = new Uint8Array(buffer);

    const result = decodeWeatherData(uint8Array);

    expect(typeof result.timestamp).toBe("number");
    expect(typeof result.temperature).toBe("number");
    expect(typeof result.humidity).toBe("number");
    expect(typeof result.deviceId).toBe("string");

    expect(result).toHaveProperty("timestamp");
    expect(result).toHaveProperty("temperature");
    expect(result).toHaveProperty("humidity");
    expect(result).toHaveProperty("deviceId");
  });

  test("decodes valid binary weather data correctly", () => {
    // Create a sample binary payload (28 bytes total)
    const buffer = new ArrayBuffer(28);
    const view = new DataView(buffer);

    // Set timestamp (4 bytes)
    view.setUint32(0, 1716825600);

    // Set temperature (2 bytes) - 21.56°C -> 2156
    view.setInt16(4, 2156);

    // Set humidity (2 bytes) - 63.42% -> 6342
    view.setUint16(6, 6342);

    // Set device ID (20 bytes)
    const deviceIdBytes = new TextEncoder().encode("simulated-station-1");
    const uint8Array = new Uint8Array(buffer);
    uint8Array.set(deviceIdBytes, 8);

    const result = decodeWeatherData(uint8Array);

    expect(result).toEqual({
      timestamp: 1716825600,
      temperature: 21.56,
      humidity: 63.42,
      deviceId: "simulated-station-1",
    });
  });

  test("handles negative temperatures correctly", () => {
    const buffer = new ArrayBuffer(28);
    const view = new DataView(buffer);

    view.setUint32(0, 1716825600);
    view.setInt16(4, -4000); // -40.00°C
    view.setUint16(6, 5000); // 50.00%

    const deviceIdBytes = new TextEncoder().encode("cold-station");
    const uint8Array = new Uint8Array(buffer);
    uint8Array.set(deviceIdBytes, 8);

    const result = decodeWeatherData(uint8Array);

    expect(result.temperature).toBe(-40.0);
    expect(result.humidity).toBe(50.0);
    expect(result.deviceId).toBe("cold-station");
  });

  test("handles empty device ID", () => {
    // Handle empty device ID
  });

  test("handles zero values correctly", () => {
    // Handle zero values
  });

  test("handles maximum values correctly", () => {
    // Handle maximum values correctly
  });

  test("handles precision correctly for temperature and humidity", () => {
    // Handle precision correctly for temperature and humidity
  });

  test("handles buffer edge cases", () => {
    // Test with actual Uint8Array (not ArrayBuffer)
  });
});
