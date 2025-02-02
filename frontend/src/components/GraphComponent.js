import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend } from 'chart.js';
import '../static/css/StepStyles.css';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const GraphComponent = ({ balanceData, revenueData }) => {
    if (!balanceData.length) return null;

    const datasets = [
        {
            label: 'Balance Projection',
            data: balanceData.map(data => data.balance),
            borderColor: '#14FFEC',
            backgroundColor: 'rgba(20, 255, 236, 0.2)',
            pointRadius: 5,
            pointBackgroundColor: '#14FFEC',
            fill: false,
        }
    ];

    if (revenueData.length > 0) {
        datasets.push({
            label: 'Projected Revenue',
            data: revenueData.map(data => data.projected_balance),
            borderColor: '#FFA500',
            backgroundColor: 'rgba(255, 165, 0, 0.2)',
            pointRadius: 5,
            pointBackgroundColor: '#FFA500',
            fill: false,
        });
    }

    const data = {
        labels: balanceData.map(data => data.year),
        datasets: datasets
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
            tooltip: {
                backgroundColor: 'rgba(30, 30, 30, 0.9)', /* Dark background */
                titleColor: '#ffffff', /* White title */
                bodyColor: '#ffffff', /* White text */
                borderColor: '#14FFEC', /* Light blue border */
                borderWidth: 1,
                cornerRadius: 6,
                padding: 10,
                displayColors: false /* Hides the color box in tooltips */
            }
        }
    };

    return (
        <div className="graph-container">
            <h3>Balance & Revenue Projection</h3>
            <div className="graph-wrapper">
                <Line data={data} options={options} />
            </div>
        </div>
    );
};

export default GraphComponent;
