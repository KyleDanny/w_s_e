import fs from "fs";
import path from "path";
import axios from "axios";

const args = process.argv.slice(2);
const mode = args.includes("--mode=live") ? "live" : "local";

// const API_URL = `https://qe48lv1o1l.execute-api.eu-north-1.amazonaws.com/weather`;
const payloads: any[] = JSON.parse(
  fs.readFileSync(path.join(__dirname, "simulated_payloads.json"), "utf-8")
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
    try {
      await axios.post(process.env.API_URL, payload);
      console.log(`✅ Sent to API: ${JSON.stringify(payload)}`);
    } catch (error) {
      console.error("❌ API Error:", (error as any).message);
    }
  } else {
    console.log(`🔁 Simulated MQTT -> ${JSON.stringify(payload)}`);
  }

  index++;
}, 1000);
