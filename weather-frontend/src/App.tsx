import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

type WeatherData = {
  timestamp: number;
  temperature: number;
  humidity: number;
};

const API_BASE =
  "https://qe48lv1o1l.execute-api.eu-north-1.amazonaws.com/weather";

const deviceIds = [
  "simulated-station-1",
  "simulated-station-2", // Add more if needed
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
        setData(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load weather data." + err);
        setLoading(false);
      }
    };

    fetchData(); // initial fetch

    if (!polling) return;

    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [deviceId, polling]); // ⬅ include polling in dependency list

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
      <h1 className="text-2xl font-bold mb-4 text-center">
        🌤️ Weather Station Dashboard
      </h1>

      <div className="flex flex-col md:flex-row items-center gap-4 mb-6 justify-between">
        <div>
          <label className="mr-2 font-medium">Select Device:</label>
          <select
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            className="border p-2 rounded"
          >
            {deviceIds.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-row gap-4">
          <div>
            <button
              onClick={() => setUnit(unit === "C" ? "F" : "C")}
              className="bg-blue-500 text-black px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              Show in °{unit === "C" ? "F" : "C"}
            </button>
          </div>
          <div>
            <button
              onClick={handleExport}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              Download CSV
            </button>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <span className="font-medium">Auto-Refresh:</span>
              <button
                onClick={() => setPolling(!polling)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                  polling ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                    polling ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <span className="text-sm text-gray-600">
                {polling ? "On (30s)" : "Off"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {loading && <p>Loading data...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <>
          <div className="overflow-auto rounded shadow mb-6">
            <table className="min-w-full bg-white text-sm">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Temperature (°{unit})</th>
                  <th className="p-3">Humidity (%)</th>
                </tr>
              </thead>
              <tbody>
                {data.map((entry, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    <td className="p-3">
                      {new Date(entry.timestamp * 1000).toLocaleString()}
                    </td>
                    <td className="p-3">
                      {convertTemp(entry.temperature).toFixed(2)}
                    </td>
                    <td className="p-3">{entry.humidity.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="text-lg font-semibold mb-4">📈 Live Data Charts</h2>
          <div className="grid grid-cols- md:grid-cols-2 gap-6 mb-10">
            {/* Temperature Chart */}
            <div className="bg-white rounded shadow p-4">
              <h3 className="text-md font-semibold mb-2 text-orange-600">
                Temperature (°{unit})
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data.slice().reverse()}>
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(t) =>
                      new Date(t * 1000).toLocaleTimeString()
                    }
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(label) =>
                      new Date(label * 1000).toLocaleString()
                    }
                    formatter={(value: number) =>
                      `${convertTemp(value).toFixed(2)}°${unit}`
                    }
                  />
                  <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="temperature"
                    stroke="#ff7300"
                    name="LM92s Temperature"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Humidity Chart */}
            <div className="bg-white rounded shadow p-4">
              <h3 className="text-md font-semibold mb-2 text-green-700">
                Humidity (%)
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data.slice().reverse()}>
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(t) =>
                      new Date(t * 1000).toLocaleTimeString()
                    }
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(label) =>
                      new Date(label * 1000).toLocaleString()
                    }
                    formatter={(value: number) => `${value.toFixed(2)}%`}
                  />
                  <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="humidity"
                    stroke="#387908"
                    name="DHT22 Humidity"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
