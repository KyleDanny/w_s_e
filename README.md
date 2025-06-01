# 🌦️ Weather Station Simulation — IoT to Web Dashboard

This project simulates an end-to-end IoT pipeline: weather stations generate binary-encoded data and send it to an AWS backend via HTTP (or optionally MQTT). The data is visualized on a live-updating React dashboard.

---

## 🛠 Tech Stack

- **Frontend**: React + TypeScript (Vite) with TailwindCSS, Recharts
- **Backend**: AWS CDK (TypeScript), Lambda, API Gateway (HTTP API v2), DynamoDB
- **Simulator**: Node.js (Bun), binary encoding/decoding, seeded payloads

---

## 🔧 Features

- 📈 Live-updating weather dashboard for temperature & humidity
- ⏱ Toggleable auto-polling of data every second
- 🌡 Unit toggle: °C ↔ °F
- 🧭 Filter by device (up to 5 simulated devices)
- 📥 Export table to CSV
- 🧪 Simulation system generates realistic sensor readings

---

## 📦 Project Structure

```
.
├── frontend/                # React app (Vite)
├── sensor-simulator/       # Simulated binary data + streamer
├── infra/cdk/              # AWS infrastructure (CDK)
├── lambda/                 # Weather + API handlers
```

---

## 🧪 Running the Simulation

Generate binary payloads:

```bash
bun run generate-seeded-data
```

Simulate sending data locally (console only):

```bash
bun run simulator.ts
```

Simulate sending data to live API:

```bash
bun run simulator.ts --mode=live
```

---

## 🌍 Deploying to AWS

```bash
cd infra/cdk
bun run build-api-handler       # Bundle the API handler
bun run build-decoder-handler   # Bundle the decoder handler
npx cdk deploy
```

---

## 🚩 Key Challenges & Solutions

### ❌ `cdk init` failed in non-empty directory

**Solution**: Moved CDK files to a dedicated subdirectory (`infra/cdk`).

---

### ⚠️ `Multiple lock files found` during `cdk bootstrap`

**Cause**: Both `bun.lockb` and `package-lock.json` existed.  
**Solution**: Set `depsLockFilePath` explicitly or remove the unused lock file.

---

### ❌ Docker build failed: `invalid reference format`

**Solution**: Corrected bundling image command and ensured proper quoting around file paths.

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

### 📈 Chart layout not side-by-side

**Solution**: Used Tailwind grid layout (`grid-cols-1 md:grid-cols-2`) and tweaked responsiveness.

---

### 🧪 Binary simulator lacked `deviceId`

**Solution**: Updated API payload and seeded data generator to include `deviceId`.

---

## 📊 Example API

**GET:**

```
GET /weather?deviceId=simulated-station-1
```

**POST:**

```json
{
  "deviceId": "simulated-station-1",
  "timestamp": 1717092075,
  "temperature": 22.1,
  "humidity": 55.2
}
```

---

## 🧠 Final Notes

- The system simulates real-world IoT latency, encoding, and ingestion.
- Focus was placed on optimizing developer experience, clear data flow, and realistic frontend behavior.
- Seeded binary data was used to mimic 1-year device logs.

---

## 👨‍💻 Author

Kyle Danny  
Weather Station Simulation Project — 2025
