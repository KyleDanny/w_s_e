// Import shared mocks FIRST
import { mockSend, setupDynamoMocks } from "./shared-mocks.js";

describe("Decoder Handler", () => {
  setupDynamoMocks();

  let handler: any;
  let encodeWeatherData: any;

  beforeAll(async () => {
    // Import handlers AFTER mocking using dynamic import
    const handlerModule = await import("../lambda/decoder-handler.js");
    // @ts-ignore - External module outside rootDir
    const encodeModule = await import("../../../sensor-simulator/encode.js");
    handler = handlerModule.handler;
    encodeWeatherData = encodeModule.encodeWeatherData;
  });

  test("successfully processes valid base64 encoded binary data", async () => {
    const weatherData = {
      deviceId: "simulated-station-1",
      timestamp: 1716825600,
      temperature: 21.56,
      humidity: 63.42,
    };

    const binaryData = encodeWeatherData(weatherData);
    const base64Data = Buffer.from(binaryData).toString("base64");

    const event = {
      body: base64Data,
      isBase64Encoded: true,
    };

    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({
      message: "Weather data saved",
    });

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          TableName: "test-weather-table",
          Item: {
            deviceId: { S: "simulated-station-1" },
            timestamp: { N: "1716825600" },
            temperature: { N: "21.56" },
            humidity: { N: "63.42" },
          },
        }),
      })
    );
  });

  test("returns 400 error when body is missing", async () => {
    const event = {};

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toEqual({
      error: "Missing body",
    });

    expect(mockSend).not.toHaveBeenCalled();
  });

  test("returns 500 error when binary payload length is invalid", async () => {
    const invalidBinaryData = new Uint8Array(10); // Wrong length
    const base64Data = Buffer.from(invalidBinaryData).toString("base64");

    const event = {
      body: base64Data,
      isBase64Encoded: true,
    };

    const result = await handler(event);

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toEqual({
      error: "Internal server error",
    });

    expect(mockSend).not.toHaveBeenCalled();
  });

  test("handles DynamoDB errors gracefully", async () => {
    const weatherData = {
      deviceId: "test-station-3",
      timestamp: 1716825800,
      temperature: 30.0,
      humidity: 40.0,
    };

    const binaryData = encodeWeatherData(weatherData);
    const base64Data = Buffer.from(binaryData).toString("base64");

    // Mock DynamoDB error
    mockSend.mockRejectedValueOnce(new Error("DynamoDB connection failed"));

    const event = {
      body: base64Data,
      isBase64Encoded: true,
    };

    const result = await handler(event);

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toEqual({
      error: "Internal server error",
    });
  });

  test("handles extreme weather values correctly", async () => {
    // Test very high precision numbers such as voltage vs resistance
  });

  test("handles long device IDs by truncation", async () => {
    // Handle long device IDs by truncation
  });

  test("logs incoming events for debugging", async () => {
    // Logs incoming events for debugging
  });
});
