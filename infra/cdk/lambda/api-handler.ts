import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";

const db = new DynamoDBClient({});

export const handler = async (event: any) => {
  const deviceId = event.queryStringParameters?.deviceId;

  if (!deviceId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing deviceId" }),
    };
  }

  const result = await db.send(
    new QueryCommand({
      TableName: process.env.TABLE_NAME!,
      KeyConditionExpression: "deviceId = :deviceId",
      ExpressionAttributeValues: {
        ":deviceId": { S: deviceId },
      },
      ScanIndexForward: false, // newest first
      Limit: 100,
    })
  );

  const items = (result.Items || []).map((item) => ({
    timestamp: Number(item.timestamp.N),
    temperature: Number(item.temperature.N),
    humidity: Number(item.humidity.N),
  }));

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(items),
  };
};
