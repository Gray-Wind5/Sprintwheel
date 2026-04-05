import React from "react";
import {CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from "recharts";
// import { RechartsDevtools } from "@recharts/devtools";

const mockData = [
    { date: "Day 1: Jan 1", remaining: 50 },
    { date: "Day 2: Jan 2", remaining: 48 },
    { date: "Day 3: Jan 3", remaining: 38 },
    { date: "Day 4: Jan 4", remaining: 35 },
    { date: "Day 5: Jan 5", remaining: 28 },
    { date: "Day 6: Jan 6", remaining: 25 },
    { date: "Day 7: Jan 7", remaining: 21 },
];

// TODO: WILL WANT TO AUTOCALC THIS
const today = "Day 4: Jan 4";

interface BurndownPoint {
    date: string;
    remaining: number;
}

export default function SprintBurndownChart() {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <LineChart 
                data={mockData}
                margin={{ top: 20, right: 30, left: 15, bottom: 20 }}
            >
                <CartesianGrid stroke="aaa" />

                <XAxis dataKey="date" 
                    label={{ 
                        value: "Sprint Day", 
                        position: "insideBottom", 
                        offset: -10 
                    }} />
                <YAxis width="auto" 
                    label={{ 
                        value: "Remaining Points", 
                        position: "insideLeft", 
                        angle: -90,
                        textAnchor: "middle",
                    }} />

                <ReferenceLine
                    x={today}
                    stroke="#8016c1"
                    strokeDasharray="4 4"
                    label={{
                        value: "Today",
                        position: "insideTop",
                        offset: 10,
                        fill: "#8016c1",
                        fontSize: 12,
                        textAnchor: "start",
                        dx: 5,
                    }}
                />

                <Line
                    type="monotone"
                    dataKey="remaining"
                    stroke="#560b8e"
                    strokeWidth={2}
                    name="Remaining Points"
                />
                <Tooltip />
            </LineChart>
        </ResponsiveContainer>
    );
}

