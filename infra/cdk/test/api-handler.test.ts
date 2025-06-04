// Import shared mocks FIRST
import { mockSend, setupDynamoMocks } from "./shared-mocks.js";

describe("API Handler", () => {
  setupDynamoMocks();

  let handler: any;

  beforeAll(async () => {
    // Import handlers AFTER mocking using dynamic import
    const module = await import("../lambda/api-handler.js");
    handler = module.handler;
  });

  describe("GET /weather", () => {
    test("successfully retrieves weather data for valid deviceId", async () => {
      // Mock successful query response
      mockSend.mockResolvedValueOnce({
        Items: [
          {
            deviceId: { S: "simulated-station-1" },
            timestamp: { N: "1716825600" },
            temperature: { N: "21.56" },
            humidity: { N: "63.42" },
          },
        ],
      });

      const event = {
        requestContext: {
          http: {
            method: "GET",
          },
        },
        queryStringParameters: {
          deviceId: "simulated-station-1",
        },
      };

      const result = await handler(event);

      expect(result.statusCode).toBe(200);
      expect(result.headers).toEqual({ "Content-Type": "application/json" });

      const responseBody = JSON.parse(result.body);
      expect(responseBody).toEqual([
        {
          deviceId: "simulated-station-1",
          timestamp: 1716825600,
          temperature: 21.56,
          humidity: 63.42,
        },
      ]);

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            TableName: "test-weather-table",
            KeyConditionExpression: "deviceId = :deviceId",
            ExpressionAttributeValues: {
              ":deviceId": { S: "simulated-station-1" },
            },
          }),
        })
      );
    });

    test("returns 400 error when deviceId is missing", async () => {
      const event = {
        requestContext: {
          http: {
            method: "GET",
          },
        },
        queryStringParameters: {},
      };

      const result = await handler(event);

      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body)).toEqual({
        error: "Missing deviceId",
      });

      expect(mockSend).not.toHaveBeenCalled();
    });

    test("returns empty array when no data found for deviceId", async () => {
      mockSend.mockResolvedValueOnce({
        Items: [],
      });

      const event = {
        requestContext: {
          http: {
            method: "GET",
          },
        },
        queryStringParameters: {
          deviceId: "non-existent-station",
        },
      };

      const result = await handler(event);

      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toEqual([]);
    });

    test("handles DynamoDB query errors gracefully", async () => {
      mockSend.mockRejectedValueOnce(new Error("DynamoDB connection failed"));

      const event = {
        requestContext: {
          http: {
            method: "GET",
          },
        },
        queryStringParameters: {
          deviceId: "simulated-station-1",
        },
      };

      const result = await handler(event);

      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body)).toEqual({
        error: "DynamoDB connection failed",
      });
    });

    test("handles null queryStringParameters", async () => {
      const event = {
        requestContext: {
          http: {
            method: "GET",
          },
        },
        queryStringParameters: null,
      };

      const result = await handler(event);

      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body)).toEqual({
        error: "Missing deviceId",
      });
    });
  });
});
