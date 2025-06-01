import { encodeWeatherData } from "./encode";
import { decodeWeatherData } from "../infra/cdk/lambda/decode";

test("encodes and decodes weather data correctly", () => {
  const input = {
    deviceId: "simulated-station-1",
    timestamp: 1716825600,
    temperature: 21.56,
    humidity: 63.42,
  };

  const binary = encodeWeatherData(input);
  const output = decodeWeatherData(binary);

  expect(output).toEqual({
    timestamp: input.timestamp,
    temperature: parseFloat(input.temperature.toFixed(2)),
    humidity: parseFloat(input.humidity.toFixed(2)),
  });
});
