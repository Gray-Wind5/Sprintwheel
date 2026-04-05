import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export const BurndownChartUI = ({ data }: { data: any[] }) => (
    <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}
            margin={{ top: 20, right: 30, left: 15, bottom: 20 }}
        >
            <CartesianGrid stroke="aaa" />
            <XAxis dataKey="day"
                label={{
                    value: "Sprint Day", 
                    position: "insideBottom", 
                    offset: -15
                }} />
            <YAxis width="auto"
                label={{ 
                value: "Remaining Points", 
                position: "insideLeft", 
                angle: -90,
                textAnchor: "middle",
            }} />
            <Tooltip />
            <ReferenceLine
                //x={today}
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
                }} />
            <Line 
                type="monotone" 
                dataKey="ideal" 
                stroke="#10b981" 
                strokeDasharray="5 5" 
                name="Ideal" 
            />
            <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#7C4DFF"
                //stroke="#8E5CF6"
                //stroke="#A855F7"
                strokeWidth={3} 
                connectNulls={false}
                name="Remaining Points" 
            />
        </LineChart>
    </ResponsiveContainer>
);