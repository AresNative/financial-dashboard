import React, { useState } from 'react';
import Chart from 'react-apexcharts';
import { TrendingUp, Calendar, DollarSign } from 'lucide-react';

export const InvestmentCalculator: React.FC = () => {
    const [weeklyContribution, setWeeklyContribution] = useState(1500);
    const [annualRate, setAnnualRate] = useState(4.25);
    const [weeks, setWeeks] = useState(52);
    const [initialAmount, setInitialAmount] = useState(0);

    const calculateProjection = () => {
        const weeklyRate = annualRate / 100 / 52;
        const results = [];
        let currentAmount = initialAmount;

        for (let week = 0; week <= weeks; week++) {
            if (week > 0) {
                currentAmount = currentAmount + weeklyContribution;
                currentAmount = currentAmount * (1 + weeklyRate);
            }
            results.push({
                week,
                amount: currentAmount
            });
        }
        return results;
    };

    const projection = calculateProjection();
    const finalAmount = projection[projection.length - 1].amount;
    const totalInvested = initialAmount + (weeklyContribution * weeks);
    const totalInterest = finalAmount - totalInvested;

    const chartOptions = {
        chart: {
            type: 'area' as const,
            toolbar: { show: false },
            background: 'transparent',
            animations: { enabled: true }
        },
        xaxis: {
            categories: projection.map(p => `Semana ${p.week}`),
            labels: { style: { colors: '#94a3b8' }, rotate: -45 },
            tickAmount: 8
        },
        yaxis: {
            title: { text: 'Monto Acumulado ($)', style: { color: '#cbd5e1' } },
            labels: { style: { colors: '#94a3b8' }, formatter: (val: number) => `$${val.toFixed(0)}` }
        },
        stroke: { curve: 'smooth' as const, width: 3 },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.7,
                opacityTo: 0.2,
                colorStops: [
                    { offset: 0, color: '#06b6d4', opacity: 0.7 },
                    { offset: 100, color: '#8b5cf6', opacity: 0.2 }
                ]
            }
        },
        tooltip: { theme: 'dark', y: { formatter: (val: number) => `$${val.toFixed(2)}` } },
        grid: { borderColor: '#334155' }
    };

    const series = [{ name: 'Crecimiento', data: projection.map(p => p.amount) }];

    return (
        <div className="bg-gray-800/40 backdrop-blur-sm rounded-3xl border border-white/10 p-6 shadow-xl">
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
                <TrendingUp className="text-cyan-400" /> Simulador de Inversión
            </h2>
            <p className="text-gray-400 mb-6">Basado en aportaciones semanales + interés compuesto (ejemplo del Excel)</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-900/50 rounded-2xl p-4 border border-white/10">
                    <label className="text-gray-300 text-sm flex items-center gap-1"><DollarSign className="w-4 h-4" /> Aporte semanal ($)</label>
                    <input type="number" value={weeklyContribution} onChange={(e) => setWeeklyContribution(Number(e.target.value))} className="w-full bg-gray-800 rounded-lg px-3 py-2 text-white mt-1" />
                </div>
                <div className="bg-gray-900/50 rounded-2xl p-4 border border-white/10">
                    <label className="text-gray-300 text-sm flex items-center gap-1">📈 Tasa anual (%)</label>
                    <input type="number" step="0.1" value={annualRate} onChange={(e) => setAnnualRate(Number(e.target.value))} className="w-full bg-gray-800 rounded-lg px-3 py-2 text-white mt-1" />
                </div>
                <div className="bg-gray-900/50 rounded-2xl p-4 border border-white/10">
                    <label className="text-gray-300 text-sm flex items-center gap-1"><Calendar className="w-4 h-4" /> Semanas</label>
                    <input type="number" value={weeks} onChange={(e) => setWeeks(Number(e.target.value))} className="w-full bg-gray-800 rounded-lg px-3 py-2 text-white mt-1" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gradient-to-br from-cyan-900/40 to-purple-900/40 rounded-2xl p-4 text-center">
                    <p className="text-gray-300 text-sm">Total Invertido</p>
                    <p className="text-2xl font-bold text-white">${totalInvested.toFixed(2)}</p>
                </div>
                <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 rounded-2xl p-4 text-center">
                    <p className="text-gray-300 text-sm">Interés Generado</p>
                    <p className="text-2xl font-bold text-green-400">+${totalInterest.toFixed(2)}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-2xl p-4 text-center">
                    <p className="text-gray-300 text-sm">Monto Final</p>
                    <p className="text-2xl font-bold text-cyan-300">${finalAmount.toFixed(2)}</p>
                </div>
            </div>

            <div className="rounded-xl overflow-hidden">
                <Chart options={chartOptions} series={series} type="area" height={350} />
            </div>

            <div className="mt-6 text-gray-400 text-sm bg-gray-900/50 p-4 rounded-xl">
                <p className="font-semibold text-cyan-300">✨ Ejemplo del cálculo (similar a tu archivo):</p>
                <p>Semana 1: ${initialAmount + weeklyContribution} + interés diario compuesto semanal. Tasa anual {annualRate}% → tasa semanal ≈ {(annualRate / 100 / 52 * 100).toFixed(4)}%.</p>
            </div>
        </div>
    );
};