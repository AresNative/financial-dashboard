// components/scheduled-payments-panel.tsx
import React from "react";
import { CheckCircle2, Trash2, AlertTriangle, Clock, Calendar, Plus, RefreshCw } from "lucide-react";
import type { ScheduledPayment, Frequency } from "../hooks/use-scheduled-payments";

const FREQ_LABELS: Record<Frequency, string> = {
    once: "Una vez",
    weekly: "Semanal",
    biweekly: "Quincenal",
    monthly: "Mensual",
    yearly: "Anual",
};

const CATEGORY_ICONS: Record<string, string> = {
    rent: "🏠",
    utilities: "💡",
    internet: "📶",
    phone: "📱",
    streaming: "📺",
    insurance: "🛡️",
    gym: "🏋️",
    subscriptions: "🔄",
    credit: "💳",
    other: "📦",
};

interface Props {
    payments: ScheduledPayment[];
    onMarkAsPaid: (p: ScheduledPayment) => void;
    onRemove: (id: string) => void;
    onAdd: () => void;
    getDueToday: () => ScheduledPayment[];
    getUpcoming: () => ScheduledPayment[];
    getOverdue: () => ScheduledPayment[];
}

function formatCurrency(n: number) {
    return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);
}

function formatDate(d: Date) {
    return new Date(d).toLocaleDateString("es-MX", {
        weekday: "short",
        day: "numeric",
        month: "short",
    });
}

function PaymentCard({
    payment,
    variant,
    onMarkAsPaid,
    onRemove,
}: {
    payment: ScheduledPayment;
    variant: "overdue" | "today" | "upcoming" | "paid";
    onMarkAsPaid: (p: ScheduledPayment) => void;
    onRemove: (id: string) => void;
}) {
    const isRecurring = payment.frequency !== "once";

    return (
        <div
            className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all group ${variant === "overdue"
                ? "bg-red-500/5 border-red-500/20"
                : variant === "today"
                    ? "bg-amber-500/5 border-amber-500/20"
                    : variant === "paid"
                        ? "bg-white/2 border-white/5 opacity-50"
                        : "bg-white/3 border-white/5"
                }`}
        >
            {/* Icon */}
            <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${variant === "overdue"
                    ? "bg-red-500/15"
                    : variant === "today"
                        ? "bg-amber-500/15"
                        : "bg-white/5"
                    }`}
            >
                {CATEGORY_ICONS[payment.category] || "📦"}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                    <p
                        className={`text-sm font-medium truncate ${variant === "paid" ? "text-white/40 line-through" : "text-white/90"
                            }`}
                    >
                        {payment.name}
                    </p>
                    {isRecurring && (
                        <RefreshCw className="w-3 h-3 text-white/20 flex-shrink-0" />
                    )}
                </div>
                <p className="text-xs text-white/30">
                    {FREQ_LABELS[payment.frequency]} · {formatDate(payment.nextDueDate)}
                </p>
                {payment.notes && (
                    <p className="text-xs text-white/20 truncate">{payment.notes}</p>
                )}
            </div>

            {/* Amount + Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
                <span
                    className={`text-sm font-semibold ${variant === "overdue"
                        ? "text-red-400"
                        : variant === "today"
                            ? "text-amber-400"
                            : variant === "paid"
                                ? "text-white/30"
                                : "text-white/70"
                        }`}
                >
                    {formatCurrency(payment.amount)}
                </span>

                {variant !== "paid" && (
                    <button
                        onClick={() => onMarkAsPaid(payment)}
                        className={`p-1.5 rounded-lg transition-colors ${variant === "overdue"
                            ? "bg-red-500/20 hover:bg-red-500/30"
                            : variant === "today"
                                ? "bg-amber-500/20 hover:bg-amber-500/30"
                                : "bg-white/5 hover:bg-white/10"
                            }`}
                        title="Marcar como pagado"
                    >
                        <CheckCircle2
                            className={`w-4 h-4 ${variant === "overdue"
                                ? "text-red-400"
                                : variant === "today"
                                    ? "text-amber-400"
                                    : "text-emerald-400"
                                }`}
                        />
                    </button>
                )}

                <button
                    onClick={() => onRemove(payment.id)}
                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all"
                >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
            </div>
        </div>
    );
}

export function ScheduledPaymentsPanel({
    payments,
    onMarkAsPaid,
    onRemove,
    onAdd,
    getDueToday,
    getUpcoming,
    getOverdue,
}: Props) {
    const overdue = getOverdue();
    const dueToday = getDueToday();
    const upcoming = getUpcoming();
    const paid = payments.filter((p) => p.isPaid);
    const allActive = [...overdue, ...dueToday, ...upcoming];

    // Monthly total for upcoming
    const monthlyTotal = payments
        .filter((p) => !p.isPaid && p.frequency === "monthly")
        .reduce((a, p) => a + p.amount, 0);

    const upcomingTotal = [...overdue, ...dueToday, ...upcoming].reduce(
        (a, p) => a + p.amount,
        0
    );

    if (payments.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white/20" />
                </div>
                <div className="text-center">
                    <p className="text-white/50 text-sm font-medium">Sin pagos programados</p>
                    <p className="text-white/20 text-xs mt-1">
                        Agrega tus facturas recurrentes para no olvidarlas
                    </p>
                </div>
                <button
                    onClick={onAdd}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 text-sm font-medium hover:bg-cyan-500/30 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Agregar pago
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Summary card */}
            <div className="bg-gradient-to-br from-[#0d1f35] to-[#0a1628] rounded-2xl p-5 border border-white/5">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-white/30 text-xs mb-1">Por pagar pronto</p>
                        <p className="text-xl font-bold text-white">{formatCurrency(upcomingTotal)}</p>
                        <p className="text-white/20 text-[10px] mt-0.5">{allActive.length} pagos</p>
                    </div>
                    <div>
                        <p className="text-white/30 text-xs mb-1">Mensual recurrente</p>
                        <p className="text-xl font-bold text-white">{formatCurrency(monthlyTotal)}</p>
                        <p className="text-white/20 text-[10px] mt-0.5">
                            {payments.filter((p) => p.frequency === "monthly").length} suscripciones
                        </p>
                    </div>
                </div>
            </div>

            {/* Overdue */}
            {overdue.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                        <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider">
                            Vencidos ({overdue.length})
                        </h3>
                    </div>
                    {overdue.map((p) => (
                        <PaymentCard
                            key={p.id}
                            payment={p}
                            variant="overdue"
                            onMarkAsPaid={onMarkAsPaid}
                            onRemove={onRemove}
                        />
                    ))}
                </div>
            )}

            {/* Due today */}
            {dueToday.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                            Hoy ({dueToday.length})
                        </h3>
                    </div>
                    {dueToday.map((p) => (
                        <PaymentCard
                            key={p.id}
                            payment={p}
                            variant="today"
                            onMarkAsPaid={onMarkAsPaid}
                            onRemove={onRemove}
                        />
                    ))}
                </div>
            )}

            {/* Upcoming */}
            {upcoming.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-white/40" />
                        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                            Próximos 7 días ({upcoming.length})
                        </h3>
                    </div>
                    {upcoming.map((p) => (
                        <PaymentCard
                            key={p.id}
                            payment={p}
                            variant="upcoming"
                            onMarkAsPaid={onMarkAsPaid}
                            onRemove={onRemove}
                        />
                    ))}
                </div>
            )}

            {/* Paid */}
            {paid.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/50" />
                        <h3 className="text-xs font-semibold text-white/20 uppercase tracking-wider">
                            Pagados ({paid.length})
                        </h3>
                    </div>
                    {paid.map((p) => (
                        <PaymentCard
                            key={p.id}
                            payment={p}
                            variant="paid"
                            onMarkAsPaid={onMarkAsPaid}
                            onRemove={onRemove}
                        />
                    ))}
                </div>
            )}

            {/* Add button */}
            <button
                onClick={onAdd}
                className="w-full py-3 rounded-xl border border-dashed border-white/10 text-white/30 text-sm flex items-center justify-center gap-2 hover:border-cyan-500/30 hover:text-cyan-400/60 transition-all"
            >
                <Plus className="w-4 h-4" />
                Agregar pago recurrente
            </button>
        </div>
    );
}