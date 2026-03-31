import type { CSSProperties, JSX } from "react";
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import SprintBurndownChart from "../components/SprintBurndownChart";
import SidebarLayout from "../components/SidebarLayout";
import { useTheme } from "./ThemeContext";

export default function ProgressPage(): JSX.Element {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const containerStyle: CSSProperties = {
    padding: 40,
    minHeight: "100vh",
    background: isDark ? "#0b0f17" : "#f8fafc",
    color: isDark ? "white" : "#111827",
  };

  const chartWrapperStyle: CSSProperties = {
    padding: 40,
    marginTop: 16,
    borderRadius: 16,
    background: isDark ? "rgba(255,255,255,0.05)" : "rgba(17,24,39,0.04)",
    border: isDark
      ? "1px solid rgba(255,255,255,0.1)"
      : "1px solid rgba(17,24,39,0.1)",
  };

  return (
    <SidebarLayout>
      <div style={containerStyle}>
        <h1>Progress Page</h1>
        <p>This is the Progress page.</p>
        <p>This is where the Burndown Chart, Velocity Chart, & Sprint Report will live</p>

        <h2>Sprint #BLANK Burndown Chart</h2>
        <div style={chartWrapperStyle}>
          <SprintBurndownChart />
        </div>

        {/* Placeholder Recharts graph */}
        {/*
        <div style={{ marginTop: 20 }}>
          <LineChart
            width={800}
            height={350}
            data={testData}
            margin={{ top: 20, right: 30, left: 5, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="remaining" stroke="#ff4d4f" strokeWidth={2} name="Remaining Points" />
            <Line type="monotone" dataKey="ideal" stroke="#8884d8" strokeDasharray="5 5" name="Ideal" />
          </LineChart>
        </div>
        */}
      </div>
    </SidebarLayout>
  );
}
