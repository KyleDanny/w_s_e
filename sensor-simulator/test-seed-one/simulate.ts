import fs from "fs";
import path from "path";
import { encodeWeatherData } from "../encode";

/**
 * Generates a single simulated data point
 */
function generateFakeReading() {
  const timestamp = Math.floor(Date.now() / 1000); // Current UNIX time
  const temperature = (Math.random() * 15 + 10).toFixed(2); // 10–25°C
  const humidity = (Math.random() * 40 + 40).toFixed(2); // 40–80% RH

  return {
    deviceId: "simulated-station-1",
    timestamp,
    temperature: parseFloat(temperature),
    humidity: parseFloat(humidity),
  };
}

/**
 * Write simulated binary payload to file or stdout
 */
function runSimulation() {
  const reading = generateFakeReading();
  const encoded = encodeWeatherData(reading);

  console.log(`Simulated reading: ${JSON.stringify(reading)}`);

  const filePath = path.join(__dirname, "last-reading.bin");
  fs.writeFileSync(filePath, encoded);

  console.log(`Saved binary data to ${filePath}`);
}

runSimulation();
// bun run simulate.ts
