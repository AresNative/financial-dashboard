// components/insights-panel.tsx
import React from "react";
import { Lightbulb, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { AnalyticsService } from "../services/analytics.service";

interface InsightItem {
    icon: React.ReactNode;
    text: string;
    type: "warning" | "success" | "info" | "tip";
}

export function InsightsPanel({ transactions }: { transactions: any[] }) {
    const rawInsights = AnalyticsService.generateInsights(transactions);

    // Extended insights
    const extended: InsightItem[] = [];

    const totalIncome = transactions
        .filter((t) => t.type === "income")
        .reduce((a, t) => a + t.amount, 0);
    const totalExpense = transactions
        .filter((t) => t.type === "expense")
        .reduce((a, t) => a + t.amount, 0);

    if (totalIncome > 0) {
        const savingRate = ((totalIncome - totalExpense) / totalIncome) * 100;
        if (savingRate >= 20) {
            extended.push({
                type: "success",
                icon: <TrendingDown className="w-3.5 h-3.5" />,
                text: `Tasa de ahorro del ${savingRate.toFixed(0)}% — ¡excelente disciplina financiera!`,
            });
        } else if (savingRate < 0) {
            extended.push({
                type: "warning",
                icon: <AlertCircle className="w-3.5 h-3.5" />,
                text: `Tus gastos superan tus ingresos por ${Math.abs(savingRate).toFixed(0)}% — revisa tu presupuesto`,
            });
        } else {
            extended.push({
                type: "tip",
                icon: <TrendingUp className="w-3.5 h-3.5" />,
                text: `Ahorro actual: ${savingRate.toFixed(0)}%. La meta recomendada es 20%`,
            });
        }
    }

    // Category breakdown
    const breakdown = AnalyticsService.categoryBreakdown(transactions);
    const topCategory = Object.entries(breakdown).sort((a, b) => b[1] - a[1])[0];
    if (topCategory && totalExpense > 0) {
        const pct = ((topCategory[1] / totalExpense) * 100).toFixed(0);
        extended.push({
            type: "info",
            icon: <Lightbulb className="w-3.5 h-3.5" />,
            text: `Tu mayor gasto es en "${topCategory[0]}" con el ${pct}% del total`,
        });
    }

    // From raw insights (base service)
    rawInsights.forEach((txt) => {
        extended.push({
            type: "warning",
            icon: <AlertCircle className="w-3.5 h-3.5" />,
            text: txt.replace(/^[⚠️📊]\s*/, ""),
        });
    });

    if (extended.length === 0) {
        if (transactions.length < 3) {
            extended.push({
                type: "tip",
                icon: <Lightbulb className="w-3.5 h-3.5" />,
                text: "Agrega más transacciones para ver análisis personalizados",
            });
        } else {
            extended.push({
                type: "success",
                icon: <TrendingDown className="w-3.5 h-3.5" />,
                text: "Tus finanzas se ven saludables 👍",
            });
        }
    }

    const colorMap = {
        warning: "text-amber-400 bg-amber-500/10 border-amber-500/15",
        success: "text-emerald-400 bg-emerald-500/10 border-emerald-500/15",
        info: "text-cyan-400 bg-cyan-500/10 border-cyan-500/15",
        tip: "text-violet-400 bg-violet-500/10 border-violet-500/15",
    };

    return (
        <div className="bg-[#0b1220] rounded-2xl border border-white/5 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
                <Lightbulb className="w-3.5 h-3.5 text-violet-400" />
                <h2 className="text-sm font-semibold text-white/80">Insights</h2>
            </div>
            <div className="p-3 space-y-2">
                {extended.map((insight, idx) => (
                    <div
                        key={idx}
                        className={`flex items-start gap-2.5 px-3 py-2.5 rounded-xl border ${colorMap[insight.type]}`}
                    >
                        <span className="mt-0.5 flex-shrink-0">{insight.icon}</span>
                        <p className="text-xs leading-relaxed">{insight.text}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}