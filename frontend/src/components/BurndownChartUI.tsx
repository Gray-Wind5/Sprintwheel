import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
  } from "recharts";
  
  type BurndownPoint = {
    day: string;
    actual: number | null;
    ideal: number;
    isoDate: string;
  };
  
  const CustomAxisTick = (props: any) => {
    const { x, y, payload } = props;
    const [dayPart, datePart] = String(payload.value).split("|");
  
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={16} textAnchor="middle" fill="#666" fontSize={12} fontWeight={500}>
          <tspan x="0" dy="1.2em">
            {dayPart}
          </tspan>
          <tspan x="0" dy="1.2em">
            {datePart}
          </tspan>
        </text>
      </g>
    );
  };
  
  
  export const BurndownChartUI = ({ data }: { data: BurndownPoint[] }) => {  
    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 15, bottom: 35 }}>
          <CartesianGrid stroke="aaa" />
          <XAxis
            dataKey="day"
            tick={<CustomAxisTick />}
            label={{
              value: "Sprint Day",
              position: "insideBottom",
              offset: -30,
            }}
          />
          <YAxis
            width="auto"
            allowDecimals={false}
            label={{
              value: "Remaining Points",
              position: "insideLeft",
              angle: -90,
              textAnchor: "middle",
            }}
          />
          <Tooltip
            formatter={(value, name) => {
              if (name === "Ideal") return [Number(value).toFixed(1), name];
              return [value, name];
            }}
            labelFormatter={(label, payload) => {
              const point = payload?.[0]?.payload;
              return point?.isoDate ? `${String(label).replace("|", " ")} (${point.isoDate})` : label;
            }}
          />
    
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#7C4DFF"
            strokeWidth={3}
            connectNulls={false}
            name="Remaining Points"
          />
          <Line
            type="monotone"
            dataKey="ideal"
            stroke="#94A3B8"
            strokeDasharray="4 4"
            strokeWidth={2}
            dot={false}
            name="Ideal"
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };