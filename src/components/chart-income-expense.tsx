// components/chart-income-expense.tsx
import Chart from "react-apexcharts";
import { AnalyticsService } from "../services/analytics.service";

function formatMonth(key: string) {
    const [year, month] = key.split("-");
    const d = new Date(Number(year), Number(month) - 1, 1);
    return d.toLocaleDateString("es-MX", { month: "short", year: "2-digit" });
}

export function IncomeExpenseChart({ transactions }: { transactions: any[] }) {
    const data = AnalyticsService.groupByMonth(transactions);
    const categories = Object.keys(data).sort().map(formatMonth);
    const keys = Object.keys(data).sort();

    const income = keys.map((k) => data[k].income);
    const expense = keys.map((k) => data[k].expense);

    if (keys.length === 0) return null;

    const options: ApexCharts.ApexOptions = {
        chart: {
            toolbar: { show: false },
            background: "transparent",
            sparkline: { enabled: false },
        },
        colors: ["#34d399", "#f87171"],
        stroke: { curve: "smooth", width: 2 },
        fill: {
            type: "gradient",
            gradient: {
                type: "vertical",
                shadeIntensity: 0.5,
                opacityFrom: 0.4,
                opacityTo: 0.05,
            },
        },
        xaxis: {
            categories,
            labels: {
                style: { colors: "rgba(255,255,255,0.3)", fontSize: "11px" },
            },
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: {
            labels: {
                style: { colors: "rgba(255,255,255,0.3)", fontSize: "11px" },
                formatter: (v) => `$${(v / 1000).toFixed(0)}k`,
            },
        },
        grid: {
            borderColor: "rgba(255,255,255,0.05)",
            strokeDashArray: 4,
        },
        legend: {
            labels: { colors: ["#34d399", "#f87171"] },
            fontFamily: "inherit",
            fontSize: "12px",
        },
        tooltip: {
            theme: "dark",
            y: {
                formatter: (v) =>
                    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(v),
            },
        },
        dataLabels: { enabled: false },
    };

    const series = [
        { name: "Ingresos", data: income },
        { name: "Gastos", data: expense },
    ];

    return (
        <div className="bg-[#0b1220] rounded-2xl border border-white/5 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/5">
                <h2 className="text-sm font-semibold text-white/80">Flujo mensual</h2>
            </div>
            <div className="px-2 pb-2">
                <Chart options={options} series={series} type="area" height={200} />
            </div>
        </div>
    );
}