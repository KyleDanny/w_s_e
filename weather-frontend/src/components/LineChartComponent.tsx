import { CartesianGrid, Legend, Line, Tooltip, XAxis, YAxis } from "recharts";

import { LineChart } from "recharts";

import { ResponsiveContainer } from "recharts";
import type { WeatherData } from "../App";

const LineChartComponent = ({
  data,
  unit,
  convertTemp,
  header,
  legendX,
  dataKey,
  strokeColor,
}: {
  data: WeatherData[];
  unit: "C" | "F";
  convertTemp: (c: number) => number;
  header: string;
  legendX: string;
  dataKey: string;
  strokeColor: string;
}) => {
  return (
    <div className="bg-white rounded shadow p-4">
      <h3 className={`text-md font-semibold mb-2 text-${strokeColor}`}>
        {header} (°{unit})
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data.slice().reverse()}>
          <XAxis
            dataKey="timestamp"
            tickFormatter={(t) => new Date(t * 1000).toLocaleTimeString()}
          />
          <YAxis />
          <Tooltip
            labelFormatter={(label) => new Date(label * 1000).toLocaleString()}
            formatter={(value: number) =>
              `${convertTemp(value).toFixed(2)}°${unit}`
            }
          />
          <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
          <Legend />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={strokeColor}
            name={legendX}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChartComponent;
