import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Monitor, Tablet, Smartphone, Bot } from 'lucide-react';

const DeviceChart = ({ data = {} }) => {
  const deviceColors = {
    mobile: '#3B82F6',
    tablet: '#8B5CF6', 
    desktop: '#10B981',
    bot: '#F59E0B'
  };

  const deviceIcons = {
    mobile: Smartphone,
    tablet: Tablet,
    desktop: Monitor,
    bot: Bot
  };

  const chartData = Object.entries(data).map(([device, count]) => ({
    name: device.charAt(0).toUpperCase() + device.slice(1),
    value: count,
    color: deviceColors[device] || '#6B7280',
    icon: deviceIcons[device] || Monitor
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const Icon = data.payload.icon;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4" style={{ color: data.payload.color }} />
            <span className="font-medium">{data.name}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {data.value} scans ({((data.value / chartData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = (props) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-sm font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (!chartData.length) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-xl border border-gray-200">
        <p className="text-gray-500">No device data available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry) => (
              <div className="flex items-center gap-2">
                <entry.payload.icon className="w-4 h-4" style={{ color: entry.color }} />
                <span>{entry.payload.name}</span>
              </div>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DeviceChart;
