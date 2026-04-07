// components/investments-panel.tsx
import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, Plus, Trash2, ChevronRight } from "lucide-react";
import type { Investment, InvestmentType } from "../hooks/use-investments";

const TYPE_META: Record<InvestmentType, { label: string; icon: string; color: string }> = {
    stocks: { label: "Acciones", icon: "📈", color: "#22d3ee" },
    crypto: { label: "Cripto", icon: "₿", color: "#f59e0b" },
    bonds: { label: "Bonos", icon: "📄", color: "#8b5cf6" },
    real_estate: { label: "Inmuebles", icon: "🏠", color: "#34d399" },
    savings: { label: "Ahorro", icon: "🏦", color: "#60a5fa" },
    other: { label: "Otro", icon: "💼", color: "#a78bfa" },
};

const fmt = (n: number) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n);

function ProjectionBar({ investment, project }: { investment: Investment; project: (i: Investment, y: number) => number }) {
    const [years, setYears] = useState(5);
    const projected = project(investment, years);
    const gain = projected - investment.currentValue;
    const gainPct = ((gain / investment.currentValue) * 100).toFixed(1);

    return (
        <div className="mt-3 pt-3 border-t border-white/5">
            <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-white/30 uppercase tracking-wider">Proyección</span>
                <div className="flex items-center gap-1">
                    {[1, 3, 5, 10].map((y) => (
                        <button
                            key={y}
                            onClick={() => setYears(y)}
                            className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${years === y
                                ? "bg-cyan-500/25 text-cyan-400"
                                : "text-white/25 hover:text-white/50"
                                }`}
                        >
                            {y}a
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex items-baseline gap-2">
                <span className="text-sm font-bold text-emerald-400">{fmt(projected)}</span>
                <span className="text-xs text-emerald-400/70">+{gainPct}%</span>
            </div>
            {/* Progress bar */}
            <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (investment.currentValue / projected) * 100)}%` }}
                />
            </div>
        </div>
    );
}

interface Props {
    investments: Investment[];
    totalInvested: number;
    totalCurrentValue: number;
    totalGain: number;
    totalGainPct: number;
    project: (i: Investment, years: number) => number;
    onAdd: () => void;
    onRemove: (id: string) => void;
}

export function InvestmentsPanel({
    investments,
    totalCurrentValue,
    totalGain,
    totalGainPct,
    project,
    onAdd,
    onRemove,
}: Props) {
    const [expanded, setExpanded] = useState<string | null>(null);

    // Portfolio por tipo
    const byType = useMemo(() => {
        const result: Record<string, number> = {};
        investments.forEach((i) => {
            result[i.type] = (result[i.type] || 0) + i.currentValue;
        });
        return result;
    }, [investments]);

    const isPositive = totalGain >= 0;

    if (investments.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-2xl">📈</div>
                <div className="text-center">
                    <p className="text-white/50 text-sm font-medium">Sin inversiones registradas</p>
                    <p className="text-white/20 text-xs mt-1">Agrega tus inversiones para ver proyecciones</p>
                </div>
                <button
                    onClick={onAdd}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/30 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Agregar inversión
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Portfolio summary */}
            <div className="bg-gradient-to-br from-[#0d2318] to-[#0a1628] rounded-2xl p-5 border border-emerald-500/10">
                <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Portafolio total</p>
                <p className="text-3xl font-bold text-white">{fmt(totalCurrentValue)}</p>
                <div className="flex items-center gap-2 mt-2">
                    {isPositive
                        ? <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                        : <TrendingDown className="w-3.5 h-3.5 text-red-400" />}
                    <span className={`text-xs ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                        {isPositive ? "+" : ""}{fmt(totalGain)} ({totalGainPct.toFixed(1)}%)
                    </span>
                    <span className="text-white/20 text-xs">vs inversión inicial</span>
                </div>

                {/* Type breakdown pills */}
                {Object.entries(byType).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                        {Object.entries(byType).map(([type, val]) => {
                            const meta = TYPE_META[type as InvestmentType];
                            const pct = ((val / totalCurrentValue) * 100).toFixed(0);
                            return (
                                <span
                                    key={type}
                                    className="text-[10px] px-2 py-0.5 rounded-full bg-white/8 text-white/50"
                                >
                                    {meta.icon} {meta.label} {pct}%
                                </span>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Investment cards */}
            {investments.map((inv) => {
                const meta = TYPE_META[inv.type];
                const gain = inv.currentValue - inv.initialAmount;
                const gainPct = ((gain / inv.initialAmount) * 100).toFixed(1);
                const isUp = gain >= 0;
                const isOpen = expanded === inv.id;

                return (
                    <div
                        key={inv.id}
                        className="bg-[#0b1220] rounded-2xl border border-white/5 overflow-hidden"
                    >
                        <div
                            className="flex items-center gap-3 p-4 cursor-pointer group"
                            onClick={() => setExpanded(isOpen ? null : inv.id)}
                        >
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                                style={{ background: meta.color + "18" }}
                            >
                                {meta.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white/90 truncate">{inv.name}</p>
                                <p className="text-xs text-white/30">{meta.label} · {inv.annualRate}% anual</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <p className="text-sm font-bold text-white">{fmt(inv.currentValue)}</p>
                                <p className={`text-xs ${isUp ? "text-emerald-400" : "text-red-400"}`}>
                                    {isUp ? "+" : ""}{gainPct}%
                                </p>
                            </div>
                            <div className="flex items-center gap-1 ml-1">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onRemove(inv.id); }}
                                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all"
                                >
                                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                </button>
                                <ChevronRight
                                    className={`w-4 h-4 text-white/20 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
                                />
                            </div>
                        </div>

                        {isOpen && (
                            <div className="px-4 pb-4">
                                <ProjectionBar investment={inv} project={project} />
                            </div>
                        )}
                    </div>
                );
            })}

            <button
                onClick={onAdd}
                className="w-full py-3 rounded-xl border border-dashed border-white/10 text-white/30 text-sm flex items-center justify-center gap-2 hover:border-emerald-500/30 hover:text-emerald-400/60 transition-all"
            >
                <Plus className="w-4 h-4" />
                Agregar inversión
            </button>
        </div>
    );
}