import type { WeatherData } from "../App";

const DataTable = ({
  data,
  unit,
  convertTemp,
}: {
  data: WeatherData[];
  unit: "C" | "F";
  convertTemp: (c: number) => number;
}) => {
  return (
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
  );
};

export default DataTable;
