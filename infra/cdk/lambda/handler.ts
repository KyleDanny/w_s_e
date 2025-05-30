import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { decodeWeatherData } from "./decode";

const db = new DynamoDBClient({});

export const handler = async (event: any) => {
  try {
    const binaryData = Buffer.from(event.body, "base64");
    const weather = decodeWeatherData(new Uint8Array(binaryData));

    const result = await db.send(
      new PutItemCommand({
        TableName: process.env.TABLE_NAME!,
        Item: {
          deviceId: { S: event.deviceId || "simulated-station-1" },
          timestamp: { N: weather.timestamp.toString() },
          temperature: { N: weather.temperature.toString() },
          humidity: { N: weather.humidity.toString() },
        },
      })
    );

    console.log("Weather data result", result);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Weather data saved" }),
    };
  } catch (err) {
    console.error("Failed to process weather data:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to process data" }),
    };
  }
};
