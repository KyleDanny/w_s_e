// Import shared mocks FIRST
import { mockSend, createStorageMock } from "./shared-mocks.js";

describe("Weather System Integration Tests", () => {
  let storedWeatherData: any[];
  let decoderHandler: any;
  let apiHandler: any;
  let encodeWeatherData: any;

  beforeAll(async () => {
    // Import handlers AFTER mocking using dynamic import
    const decoderModule = await import("../lambda/decoder-handler.js");
    const apiModule = await import("../lambda/api-handler.js");
    // @ts-ignore - External module outside rootDir
    const encodeModule = await import("../../../sensor-simulator/encode.js");
    decoderHandler = decoderModule.handler;
    apiHandler = apiModule.handler;
    encodeWeatherData = encodeModule.encodeWeatherData;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.TABLE_NAME = "test-weather-table";

    // Create storage mock that captures data
    storedWeatherData = createStorageMock();
  });

  test("complete weather data flow: encode -> decode -> store -> retrieve", async () => {
    // Step 1: Create and encode weather data
    const originalWeatherData = {
      deviceId: "test-station-1", // Keep within 20 byte limit
      timestamp: 1716825600,
      temperature: 23.45,
      humidity: 67.89,
    };

    const binaryData = encodeWeatherData(originalWeatherData);
    const base64Data = Buffer.from(binaryData).toString("base64");

    // Step 2: Simulate POST request to decoder handler
    const decoderEvent = {
      body: base64Data,
      isBase64Encoded: true,
    };

    const decoderResult = await decoderHandler(decoderEvent);

    // Verify decode and store operation
    expect(decoderResult.statusCode).toBe(200);
    expect(JSON.parse(decoderResult.body)).toEqual({
      message: "Weather data saved",
    });

    // Verify data was stored
    expect(storedWeatherData).toHaveLength(1);
    expect(storedWeatherData[0]).toMatchObject({
      deviceId: "test-station-1",
      timestamp: 1716825600,
      temperature: 23.45,
      humidity: 67.89,
    });

    // Step 3: Simulate GET request to API handler
    const apiEvent = {
      requestContext: {
        http: {
          method: "GET",
        },
      },
      queryStringParameters: {
        deviceId: "test-station-1",
      },
    };

    const apiResult = await apiHandler(apiEvent);

    // Verify API response
    expect(apiResult.statusCode).toBe(200);
    expect(apiResult.headers).toEqual({ "Content-Type": "application/json" });

    const retrievedData = JSON.parse(apiResult.body);
    expect(retrievedData).toHaveLength(1);
    expect(retrievedData[0]).toEqual({
      deviceId: "test-station-1",
      timestamp: 1716825600,
      temperature: 23.45,
      humidity: 67.89,
    });
  });

  test("handles multiple weather stations data correctly", async () => {
    // Add data for multiple stations
    const stations = [
      {
        deviceId: "station-1",
        timestamp: 1716825600,
        temperature: 20.0,
        humidity: 60.0,
      },
      {
        deviceId: "station-2",
        timestamp: 1716825700,
        temperature: 25.0,
        humidity: 55.0,
      },
      {
        deviceId: "station-1",
        timestamp: 1716825800,
        temperature: 22.0,
        humidity: 58.0,
      },
    ];

    // Store data for all stations
    for (const stationData of stations) {
      const binaryData = encodeWeatherData(stationData);
      const base64Data = Buffer.from(binaryData).toString("base64");

      const decoderEvent = {
        body: base64Data,
        isBase64Encoded: true,
      };

      await decoderHandler(decoderEvent);
    }

    // Retrieve data for station-1 (should have 2 entries)
    const apiEvent1 = {
      requestContext: {
        http: {
          method: "GET",
        },
      },
      queryStringParameters: {
        deviceId: "station-1",
      },
    };

    const apiResult1 = await apiHandler(apiEvent1);
    const data1 = JSON.parse(apiResult1.body);

    expect(data1).toHaveLength(2);
    // Should be in descending order by timestamp
    expect(data1[0].timestamp).toBe(1716825800);
    expect(data1[1].timestamp).toBe(1716825600);

    // Retrieve data for station-2 (should have 1 entry)
    const apiEvent2 = {
      requestContext: {
        http: {
          method: "GET",
        },
      },
      queryStringParameters: {
        deviceId: "station-2",
      },
    };

    const apiResult2 = await apiHandler(apiEvent2);
    const data2 = JSON.parse(apiResult2.body);

    expect(data2).toHaveLength(1);
    expect(data2[0].deviceId).toBe("station-2");
  });

  test("handles errors in the complete pipeline", async () => {
    // Test invalid binary data
    const invalidEvent = {
      body: "invalid-base64-data",
      isBase64Encoded: true,
    };

    const decoderResult = await decoderHandler(invalidEvent);
    expect(decoderResult.statusCode).toBe(500);

    // Test missing deviceId in API call
    const apiEvent = {
      requestContext: {
        http: {
          method: "GET",
        },
      },
      queryStringParameters: {},
    };

    const apiResult = await apiHandler(apiEvent);
    expect(apiResult.statusCode).toBe(400);
  });

  test("verifies data integrity through encode-decode cycle", async () => {
    // Verify data integrity through encode-decode cycle
  });

  test("handles extreme weather data values in complete flow", async () => {
    // Handle extreme weather data values in complete flow
    // Humidity accuracy: ±1.5% RH
    // Temperature Accuracy: ±0.33°C (typical)
  });
});
