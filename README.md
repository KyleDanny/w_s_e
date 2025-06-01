# 🌦️ Weather Station Simulation — IoT to Web Dashboard

This project simulates live binary-encoded weather data from multiple IoT weather stations and sends it to an AWS API. The API decodes the payload and stores the data in DynamoDB. It’s built for edge simulation and serverless cloud ingestion. The data is then displayed from the api-endpoint dynamically on a simple frontend facing application.

---

## 🛠 Tech Stack

- **Simulator**: Node.js (Bun), binary encoding/decoding, seeded payloads
- **Backend**: AWS CDK (TypeScript), Lambda, API Gateway (HTTP API v2), DynamoDB
- **Frontend**: React + TypeScript (Vite) with TailwindCSS, Recharts

## 📦 Project Structure

```
.
├── diagram                 # Visual idea of how the wind farm functions
├── infra/cdk/              # AWS infrastructure (CDK)
  ├──> infra/cdk/lambda/    # Weather + API handlers
├── sensor-simulator/       # Simulated binary data + streamer
├── weather-frontend/       # React app (Vite)
```

# Simulator /sensor-simulator

- `generate-seeded-data.ts` — Seed a json payload of weather data for 5 x stations
- `encode.ts` — Encode weather data (binary format)
- `simulated_payloads.json` — List of weather readings for simulation per station
- `simulator.ts` — Encodes, and sends data as binary payloads (live or local mode)

# Backend /infra/CDK

- `decode.ts` — Decode weather data (binary format)
- `decoder-handler.ts` — Lambda function to process binary payloads on events
- `api-handler.ts` — Lambda to expose GET endpoint for frontend
- `iot-processor-stack.ts` — CDK stack to provision API Gateway, Lambdas, and DynamoDB

# Frontend /weather-frontend

- `App.tsx` — Display data from API using a component-like modular approach in a dynamic manner (polling for live data)

---

## 🔧 Features

- Sends real-time weather sensor data (temperature, humidity, timestamp) from a simulator via POST
- Encoded as `Uint8Array` using custom binary protocol

- Decoded and persisted via Lambda to DynamoDB
- Fully deployable with AWS CDK

- Frontend-friendly `GET /weather?deviceId=...` endpoint
- Live-updating weather dashboard for temperature & humidity
- Toggleable auto-polling of data every second
- Unit toggle: °C ↔ °F
- Filter by device (up to 5 simulated devices)
- Export table to CSV
- Simulation system generates realistic sensor readings

---

## 🌱 Running the Simulation

Generate binary payloads from /sensor-simlator:

```bash
cd sensor-simulator
bun install
bun run generate-seeded-data
bun run simulate:local    # Simulate sending data locally (console only)
bun run simulate:live     # Simulate sending data to live API (first run: /infra/cdk):
```

---

## 🌍 Deploying stack to AWS and DynamoDB config

```bash
cd infra/cdk
bun install
bun run build-decoder-handler   # Bundle the decoder handler
bun run build-api-handler       # Bundle the API handler
npx cdk deploy                  # OR Bundle both of the above, and deploy
```

---

## 🦾 Running the frontend

```bash
cd weather-frontend
bun install
bun run dev
```

---

## 🚩 Key Challenges & Solutions

### ⚠️ `Multiple lock files found` during `cdk bootstrap`

**Cause**: Both `bun.lockb` and `package-lock.json` existed.  
**Solution**: Migrated over to bunlock files.

---

### ❌ `deviceId` empty in DynamoDB / decoder Lambda

- **Cause:** `Uint8Array` sent directly via Axios was misinterpreted by API Gateway
- **Fix:** Used `Buffer.from(...).toString('base64')` and enabled `isBase64Encoded` in the Lambda

---

### ❌ Lambda returns `Invalid binary payload length: 28`

- **Cause:** Mismatched encoding between `simulator.ts` and `simulate.ts`
- **Fix:** Ensured both encode with `encodeWeatherData` and decode 28-byte buffers (timestamp, temp, humidity, deviceId)

---

### ❌ 404 / 400 / 500 Errors from API Gateway

- **Cause:** Route not matching due to missing headers or incorrect handler config
- **Fixes:**
  - Set `x-device-id` header in simulator
  - Used correct handler names (`index.handler`)
  - Corrected `content-type` to `application/octet-stream`
  - Deployed updated CDK stack with binary media type support
  - Updated API payload and seeded data generator to include `deviceId`

---

### ❌ Docker build failed: `invalid reference format`

**Solution**: Moved away from default use of docker, and use esbuild instead to create dist builds that could be used instead.

---

### ❌ Tailwind not working in frontend

**Cause**: Misconfigured PostCSS or missing directives.  
**Solution**: Followed [Tailwind Vite setup](https://tailwindcss.com/docs/installation/using-vite) precisely, ensured `@tailwind base/components/utilities` were imported.

---

### ❌ Lambda POST API returning 404 or missing `deviceId`

**Cause**: Only GET was configured in API Gateway.  
**Solution**: Added support for POST route, updated Lambda handler to parse JSON body.

---

### ❌ DynamoDB PutItem permission denied

**Solution**: Added `table.grantWriteData()` to the POST Lambda in the CDK stack.

---

## 📊 Example API

**GET:**

```
GET /weather?deviceId=simulated-station-1
```

**POST:**

```
POST /upload
```

```json
{
  "deviceId": "simulated-station-1",
  "timestamp": 1717092075,
  "temperature": 22.1,
  "humidity": 55.2
}
```

---

## 📦 Payload Format

timestamp: 4 bytes (Uint32)

temperature: 2 bytes (Int16, multiplied by 100)

humidity: 2 bytes (Uint16, multiplied by 100)

deviceId: 20 bytes, encoded using TextEncoder and padded/truncated to fixed length

---

## 🧠 Final Notes

- The system simulates real-world IoT latency, encoding, and ingestion.
- Payload format = 4 bytes timestamp + 2 bytes temp + 2 bytes humidity + 20 bytes deviceId
- Focus was placed on optimizing developer experience, clear data flow, and realistic frontend behavior.
- Binary data is base64-encoded for API Gateway compatibility
- DynamoDB uses deviceId as partition key and timestamp as sort key

---

## 👨‍💻 Author

Kyle Danny  
Weather Station Simulation Project — 2025
