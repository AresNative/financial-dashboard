// components/dashboard-panel.tsx
import { useMemo } from "react";
import { ArrowUpRight, ArrowDownRight, Trash2, TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";
import { IncomeExpenseChart } from "./chart-income-expense";
import { CategoryChart } from "./chart-categories";
import { InsightsPanel } from "./insights-panel";
import type { ScheduledPayment } from "../hooks/use-scheduled-payments";

interface Transaction {
    id: string;
    type: "income" | "expense";
    amount: number;
    category: string;
    description?: string;
    date: Date;
}

interface Props {
    transactions: Transaction[];
    payments: ScheduledPayment[];
    totalInvested: number;
    totalCurrentValue: number;
    onAddTransaction: () => void;
    onRemoveTransaction: (id: string) => void;
    onGoToPayments: () => void;
    onGoToInvestments: () => void;
}

const CATEGORY_ICONS: Record<string, string> = {
    food: "🍔", transport: "🚗", health: "💊", entertainment: "🎬",
    shopping: "🛍️", bills: "📄", salary: "💼", freelance: "💻", other: "📦",
};
const CATEGORY_LABELS: Record<string, string> = {
    food: "Comida", transport: "Transporte", health: "Salud", entertainment: "Entretenimiento",
    shopping: "Compras", bills: "Facturas", salary: "Salario", freelance: "Freelance", other: "Otro",
};

const fmt = (n: number) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);

const fmtDate = (d: Date) => {
    const date = new Date(d);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 86400000);
    if (diff === 0) return "Hoy";
    if (diff === 1) return "Ayer";
    if (diff < 7) return `Hace ${diff} días`;
    return date.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
};

export function DashboardPanel({
    transactions,
    payments,
    totalInvested,
    totalCurrentValue,
    onAddTransaction,
    onRemoveTransaction,
    onGoToPayments,
    onGoToInvestments,
}: Props) {
    const { balance, totalIncome, totalExpense, trend } = useMemo(() => {
        const now = new Date();
        const thisMonth = transactions.filter((t) => {
            const d = new Date(t.date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
        const lastMonth = transactions.filter((t) => {
            const d = new Date(t.date);
            const lm = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
            const ly = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
            return d.getMonth() === lm && d.getFullYear() === ly;
        });
        const totalIncome = thisMonth.filter((t) => t.type === "income").reduce((a, t) => a + t.amount, 0);
        const totalExpense = thisMonth.filter((t) => t.type === "expense").reduce((a, t) => a + t.amount, 0);
        const lastExpense = lastMonth.filter((t) => t.type === "expense").reduce((a, t) => a + t.amount, 0);
        const balance = transactions.reduce((acc, t) => t.type === "income" ? acc + t.amount : acc - t.amount, 0);
        const trend = lastExpense === 0 ? 0 : ((totalExpense - lastExpense) / lastExpense) * 100;
        return { balance, totalIncome, totalExpense, trend };
    }, [transactions]);

    // Payments summary for dashboard
    const now = new Date();
    const overduePayments = payments.filter((p) => {
        if (p.isPaid) return false;
        const d = new Date(p.nextDueDate); d.setHours(0, 0, 0, 0);
        const t = new Date(); t.setHours(0, 0, 0, 0);
        return d < t;
    });
    const dueTodayPayments = payments.filter((p) => {
        if (p.isPaid) return false;
        const d = new Date(p.nextDueDate);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
    });
    const upcomingPayments = payments.filter((p) => {
        if (p.isPaid) return false;
        const d = new Date(p.nextDueDate);
        const limit = new Date(); limit.setDate(limit.getDate() + 7);
        const today = new Date(); today.setHours(0, 0, 0, 0); d.setHours(0, 0, 0, 0);
        return d > today && d <= limit;
    });
    const paidPayments = payments.filter((p) => p.isPaid);
    const pendingTotal = [...overduePayments, ...dueTodayPayments, ...upcomingPayments]
        .reduce((a, p) => a + p.amount, 0);

    // Investments
    const investGain = totalCurrentValue - totalInvested;
    const investGainPct = totalInvested > 0 ? ((investGain / totalInvested) * 100).toFixed(1) : "0";

    const recent = useMemo(
        () => [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6),
        [transactions]
    );

    return (
        <div className="space-y-4">
            {/* Balance */}
            <div className="relative bg-gradient-to-br from-[#0d1f35] to-[#0a1628] rounded-2xl p-5 border border-cyan-500/10 overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
                <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Balance total</p>
                <p className={`text-4xl font-bold tracking-tight ${balance >= 0 ? "text-white" : "text-red-400"}`}>
                    {fmt(balance)}
                </p>
                <div className="mt-2 flex items-center gap-1.5">
                    {trend > 5 ? <TrendingUp className="w-3.5 h-3.5 text-red-400" />
                        : trend < -5 ? <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                            : <Minus className="w-3.5 h-3.5 text-white/30" />}
                    <span className={`text-xs ${trend > 5 ? "text-red-400" : trend < -5 ? "text-emerald-400" : "text-white/30"}`}>
                        {Math.abs(trend).toFixed(1)}% vs mes anterior en gastos
                    </span>
                </div>
            </div>

            {/* Income / Expense */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#0b1220] rounded-2xl p-4 border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-white/40 text-xs">Ingresos</p>
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                    </div>
                    <p className="text-emerald-400 font-bold text-lg">{fmt(totalIncome)}</p>
                    <p className="text-white/20 text-[10px] mt-0.5">Este mes</p>
                </div>
                <div className="bg-[#0b1220] rounded-2xl p-4 border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-white/40 text-xs">Gastos</p>
                        <div className="w-7 h-7 rounded-lg bg-red-500/15 flex items-center justify-center">
                            <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />
                        </div>
                    </div>
                    <p className="text-red-400 font-bold text-lg">{fmt(totalExpense)}</p>
                    <p className="text-white/20 text-[10px] mt-0.5">Este mes</p>
                </div>
            </div>

            {/* Payments summary widget */}
            {payments.length > 0 && (
                <button
                    onClick={onGoToPayments}
                    className="w-full bg-[#0b1220] rounded-2xl border border-white/5 p-4 text-left hover:border-white/10 transition-colors"
                >
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-semibold text-white/60">Pagos programados</p>
                        <span className="text-xs text-cyan-400/60">Ver todos →</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        <div className="text-center">
                            <p className="text-lg font-bold text-red-400">{overduePayments.length}</p>
                            <p className="text-[9px] text-white/30 mt-0.5">Vencidos</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-bold text-amber-400">{dueTodayPayments.length}</p>
                            <p className="text-[9px] text-white/30 mt-0.5">Hoy</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-bold text-white/70">{upcomingPayments.length}</p>
                            <p className="text-[9px] text-white/30 mt-0.5">Próximos</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-bold text-emerald-400">{paidPayments.length}</p>
                            <p className="text-[9px] text-white/30 mt-0.5">Pagados</p>
                        </div>
                    </div>
                    {pendingTotal > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-1.5">
                            <AlertTriangle className="w-3 h-3 text-amber-400" />
                            <p className="text-xs text-amber-400/80">Por pagar: {fmt(pendingTotal)}</p>
                        </div>
                    )}
                </button>
            )}

            {/* Investments widget */}
            {totalInvested > 0 && (
                <button
                    onClick={onGoToInvestments}
                    className="w-full bg-[#0b1220] rounded-2xl border border-emerald-500/10 p-4 text-left hover:border-emerald-500/20 transition-colors"
                >
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-white/60">Portafolio</p>
                        <span className="text-xs text-emerald-400/60">Ver más →</span>
                    </div>
                    <p className="text-xl font-bold text-white">{fmt(totalCurrentValue)}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                        {investGain >= 0
                            ? <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                            : <TrendingDown className="w-3.5 h-3.5 text-red-400" />}
                        <span className={`text-xs ${investGain >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                            {investGain >= 0 ? "+" : ""}{fmt(investGain)} ({investGainPct}%)
                        </span>
                    </div>
                </button>
            )}

            {/* Charts */}
            {transactions.length > 0 && (
                <>
                    <IncomeExpenseChart transactions={transactions} />
                    <CategoryChart transactions={transactions} />
                </>
            )}

            <InsightsPanel transactions={transactions} />

            {/* Recent Transactions */}
            <div className="bg-[#0b1220] rounded-2xl border border-white/5 overflow-hidden">
                <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-white/80">Recientes</h2>
                    <span className="text-xs text-white/30">{transactions.length} total</span>
                </div>
                {recent.length === 0 ? (
                    <div className="py-10 text-center">
                        <p className="text-white/20 text-sm">Sin transacciones aún</p>
                        <button onClick={onAddTransaction} className="mt-2 text-cyan-400 text-xs hover:text-cyan-300 transition-colors">
                            + Agregar primera transacción
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {recent.map((tx) => (
                            <div key={tx.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/2 transition-colors group">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${tx.type === "income" ? "bg-emerald-500/10" : "bg-white/5"}`}>
                                    {CATEGORY_ICONS[tx.category] || "📦"}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white/80 truncate font-medium">
                                        {tx.description || CATEGORY_LABELS[tx.category] || tx.category}
                                    </p>
                                    <p className="text-xs text-white/30">{CATEGORY_LABELS[tx.category] || tx.category} · {fmtDate(tx.date)}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-sm font-semibold ${tx.type === "income" ? "text-emerald-400" : "text-white/70"}`}>
                                        {tx.type === "income" ? "+" : "-"}{fmt(tx.amount)}
                                    </span>
                                    <button
                                        onClick={() => onRemoveTransaction(tx.id)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-500/20"
                                    >
                                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}