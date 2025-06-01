import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { decodeWeatherData } from "./decode";

const db = new DynamoDBClient({});

export const handler = async (event: any) => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing body" }),
      };
    }

    const isBase64Encoded = event.isBase64Encoded;
    console.log(">>> isBase64Encoded:", isBase64Encoded);

    const binaryBuffer = isBase64Encoded
      ? Buffer.from(event.body, "base64")
      : Buffer.from(event.body);

    if (binaryBuffer.length !== 28) {
      throw new Error(`Invalid binary payload length: ${binaryBuffer.length}`);
    }

    const uint8 = new Uint8Array(binaryBuffer);
    const weather = decodeWeatherData(uint8);

    console.log(">>> Decoding raw buffer:", uint8);
    console.log(">>> Decoded deviceId:", weather);

    // Store decoded data in DynamoDB
    await db.send(
      new PutItemCommand({
        TableName: process.env.TABLE_NAME!,
        Item: {
          deviceId: { S: weather.deviceId },
          timestamp: { N: weather.timestamp.toString() },
          temperature: { N: weather.temperature.toString() },
          humidity: { N: weather.humidity.toString() },
        },
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Weather data saved" }),
    };
  } catch (err) {
    console.error(">>> Failed to process binary data:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
