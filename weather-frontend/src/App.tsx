import { useEffect, useState } from "react";
import axios from "axios";

import Header from "./components/Header";
import Button from "./components/Button";
import PollingSwitch from "./components/PollingSwitch";
import DeviceDropdown from "./components/DeviceDropdown";
import DataTable from "./components/DataTable";
import LineChartComponent from "./components/LineChartComponent";

export type WeatherData = {
  deviceId: string;
  timestamp: number;
  temperature: number;
  humidity: number;
};

const API_BASE = import.meta.env.VITE_WEATHER_API_URL;

const deviceIds = [
  "simulated-station-1",
  "simulated-station-2",
  "simulated-station-3",
  "simulated-station-4",
  "simulated-station-5",
];

function App() {
  const [data, setData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deviceId, setDeviceId] = useState(deviceIds[0]);
  const [unit, setUnit] = useState<"C" | "F">("C");
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<WeatherData[]>(
          `${API_BASE}?deviceId=${deviceId}`
        );
        console.log(response.data);
        setData(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load weather data." + err);
        setLoading(false);
      }
    };

    fetchData();

    if (!polling) return;

    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, [deviceId, polling]);

  const convertTemp = (c: number) => (unit === "C" ? c : (c * 9) / 5 + 32);

  const handleExport = () => {
    if (!data.length) return;

    const headers = ["timestamp", "temperature(°C)", "humidity(%)"];
    const rows = data.map((entry) => [
      new Date(entry.timestamp * 1000).toISOString(),
      entry.temperature.toFixed(2),
      entry.humidity.toFixed(2),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${deviceId}_weather_data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto font-sans">
      <Header header="🌤️ Weather Station Dashboard" />

      <div className="flex flex-col md:flex-row items-center gap-4 mb-6 justify-between">
        <DeviceDropdown
          deviceId={deviceId}
          setDeviceId={setDeviceId}
          deviceIds={deviceIds}
        />

        <div className="flex flex-row gap-4">
          <Button
            onClick={() => setUnit(unit === "C" ? "F" : "C")}
            className="block text-black border border-black px-4 py-2 rounded transition"
          >
            Show in °{unit === "C" ? "F" : "C"}
          </Button>

          <Button
            onClick={handleExport}
            className="block text-black border border-black px-4 py-2 rounded transition"
          >
            Download CSV
          </Button>

          <PollingSwitch polling={polling} setPolling={setPolling} />
        </div>
      </div>

      {loading && <p>Loading data...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <>
          <DataTable data={data} unit={unit} convertTemp={convertTemp} />

          <h2 className="text-lg font-semibold mb-4">📈 Live Data Charts</h2>
          <div className="grid grid-cols- md:grid-cols-2 gap-6 mb-10">
            <LineChartComponent
              data={data}
              unit={unit}
              convertTemp={convertTemp}
              header="Temperature"
              legendX="LM92s"
              dataKey="temperature"
              strokeColor="#ff7300"
            />

            <LineChartComponent
              data={data}
              unit={unit}
              convertTemp={convertTemp}
              header="Humidity"
              legendX="DHT22"
              dataKey="humidity"
              strokeColor="#387908"
            />
          </div>
        </>
      )}
    </div>
  );
}

export default App;
