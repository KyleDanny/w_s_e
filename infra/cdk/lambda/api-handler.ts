import {
  DynamoDBClient,
  // PutItemCommand,
  QueryCommand,
} from "@aws-sdk/client-dynamodb";

const db = new DynamoDBClient({});

export const handler = async (event: any) => {
  console.log("🚀 Incoming event:", JSON.stringify(event));

  let deviceId: string | undefined;

  try {
    const method = event.requestContext?.http?.method;
    // const isPost = method === "POST";
    const isGet = method === "GET";

    // if (isPost) {
    //   const body =
    //     typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    //   deviceId = event.queryStringParameters?.deviceId;

    //   if (!deviceId) throw new Error("Missing deviceId");

    //   const { timestamp, temperature, humidity } = body;

    //   await db.send(
    //     new PutItemCommand({
    //       TableName: process.env.TABLE_NAME!,
    //       Item: {
    //         deviceId: { S: deviceId },
    //         timestamp: { N: timestamp.toString() },
    //         temperature: { N: temperature.toString() },
    //         humidity: { N: humidity.toString() },
    //       },
    //     })
    //   );

    //   return {
    //     statusCode: 200,
    //     body: JSON.stringify({ message: "Data stored successfully" }),
    //   };
    // }

    if (isGet) {
      deviceId = event.queryStringParameters?.deviceId;

      if (!deviceId) throw new Error("Missing deviceId");

      const result = await db.send(
        new QueryCommand({
          TableName: process.env.TABLE_NAME!,
          KeyConditionExpression: "deviceId = :deviceId",
          ExpressionAttributeValues: {
            ":deviceId": { S: deviceId },
          },
          ScanIndexForward: false,
          Limit: 100,
        })
      );

      const items = (result.Items || []).map((item) => ({
        deviceId: item.deviceId.S,
        timestamp: Number(item.timestamp.N),
        temperature: Number(item.temperature.N),
        humidity: Number(item.humidity.N),
      }));

      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(items),
      };
    }

    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  } catch (err: any) {
    console.error("❌ Error in API handler:", err);

    return {
      statusCode: 400,
      body: JSON.stringify({ error: err.message || "Unknown error" }),
    };
  }
};
