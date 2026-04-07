// components/investment-form.tsx
import React, { useState } from "react";
import { X, Check } from "lucide-react";
import type { InvestmentType } from "../hooks/use-investments";

interface InvestmentData {
    name: string;
    type: InvestmentType;
    initialAmount: number;
    currentValue: number;
    annualRate: number;
    startDate: Date;
    notes?: string;
}

interface Props {
    onClose: () => void;
    onSubmit: (data: InvestmentData) => void;
}

const TYPES: { id: InvestmentType; label: string; icon: string; placeholder: string }[] = [
    { id: "stocks", label: "Acciones", icon: "📈", placeholder: "Ej: CEMEX, AMZN" },
    { id: "crypto", label: "Cripto", icon: "₿", placeholder: "Ej: Bitcoin, ETH" },
    { id: "bonds", label: "Bonos", icon: "📄", placeholder: "Ej: CETES 28 días" },
    { id: "real_estate", label: "Inmuebles", icon: "🏠", placeholder: "Ej: Depto en CDMX" },
    { id: "savings", label: "Ahorro", icon: "🏦", placeholder: "Ej: Nu cuenta" },
    { id: "other", label: "Otro", icon: "💼", placeholder: "Nombre de inversión" },
];

function todayStr() {
    return new Date().toISOString().split("T")[0];
}

export function InvestmentForm({ onClose, onSubmit }: Props) {
    const [type, setType] = useState<InvestmentType>("savings");
    const [name, setName] = useState("");
    const [initialAmount, setInitialAmount] = useState("");
    const [currentValue, setCurrentValue] = useState("");
    const [annualRate, setAnnualRate] = useState("8");
    const [startDate, setStartDate] = useState(todayStr());
    const [notes, setNotes] = useState("");
    const [error, setError] = useState("");

    const selectedType = TYPES.find((t) => t.id === type)!;

    const handleSubmit = () => {
        if (!name.trim()) { setError("Escribe el nombre"); return; }
        if (!initialAmount || Number(initialAmount) <= 0) { setError("Ingresa el monto inicial"); return; }
        if (!currentValue || Number(currentValue) <= 0) { setError("Ingresa el valor actual"); return; }
        if (!annualRate || Number(annualRate) < 0) { setError("Ingresa la tasa anual"); return; }

        onSubmit({
            name: name.trim(),
            type,
            initialAmount: Number(initialAmount),
            currentValue: Number(currentValue),
            annualRate: Number(annualRate),
            startDate: new Date(startDate + "T12:00:00"),
            notes: notes.trim() || undefined,
        });
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
            <div className="bg-[#0b1220] w-full max-w-sm rounded-2xl border border-white/10 max-h-[92vh] overflow-y-auto">
                <div className="sticky top-0 bg-[#0b1220] flex items-center justify-between px-5 py-4 border-b border-white/5 z-10">
                    <h2 className="font-bold text-base">Nueva inversión</h2>
                    <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                        <X className="w-4 h-4 text-white/60" />
                    </button>
                </div>

                <div className="p-5 space-y-5">
                    {/* Type */}
                    <div>
                        <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Tipo</label>
                        <div className="grid grid-cols-3 gap-2">
                            {TYPES.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setType(t.id)}
                                    className={`flex flex-col items-center gap-1 py-3 rounded-xl border transition-all ${type === t.id
                                        ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                                        : "bg-white/3 border-white/5 text-white/40 hover:bg-white/8"
                                        }`}
                                >
                                    <span className="text-lg leading-none">{t.icon}</span>
                                    <span className="text-[11px]">{t.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Nombre</label>
                        <input
                            placeholder={selectedType.placeholder}
                            value={name}
                            onChange={(e) => { setName(e.target.value); setError(""); }}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50 transition-colors"
                        />
                    </div>

                    {/* Amounts */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Monto inicial</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">$</span>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={initialAmount}
                                    onChange={(e) => { setInitialAmount(e.target.value); setError(""); }}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-7 pr-3 py-3 text-white text-sm font-semibold placeholder-white/20 focus:outline-none focus:border-emerald-500/50 transition-colors"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Valor actual</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">$</span>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={currentValue}
                                    onChange={(e) => { setCurrentValue(e.target.value); setError(""); }}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-7 pr-3 py-3 text-white text-sm font-semibold placeholder-white/20 focus:outline-none focus:border-emerald-500/50 transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Annual rate */}
                    <div>
                        <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">
                            Tasa anual esperada — {annualRate}%
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="50"
                            step="0.5"
                            value={annualRate}
                            onChange={(e) => setAnnualRate(e.target.value)}
                            className="w-full accent-emerald-400"
                        />
                        <div className="flex justify-between text-[10px] text-white/20 mt-1">
                            <span>0% (sin rendimiento)</span>
                            <span>50%</span>
                        </div>
                    </div>

                    {/* Start date */}
                    <div>
                        <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Fecha de inicio</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors [color-scheme:dark]"
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Notas (opcional)</label>
                        <input
                            placeholder="Ej: Fondo de retiro, cuenta #1234"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50 transition-colors"
                        />
                    </div>

                    {error && <p className="text-red-400 text-xs bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>}

                    <div className="flex gap-3 pt-1">
                        <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-white/5 text-white/50 text-sm font-medium hover:bg-white/10 transition-colors">
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
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