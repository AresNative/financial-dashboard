// components/chart-categories.tsx
import Chart from "react-apexcharts";
import { AnalyticsService } from "../services/analytics.service";

const CATEGORY_LABELS: Record<string, string> = {
    food: "Comida",
    transport: "Transporte",
    health: "Salud",
    entertainment: "Ocio",
    shopping: "Compras",
    bills: "Facturas",
    salary: "Salario",
    freelance: "Freelance",
    other: "Otro",
};

export function CategoryChart({ transactions }: { transactions: any[] }) {
    const data = AnalyticsService.categoryBreakdown(transactions);
    const rawLabels = Object.keys(data);
    const series = Object.values(data) as number[];

    if (rawLabels.length === 0) return null;

    const labels = rawLabels.map((l) => CATEGORY_LABELS[l] || l);

    const options: ApexCharts.ApexOptions = {
        chart: {
            background: "transparent",
            toolbar: { show: false },
        },
        colors: ["#06b6d4", "#8b5cf6", "#34d399", "#f59e0b", "#f87171", "#ec4899", "#a78bfa"],
        labels,
        legend: {
            position: "bottom",
            labels: { colors: "rgba(255,255,255,0.5)" },
            fontFamily: "inherit",
            fontSize: "12px",
        },
        plotOptions: {
            pie: {
                donut: {
                    size: "65%",
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: "Total",
                            color: "rgba(255,255,255,0.4)",
                            fontSize: "12px",
                            formatter: (w) => {
                                const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
                                return new Intl.NumberFormat("es-MX", {
                                    style: "currency",
                                    currency: "MXN",
                                    maximumFractionDigits: 0,
                                }).format(total);
                            },
                        },
                        value: {
                            color: "rgba(255,255,255,0.8)",
                            fontSize: "16px",
                            fontWeight: "700",
                            formatter: (v) =>
                                new Intl.NumberFormat("es-MX", {
                                    style: "currency",
                                    currency: "MXN",
                                    maximumFractionDigits: 0,
                                }).format(Number(v)),
                        },
                    },
                },
            },
        },
        dataLabels: { enabled: false },
        tooltip: {
            theme: "dark",
            y: {
                formatter: (v) =>
                    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(v),
            },
        },
        stroke: { show: false },
    };

    return (
        <div className="bg-[#0b1220] rounded-2xl border border-white/5 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/5">
                <h2 className="text-sm font-semibold text-white/80">Gastos por categoría</h2>
            </div>
            <div className="px-2 pb-2">
                <Chart options={options} series={series} type="donut" height={260} />
            </div>
        </div>
    );
}