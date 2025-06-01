import fs from "fs";
import path from "path";

const OUTPUT_FILE = path.join(__dirname, "simulated_payloads.json");
const NUM_ENTRIES = 500;
const deviceIds = [
  "simulated-station-1",
  "simulated-station-2",
  "simulated-station-3",
  "simulated-station-4",
  "simulated-station-5",
];

const data = [];

for (let i = 0; i < NUM_ENTRIES; i++) {
  const deviceId = deviceIds[Math.floor(Math.random() * deviceIds.length)];
  const timestamp = Math.floor(Date.now() / 1000) + i;
  const temperature = parseFloat((Math.random() * 15 + 10).toFixed(2));
  const humidity = parseFloat((Math.random() * 40 + 40).toFixed(2));

  data.push({ deviceId, timestamp, temperature, humidity });
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
console.log(
  `✅ Wrote ${NUM_ENTRIES} JSON entries with deviceIds to ${OUTPUT_FILE}`
);
