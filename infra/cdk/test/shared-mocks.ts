// Shared mock setup for DynamoDB that can be used across all tests

export const mockSend = jest.fn();

// Mock AWS SDK before any imports
jest.mock("@aws-sdk/client-dynamodb", () => ({
  DynamoDBClient: jest.fn(() => ({
    send: mockSend,
  })),
  PutItemCommand: jest.fn((input) => ({ input, commandType: "PutItem" })),
  QueryCommand: jest.fn((input) => ({ input, commandType: "Query" })),
}));

export function setupDynamoMocks() {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup environment
    process.env.TABLE_NAME = "test-weather-table";

    // Default mock implementation - can be overridden in individual tests
    mockSend.mockResolvedValue({});
  });
}

export function createStorageMock() {
  const storedData: any[] = [];

  mockSend.mockImplementation((command) => {
    // Handle PutItemCommand
    if (
      command.commandType === "PutItem" &&
      command.input &&
      command.input.Item
    ) {
      const item = {
        deviceId: command.input.Item.deviceId.S,
        timestamp: parseInt(command.input.Item.timestamp.N),
        temperature: parseFloat(command.input.Item.temperature.N),
        humidity: parseFloat(command.input.Item.humidity.N),
      };
      storedData.push(item);
      return Promise.resolve({});
    }

    // Handle QueryCommand
    if (
      command.commandType === "Query" &&
      command.input &&
      command.input.KeyConditionExpression
    ) {
      const deviceId = command.input.ExpressionAttributeValues[":deviceId"].S;
      const matchingItems = storedData
        .filter((item) => item.deviceId === deviceId)
        .sort((a, b) => b.timestamp - a.timestamp) // Descending order
        .slice(0, command.input.Limit || 100)
        .map((item) => ({
          deviceId: { S: item.deviceId },
          timestamp: { N: item.timestamp.toString() },
          temperature: { N: item.temperature.toString() },
          humidity: { N: item.humidity.toString() },
        }));

      return Promise.resolve({ Items: matchingItems });
    }

    return Promise.resolve({});
  });

  return storedData;
}
