// components/scheduled-payment-form.tsx
import { useState } from "react";
import { X, Check } from "lucide-react";
import type { Frequency } from "../hooks/use-scheduled-payments";

interface PaymentData {
    name: string;
    amount: number;
    category: string;
    frequency: Frequency;
    nextDueDate: Date;
    notes?: string;
}

interface Props {
    onClose: () => void;
    onSubmit: (p: PaymentData) => void;
}

const CATEGORIES = [
    { id: "rent", label: "Renta", icon: "🏠" },
    { id: "utilities", label: "Servicios", icon: "💡" },
    { id: "internet", label: "Internet", icon: "📶" },
    { id: "phone", label: "Teléfono", icon: "📱" },
    { id: "streaming", label: "Streaming", icon: "📺" },
    { id: "insurance", label: "Seguro", icon: "🛡️" },
    { id: "gym", label: "Gym", icon: "🏋️" },
    { id: "credit", label: "Crédito", icon: "💳" },
    { id: "subscriptions", label: "Suscripc.", icon: "🔄" },
    { id: "other", label: "Otro", icon: "📦" },
];

const FREQUENCIES: { id: Frequency; label: string; desc: string }[] = [
    { id: "once", label: "Una vez", desc: "No repite" },
    { id: "weekly", label: "Semanal", desc: "Cada 7 días" },
    { id: "biweekly", label: "Quincenal", desc: "Cada 15 días" },
    { id: "monthly", label: "Mensual", desc: "Cada mes" },
    { id: "yearly", label: "Anual", desc: "Cada año" },
];

function todayStr() {
    const d = new Date();
    return d.toISOString().split("T")[0];
}

export function ScheduledPaymentForm({ onClose, onSubmit }: Props) {
    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("other");
    const [frequency, setFrequency] = useState<Frequency>("monthly");
    const [dueDate, setDueDate] = useState(todayStr());
    const [notes, setNotes] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = () => {
        if (!name.trim()) { setError("Escribe el nombre del pago"); return; }
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            setError("Ingresa un monto válido");
            return;
        }
        if (!dueDate) { setError("Selecciona la fecha de vencimiento"); return; }

        onSubmit({
            name: name.trim(),
            amount: Number(amount),
            category,
            frequency,
            nextDueDate: new Date(dueDate + "T12:00:00"),
            notes: notes.trim() || undefined,
        });
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
            <div className="bg-[#0b1220] w-full max-w-sm rounded-2xl border border-white/10 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-[#0b1220] flex items-center justify-between px-5 py-4 border-b border-white/5 z-10">
                    <h2 className="font-bold text-base">Pago programado</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                    >
                        <X className="w-4 h-4 text-white/60" />
                    </button>
                </div>

                <div className="p-5 space-y-5">
                    {/* Name */}
                    <div>
                        <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">
                            Nombre
                        </label>
                        <input
                            placeholder="Ej: Netflix, Renta, CFE..."
                            value={name}
                            onChange={(e) => { setName(e.target.value); setError(""); }}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 transition-colors"
                            autoFocus
                        />
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">
                            Monto
                        </label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 font-medium">$</span>
                            <input
                                type="number"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => { setAmount(e.target.value); setError(""); }}
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white text-lg font-semibold placeholder-white/20 focus:outline-none focus:border-cyan-500/50 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Frequency */}
                    <div>
                        <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">
                            Frecuencia
                        </label>
                        <div className="grid grid-cols-5 gap-1.5">
                            {FREQUENCIES.map((f) => (
                                <button
                                    key={f.id}
                                    onClick={() => setFrequency(f.id)}
                                    className={`flex flex-col items-center py-2.5 px-1 rounded-xl border text-center transition-all ${frequency === f.id
                                        ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
                                        : "bg-white/3 border-white/5 text-white/40 hover:bg-white/8"
                                        }`}
                                >
                                    <span className="text-[11px] font-medium leading-tight">{f.label}</span>
                                    <span className="text-[9px] leading-tight opacity-60 mt-0.5">{f.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Due date */}
                    <div>
                        <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">
                            {frequency === "once" ? "Fecha de vencimiento" : "Próximo vencimiento"}
                        </label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => { setDueDate(e.target.value); setError(""); }}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors [color-scheme:dark]"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">
                            Categoría
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setCategory(cat.id)}
                                    className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border transition-all ${category === cat.id
                                        ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
                                        : "bg-white/3 border-white/5 text-white/40 hover:bg-white/8"
                                        }`}
                                >
                                    <span className="text-base leading-none">{cat.icon}</span>
                                    <span className="text-[9px] leading-tight text-center">{cat.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">
                            Notas (opcional)
                        </label>
                        <input
                            placeholder="Ej: cuenta Claro #1234"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 transition-colors"
                        />
                    </div>

                    {error && (
                        <p className="text-red-400 text-xs bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-1">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl bg-white/5 text-white/50 text-sm font-medium hover:bg-white/10 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                        >
                            <Check className="w-4 h-4" />
                            Guardar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}