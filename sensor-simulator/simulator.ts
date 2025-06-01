import fs from "fs";
import path from "path";
import axios from "axios";
import { encodeWeatherData } from "./encode";

const args = process.argv.slice(2);
const mode = args.includes("--mode=live") ? "live" : "local";

const payloads: any[] = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "seeding/simulated_payloads.json"),
    "utf-8"
  )
);

console.log(`📦 Loaded ${payloads.length} entries — mode: ${mode}`);

let index = 0;

const interval = setInterval(async () => {
  if (index >= payloads.length) {
    console.log("✅ Finished sending all entries");
    clearInterval(interval);
    return;
  }

  const payload = payloads[index];

  if (mode === "live") {
    const encoded = encodeWeatherData(payload); // returns Uint8Array

    try {
      await axios.post(`${process.env.API_URL}/upload`, encoded, {
        headers: {
          "Content-Type": "application/octet-stream",
        },
      });
      console.log(`✅ Sent to API: ${JSON.stringify(encoded)}`);
    } catch (error) {
      console.error("❌ API Error:", (error as any).message);
    }
  } else {
    console.log(`🔁 Simulated MQTT -> ${JSON.stringify(payload)}`);
  }

  index++;
}, 1000);
