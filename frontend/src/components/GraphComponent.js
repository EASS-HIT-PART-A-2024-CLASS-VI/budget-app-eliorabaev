import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend } from 'chart.js';
import '../static/css/StepStyles.css';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const GraphComponent = ({ graphData, title, color }) => {
    if (!graphData.length) return null;

    const data = {
        labels: graphData.map(data => data.year),
        datasets: [
            {
                label: title,
                data: graphData.map(data => data.balance ?? data.projected_balance),
                borderColor: color,
                backgroundColor: `${color}33`,
                pointRadius: 5,
                pointBackgroundColor: color,
                fill: true,
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: false,
                grid: { color: 'rgba(255, 255, 255, 0.2)' },
                ticks: { color: '#ffffff' }
            },
            x: {
                grid: { color: 'rgba(255, 255, 255, 0.2)' },
                ticks: { color: '#ffffff' }
            }
        },
        plugins: {
            legend: { labels: { color: '#ffffff' } },
            tooltip: { backgroundColor: color }
        }
    };

    return (
        <div className="graph-container">
            <h3>{title}</h3>
            <div className="graph-wrapper">
                <Line data={data} options={options} />
            </div>
        </div>
    );
};

export default GraphComponent;
