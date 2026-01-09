import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Scatter } from 'react-chartjs-2';

// Register components for Line/Scatter charts
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

/**
 * A collection of specific visualization components for Physics chapters.
 * These can be rendered inside the modal.
 */

export const PhotoelectricGraph = () => {
    // KE vs Frequency
    const data = {
        datasets: [
            {
                label: 'Kinetic Energy (Kmax)',
                data: [{ x: 1, y: 0 }, { x: 5, y: 8 }], // Pseudo-data for line
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                segment: {
                    borderDash: (ctx) => ctx.p0.parsed.x < 1 ? [6, 6] : undefined, // Dashed for extrapolation
                }
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            title: { display: true, text: 'Kmax vs Frequency' },
            legend: { display: false }
        },
        scales: {
            x: {
                type: 'linear',
                position: 'bottom',
                title: { display: true, text: 'Frequency (v)' },
                min: 0,
                max: 6
            },
            y: {
                title: { display: true, text: 'Kmax' },
                min: -2,
                max: 10
            }
        }
    };

    // Using Scatter to draw specific lines is often easier for physics graphs than 'Line' with categories
    // For simplicity, returning a conceptual component placeholder text or simple chart
    return (
        <div className="bg-white p-4 rounded-xl border border-slate-200">
            <h4 className="text-sm font-bold text-slate-700 mb-2">Einstein's Equation</h4>
            <div className="h-48 w-full flex items-center justify-center bg-slate-50 text-slate-400 text-xs">
                (Graph of Kmax = hv - Φ would render here)
            </div>
        </div>
    );
};

export const RCCircuitGraph = () => {
    const labels = Array.from({ length: 20 }, (_, i) => i);
    const data = {
        labels,
        datasets: [
            {
                label: 'Charge (q)',
                data: labels.map(t => 10 * (1 - Math.exp(-t / 5))), // q = q0(1 - e^-t/RC)
                borderColor: 'rgb(255, 99, 132)',
                tension: 0.4,
                fill: false
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            title: { display: true, text: 'Capacitor Charging' }
        },
        scales: {
            y: { title: { display: true, text: 'Charge (q)' } },
            x: { title: { display: true, text: 'Time (t)' } }
        }
    };

    return (
        <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="h-48 w-full">
                <Line data={data} options={options} />
            </div>
        </div>
    );
};
