// components/deposit-panel.tsx
import { useState } from "react";
import { Plus, Star, Trash2, CreditCard, Check, X } from "lucide-react";
import type { Card, CardBrand, CardType } from "../hooks/use-cards";

const BRAND_LOGOS: Record<CardBrand, string> = {
    visa: "VISA",
    mastercard: "MC",
    amex: "AMEX",
    other: "CARD",
};

const CARD_COLORS = [
    { hex: "#1a1f3c", label: "Noche" },
    { hex: "#0d2137", label: "Océano" },
    { hex: "#1a0d2e", label: "Galaxia" },
    { hex: "#1a2e0d", label: "Bosque" },
    { hex: "#2e1a0d", label: "Ámbar" },
    { hex: "#2e0d1a", label: "Rubí" },
];

const fmt = (n: number) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);

// Componente visual de tarjeta
function CardVisual({ card, isSelected, onClick }: { card: Card; isSelected: boolean; onClick: () => void }) {
    return (
        <div
            onClick={onClick}
            className={`relative cursor-pointer rounded-2xl p-4 transition-all duration-200 ${isSelected ? "ring-2 ring-cyan-400 scale-[1.02]" : "hover:scale-[1.01]"
                }`}
            style={{ background: `linear-gradient(135deg, ${card.color}, ${card.color}99)`, minHeight: 100 }}
        >
            {card.isDefault && (
                <div className="absolute top-2.5 right-2.5 bg-amber-400/90 rounded-full p-0.5">
                    <Star className="w-2.5 h-2.5 text-amber-900" />
                </div>
            )}
            <div className="flex justify-between items-start mb-4">
                <span className="text-white/60 text-xs font-medium">{card.bank}</span>
                <span className="text-white font-black text-xs tracking-wider">{BRAND_LOGOS[card.brand]}</span>
            </div>
            <p className="text-white/50 text-xs tracking-[0.2em]">•••• •••• •••• {card.lastFour}</p>
            <div className="flex justify-between items-end mt-2">
                <span className="text-white/70 text-[10px] uppercase">{card.alias}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${card.type === "credit"
                    ? "border-amber-400/40 text-amber-400/80"
                    : "border-cyan-400/40 text-cyan-400/80"
                    }`}>
                    {card.type === "credit" ? "Crédito" : "Débito"}
                </span>
            </div>
        </div>
    );
}

// Mini formulario para agregar tarjeta
function AddCardForm({ onSave, onCancel }: { onSave: (card: Omit<Card, "id" | "userId">) => void; onCancel: () => void }) {
    const [alias, setAlias] = useState("");
    const [bank, setBank] = useState("");
    const [lastFour, setLastFour] = useState("");
    const [brand, setBrand] = useState<CardBrand>("visa");
    const [type, setType] = useState<CardType>("debit");
    const [color, setColor] = useState(CARD_COLORS[0].hex);
    const [error, setError] = useState("");

    const handleSave = () => {
        if (!alias.trim()) { setError("Escribe un nombre para la tarjeta"); return; }
        if (!bank.trim()) { setError("Escribe el banco"); return; }
        if (lastFour.length !== 4 || isNaN(Number(lastFour))) { setError("Ingresa los últimos 4 dígitos"); return; }
        onSave({ alias, bank, lastFour, brand, type, color, isDefault: false });
    };

    return (
        <div className="bg-[#0b1220] rounded-2xl border border-white/10 p-4 space-y-4">
            <p className="text-sm font-semibold text-white/80">Agregar tarjeta</p>

            {/* Preview */}
            <div
                className="rounded-xl p-3"
                style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }}
            >
                <div className="flex justify-between items-start mb-3">
                    <span className="text-white/60 text-xs">{bank || "Banco"}</span>
                    <span className="text-white font-black text-xs">{BRAND_LOGOS[brand]}</span>
                </div>
                <p className="text-white/50 text-xs tracking-[0.2em]">•••• •••• •••• {lastFour || "0000"}</p>
                <p className="text-white/70 text-[10px] mt-1">{alias || "Mi tarjeta"}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5 block">Nombre</label>
                    <input placeholder="Mi BBVA" value={alias} onChange={(e) => setAlias(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 transition-colors" />
                </div>
                <div>
                    <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5 block">Banco</label>
                    <input placeholder="BBVA" value={bank} onChange={(e) => setBank(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 transition-colors" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5 block">Últimos 4 dígitos</label>
                    <input
                        placeholder="1234"
                        maxLength={4}
                        value={lastFour}
                        onChange={(e) => setLastFour(e.target.value.replace(/\D/g, ""))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 transition-colors tracking-widest"
                    />
                </div>
                <div>
                    <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5 block">Marca</label>
                    <select value={brand} onChange={(e) => setBrand(e.target.value as CardBrand)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none [color-scheme:dark]">
                        <option value="visa">Visa</option>
                        <option value="mastercard">Mastercard</option>
                        <option value="amex">Amex</option>
                        <option value="other">Otra</option>
                    </select>
                </div>
            </div>

            {/* Card type */}
            <div className="flex gap-2">
                {(["debit", "credit"] as CardType[]).map((t) => (
                    <button key={t} onClick={() => setType(t)}
                        className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all border ${type === t ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300" : "bg-white/3 border-white/5 text-white/40"
                            }`}>
                        {t === "debit" ? "Débito" : "Crédito"}
                    </button>
                ))}
            </div>

            {/* Color picker */}
            <div>
                <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5 block">Color</label>
                <div className="flex gap-2">
                    {CARD_COLORS.map((c) => (
                        <button
                            key={c.hex}
                            onClick={() => setColor(c.hex)}
                            className={`w-7 h-7 rounded-lg transition-all ${color === c.hex ? "ring-2 ring-white scale-110" : "opacity-70 hover:opacity-100"}`}
                            style={{ background: c.hex }}
                        />
                    ))}
                </div>
            </div>

            {error && <p className="text-red-400 text-xs bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>}

            <div className="flex gap-2">
                <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl bg-white/5 text-white/50 text-xs font-medium">Cancelar</button>
                <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl bg-cyan-500/80 text-white text-xs font-semibold flex items-center justify-center gap-1.5">
                    <Check className="w-3.5 h-3.5" /> Guardar
                </button>
            </div>
        </div>
    );
}

interface Props {
    cards: Card[];
    onAddCard: (card: Omit<Card, "id" | "userId">) => void;
    onRemoveCard: (id: string) => void;
    onSetDefault: (id: string) => void;
    onDeposit: (amount: number, cardId: string, description: string) => void;
}

export function DepositPanel({ cards, onAddCard, onRemoveCard, onSetDefault, onDeposit }: Props) {
    const [selectedCard, setSelectedCard] = useState<string | null>(cards[0]?.id ?? null);
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [showAddCard, setShowAddCard] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const QUICK_AMOUNTS = [500, 1000, 2000, 5000];

    const handleDeposit = () => {
        if (!amount || Number(amount) <= 0) { setError("Ingresa un monto válido"); return; }
        if (!selectedCard) { setError("Selecciona una tarjeta"); return; }
        onDeposit(Number(amount), selectedCard, description || "Depósito");
        setSuccess(true);
        setAmount("");
        setDescription("");
        setError("");
        setTimeout(() => setSuccess(false), 2500);
    };

    return (
        <div className="space-y-4">
            {/* Cards carousel */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-white/40 uppercase tracking-wider">Mis tarjetas</p>
                    <button
                        onClick={() => setShowAddCard(!showAddCard)}
                        className="flex items-center gap-1 text-xs text-cyan-400/70 hover:text-cyan-400 transition-colors"
                    >
                        {showAddCard ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        {showAddCard ? "Cancelar" : "Agregar"}
                    </button>
                </div>

                {showAddCard && (
                    <AddCardForm
                        onSave={(card) => { onAddCard(card); setShowAddCard(false); }}
                        onCancel={() => setShowAddCard(false)}
                    />
                )}

                {cards.length === 0 && !showAddCard ? (
                    <div className="flex flex-col items-center py-10 gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-white/20" />
                        </div>
                        <p className="text-white/30 text-sm">Sin tarjetas guardadas</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {cards.map((card) => (
                            <div key={card.id} className="group relative">
                                <CardVisual
                                    card={card}
                                    isSelected={selectedCard === card.id}
                                    onClick={() => setSelectedCard(card.id)}
                                />
                                {/* Actions overlay */}
                                <div className="absolute top-2.5 left-2.5 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => onSetDefault(card.id)}
                                        className="w-6 h-6 rounded-full bg-black/40 backdrop-blur flex items-center justify-center hover:bg-amber-500/40 transition-colors"
                                        title="Hacer predeterminada"
                                    >
                                        <Star className="w-3 h-3 text-amber-300" />
                                    </button>
                                    <button
                                        onClick={() => onRemoveCard(card.id)}
                                        className="w-6 h-6 rounded-full bg-black/40 backdrop-blur flex items-center justify-center hover:bg-red-500/40 transition-colors"
                                    >
                                        <Trash2 className="w-3 h-3 text-red-300" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Deposit form */}
            {cards.length > 0 && (
                <div className="bg-[#0b1220] rounded-2xl border border-white/5 p-4 space-y-4">
                    <p className="text-sm font-semibold text-white/80">Registrar depósito</p>

                    {/* Quick amounts */}
                    <div>
                        <label className="text-[10px] text-white/30 uppercase tracking-wider mb-2 block">Monto rápido</label>
                        <div className="grid grid-cols-4 gap-2">
                            {QUICK_AMOUNTS.map((q) => (
                                <button
                                    key={q}
                                    onClick={() => setAmount(String(q))}
                                    className={`py-2 rounded-xl text-xs font-semibold transition-all border ${amount === String(q)
                                        ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
                                        : "bg-white/3 border-white/5 text-white/50 hover:bg-white/8"
                                        }`}
                                >
                                    ${(q / 1000).toFixed(0)}k
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom amount */}
                    <div>
                        <label className="text-[10px] text-white/30 uppercase tracking-wider mb-2 block">O ingresa el monto</label>
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

                    {/* Description */}
                    <div>
                        <label className="text-[10px] text-white/30 uppercase tracking-wider mb-2 block">Descripción (opcional)</label>
                        <input
                            placeholder="Ej: Quincena, Freelance..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 transition-colors"
                        />
                    </div>

                    {error && <p className="text-red-400 text-xs bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>}

                    <button
                        onClick={handleDeposit}
                        className={`w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${success
                            ? "bg-emerald-500/80 text-white"
                            : "bg-gradient-to-r from-cyan-500 to-violet-500 text-white hover:opacity-90"
                            }`}
                    >
                        {success ? (
                            <><Check className="w-4 h-4" /> ¡Depósito registrado!</>
                        ) : (
                            <>{amount ? `Depositar ${fmt(Number(amount))}` : "Depositar"}</>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}