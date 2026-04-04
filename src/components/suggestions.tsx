import React from 'react';
import { Lightbulb, TrendingDown, PiggyBank, AlertCircle } from 'lucide-react';

interface SuggestionsProps {
    totalExpenses: number;
    totalIncome: number;
    savings: number;
    topCategory: { name: string; amount: number } | null;
}

export const Suggestions: React.FC<SuggestionsProps> = ({ totalExpenses, totalIncome, savings, topCategory }) => {
    const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;
    const expenseRatio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

    const getSuggestions = () => {
        const tips = [];

        if (savingsRate < 20 && totalIncome > 0) {
            tips.push({
                icon: <PiggyBank className="w-5 h-5 text-yellow-400" />,
                title: "Ahorro bajo",
                message: `Ahorras solo el ${savingsRate.toFixed(1)}% de tus ingresos. Intenta reducir gastos hormiga y aplicar la regla 50/30/20.`,
                color: "border-yellow-500/30 bg-yellow-500/10"
            });
        }

        if (expenseRatio > 70) {
            tips.push({
                icon: <TrendingDown className="w-5 h-5 text-red-400" />,
                title: "Gastos elevados",
                message: `Estás gastando el ${expenseRatio.toFixed(1)}% de tus ingresos. Revisa categorías como "Comida" o "Entretenimiento".`,
                color: "border-red-500/30 bg-red-500/10"
            });
        }

        if (topCategory && topCategory.amount > totalExpenses * 0.4) {
            tips.push({
                icon: <AlertCircle className="w-5 h-5 text-orange-400" />,
                title: `Alerta en ${topCategory.name}`,
                message: `Esta categoría representa el ${((topCategory.amount / totalExpenses) * 100).toFixed(0)}% de tus gastos. ¿Puedes optimizarlo?`,
                color: "border-orange-500/30 bg-orange-500/10"
            });
        }

        if (savings > 0 && savingsRate >= 20) {
            tips.push({
                icon: <Lightbulb className="w-5 h-5 text-green-400" />,
                title: "¡Excelente ahorro!",
                message: "Considera invertir el excedente en la sección de Inversión para hacer crecer tu dinero.",
                color: "border-green-500/30 bg-green-500/10"
            });
        }

        if (tips.length === 0) {
            tips.push({
                icon: <Lightbulb className="w-5 h-5 text-cyan-400" />,
                title: "Vas por buen camino",
                message: "Sigue monitoreando tus gastos mensuales y mantén el equilibrio financiero.",
                color: "border-cyan-500/30 bg-cyan-500/10"
            });
        }

        return tips;
    };

    const suggestions = getSuggestions();

    return (
        <div className="bg-gray-800/40 backdrop-blur-sm rounded-3xl border border-white/10 p-6 shadow-xl">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Lightbulb className="text-yellow-400" /> Sugerencias Financieras
            </h3>
            <div className="space-y-3">
                {suggestions.map((tip, idx) => (
                    <div key={idx} className={`rounded-xl p-4 border ${tip.color} transition hover:scale-[1.01]`}>
                        <div className="flex items-start gap-3">
                            {tip.icon}
                            <div>
                                <h4 className="font-semibold text-white">{tip.title}</h4>
                                <p className="text-gray-300 text-sm">{tip.message}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};