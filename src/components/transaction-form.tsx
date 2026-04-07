// components/transaction-form.tsx
import { useState } from "react";
import { X, Check } from "lucide-react";

interface TransactionData {
  type: "income" | "expense";
  amount: number;
  category: string;
  description?: string;
  date: Date;
}

interface Props {
  onClose: () => void;
  onSubmit: (tx: TransactionData) => void;
}

const EXPENSE_CATEGORIES = [
  { id: "food", label: "Comida", icon: "🍔" },
  { id: "transport", label: "Transporte", icon: "🚗" },
  { id: "health", label: "Salud", icon: "💊" },
  { id: "entertainment", label: "Ocio", icon: "🎬" },
  { id: "shopping", label: "Compras", icon: "🛍️" },
  { id: "bills", label: "Facturas", icon: "📄" },
  { id: "other", label: "Otro", icon: "📦" },
];

const INCOME_CATEGORIES = [
  { id: "salary", label: "Salario", icon: "💼" },
  { id: "freelance", label: "Freelance", icon: "💻" },
  { id: "investment", label: "Inversión", icon: "📈" },
  { id: "gift", label: "Regalo", icon: "🎁" },
  { id: "other", label: "Otro", icon: "📦" },
];

export function TransactionForm({ onClose, onSubmit }: Props) {
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const categories = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleTypeChange = (t: "income" | "expense") => {
    setType(t);
    setCategory(t === "expense" ? "food" : "salary");
  };

  const handleSubmit = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Ingresa un monto válido");
      return;
    }
    onSubmit({
      type,
      amount: Number(amount),
      category,
      description: description.trim() || undefined,
      date: new Date(),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-[#0b1220] w-full max-w-sm rounded-2xl border border-white/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h2 className="font-bold text-base">Nueva transacción</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Type toggle */}
          <div className="flex bg-white/5 rounded-xl p-1">
            <button
              onClick={() => handleTypeChange("expense")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${type === "expense"
                ? "bg-red-500/20 text-red-300"
                : "text-white/40 hover:text-white/60"
                }`}
            >
              Gasto
            </button>
            <button
              onClick={() => handleTypeChange("income")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${type === "income"
                ? "bg-emerald-500/20 text-emerald-300"
                : "text-white/40 hover:text-white/60"
                }`}
            >
              Ingreso
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">
              Monto
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 font-medium">
                $
              </span>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError("");
                }}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white text-lg font-semibold placeholder-white/20 focus:outline-none focus:border-cyan-500/50 transition-colors"
                autoFocus
              />
            </div>
            {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">
              Categoría
            </label>
            <div className="grid grid-cols-4 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border transition-all duration-150 ${category === cat.id
                    ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
                    : "bg-white/3 border-white/5 text-white/40 hover:bg-white/8 hover:text-white/60"
                    }`}
                >
                  <span className="text-base leading-none">{cat.icon}</span>
                  <span className="text-[10px] leading-tight text-center">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">
              Descripción (opcional)
            </label>
            <input
              placeholder="¿En qué gastaste?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
          </div>

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
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-98"
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