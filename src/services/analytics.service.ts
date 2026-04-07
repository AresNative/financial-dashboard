// services/analytics.service.ts
export class AnalyticsService {
  static groupByMonth(transactions: any[]) {
    const result: Record<string, { income: number; expense: number }> = {};

    transactions.forEach((t) => {
      const date = new Date(t.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      if (!result[key]) {
        result[key] = { income: 0, expense: 0 };
      }

      if (t.type === "income") {
        result[key].income += t.amount;
      } else {
        result[key].expense += t.amount;
      }
    });

    return result;
  }

  static categoryBreakdown(transactions: any[]) {
    const result: Record<string, number> = {};

    transactions.forEach((t) => {
      if (t.type !== "expense") return;
      result[t.category] = (result[t.category] || 0) + t.amount;
    });

    return result;
  }

  static generateInsights(transactions: any[]): string[] {
    const insights: string[] = [];

    const totalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((a, t) => a + t.amount, 0);

    const foodExpenses = transactions
      .filter((t) => t.type === "expense" && t.category === "food")
      .reduce((a, t) => a + t.amount, 0);

    if (totalExpenses > 0 && foodExpenses / totalExpenses > 0.3) {
      insights.push(
        "Estás gastando más del 30% en comida — considera cocinar más en casa",
      );
    }

    const transportExpenses = transactions
      .filter((t) => t.type === "expense" && t.category === "transport")
      .reduce((a, t) => a + t.amount, 0);

    if (totalExpenses > 0 && transportExpenses / totalExpenses > 0.2) {
      insights.push("Más del 20% de tus gastos son en transporte");
    }

    if (transactions.length < 3) {
      insights.push("Agrega más transacciones para obtener mejores análisis");
    }

    return insights;
  }

  static getMonthlyAverage(
    transactions: any[],
    type: "income" | "expense",
  ): number {
    const monthly = this.groupByMonth(transactions);
    const months = Object.keys(monthly);
    if (months.length === 0) return 0;

    const total = months.reduce(
      (sum, k) =>
        sum + (type === "income" ? monthly[k].income : monthly[k].expense),
      0,
    );

    return total / months.length;
  }

  static getTopExpenseDay(transactions: any[]): string | null {
    const counts: Record<string, number> = {};
    const dayNames = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];

    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const day = new Date(t.date).getDay();
        counts[day] = (counts[day] || 0) + t.amount;
      });

    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return top ? dayNames[Number(top[0])] : null;
  }
}
