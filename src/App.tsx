import { query, collection, where, getDocs } from 'firebase/firestore';
import {
  LayoutDashboard,
  TrendingUp,
  CreditCard,
  LogOut,
  PlusCircle,
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  BarChart3,
  CalendarDays
} from 'lucide-react';
import { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { InvestmentCalculator } from './components/investment-calculator';
import { PaymentManager } from './components/payment-manager';
import { Suggestions } from './components/suggestions';
import { TransactionForm } from './components/transaction-form';
import { db } from './services/firebase';
import { useAuth } from './template/auth';

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: Date;
}

function App() {
  const { user, logout, signInWithGoogle } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'payments' | 'investment'>('dashboard');
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const loadTransactions = async () => {
    if (!user) return;
    setLoading(true);
    const q = query(collection(db, 'transactions'), where('userId', '==', user.uid));
    const snapshot = await getDocs(q);
    const loaded = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate()
    })) as Transaction[];
    setTransactions(loaded.sort((a, b) => b.date.getTime() - a.date.getTime()));
    setLoading(false);
  };

  useEffect(() => {
    if (user) loadTransactions();
  }, [user]);

  const getMonthlyData = (month: number, year: number) => {
    const filtered = transactions.filter(t => {
      return t.date.getMonth() === month && t.date.getFullYear() === year;
    });
    const income = filtered.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = filtered.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return { income, expense, savings: income - expense };
  };

  const currentData = getMonthlyData(currentMonth, currentYear);
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const prevData = getMonthlyData(prevMonth, prevYear);

  const savingsChange = prevData.savings !== 0 ? ((currentData.savings - prevData.savings) / Math.abs(prevData.savings)) * 100 : currentData.savings > 0 ? 100 : 0;

  const expenseByCategory = () => {
    const categories: Record<string, number> = {};
    const monthExpenses = transactions.filter(t => t.type === 'expense' && t.date.getMonth() === currentMonth && t.date.getFullYear() === currentYear);
    monthExpenses.forEach(t => {
      categories[t.category] = (categories[t.category] || 0) + t.amount;
    });
    return Object.entries(categories).map(([name, amount]) => ({ name, amount }));
  };

  const categoryData = expenseByCategory();
  const topCategory = categoryData.length > 0 ? categoryData.reduce((max, cat) => cat.amount > max.amount ? cat : max, categoryData[0]) : null;

  const monthlyComparisonChart = {
    options: {
      chart: { type: 'bar' as const, toolbar: { show: false }, background: 'transparent' },
      xaxis: { categories: ['Mes Actual', 'Mes Anterior'], labels: { style: { colors: '#cbd5e1' } } },
      colors: ['#06b6d4', '#f59e0b'],
      plotOptions: { bar: { borderRadius: 10, horizontal: false } },
      tooltip: { theme: 'dark', y: { formatter: (val: number) => `$${val.toFixed(2)}` } },
      legend: { labels: { colors: '#fff' } }
    },
    series: [
      { name: 'Ingresos', data: [currentData.income, prevData.income] },
      { name: 'Gastos', data: [currentData.expense, prevData.expense] },
      { name: 'Ahorro', data: [currentData.savings, prevData.savings] }
    ]
  };

  const pieChartOptions = {
    chart: { type: 'donut' as const, background: 'transparent' },
    labels: categoryData.map(c => c.name),
    theme: { mode: 'dark' as const },
    tooltip: { y: { formatter: (val: number) => `$${val.toFixed(2)}` } },
    legend: { labels: { colors: '#fff' }, position: 'bottom' as const }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-3xl p-8 text-center max-w-md border border-white/10 shadow-2xl">
          <Wallet className="w-20 h-20 text-cyan-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Finanzas Inteligentes</h1>
          <p className="text-gray-300 mb-6">Controla tus gastos, ahorra e invierte con inteligencia</p>
          <button onClick={signInWithGoogle} className="bg-gradient-to-r from-cyan-500 to-purple-600 px-8 py-3 rounded-xl text-white font-bold hover:scale-105 transition flex items-center gap-2 mx-auto">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="google" />
            Iniciar con Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="text-cyan-400" /> Mi Dashboard
            </h1>
            <p className="text-gray-400">Hola, {user.displayName || user.email}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowTransactionForm(true)} className="bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-2 rounded-xl text-white font-semibold flex items-center gap-2 hover:scale-105 transition">
              <PlusCircle className="w-5 h-5" /> Nuevo Movimiento
            </button>
            <button onClick={logout} className="bg-gray-800 px-4 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-gray-700 transition flex items-center gap-2">
              <LogOut className="w-5 h-5" /> Salir
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-gray-800/30 rounded-2xl p-1 w-fit backdrop-blur-sm">
          <button onClick={() => setActiveTab('dashboard')} className={`px-5 py-2 rounded-xl font-semibold transition flex items-center gap-2 ${activeTab === 'dashboard' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-white'}`}>
            <LayoutDashboard className="w-4 h-4" /> Resumen
          </button>
          <button onClick={() => setActiveTab('payments')} className={`px-5 py-2 rounded-xl font-semibold transition flex items-center gap-2 ${activeTab === 'payments' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-white'}`}>
            <CreditCard className="w-4 h-4" /> Pagos
          </button>
          <button onClick={() => setActiveTab('investment')} className={`px-5 py-2 rounded-xl font-semibold transition flex items-center gap-2 ${activeTab === 'investment' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-white'}`}>
            <TrendingUp className="w-4 h-4" /> Inversión
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 rounded-3xl p-6 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-3 text-green-300"><ArrowUpCircle className="w-6 h-6" /> Ingresos</div>
                <p className="text-3xl font-bold text-white mt-2">${currentData.income.toFixed(2)}</p>
              </div>
              <div className="bg-gradient-to-br from-red-900/40 to-rose-900/40 rounded-3xl p-6 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-3 text-red-300"><ArrowDownCircle className="w-6 h-6" /> Gastos</div>
                <p className="text-3xl font-bold text-white mt-2">${currentData.expense.toFixed(2)}</p>
              </div>
              <div className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 rounded-3xl p-6 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-3 text-cyan-300"><Wallet className="w-6 h-6" /> Ahorro</div>
                <p className="text-3xl font-bold text-white mt-2">${currentData.savings.toFixed(2)}</p>
                <p className={`text-sm ${savingsChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>{savingsChange >= 0 ? '↑' : '↓'} {Math.abs(savingsChange).toFixed(1)}% vs mes anterior</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-800/40 backdrop-blur-sm rounded-3xl p-6 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><CalendarDays className="w-5 h-5" /> Comparación Mensual</h3>
                <Chart options={monthlyComparisonChart.options} series={monthlyComparisonChart.series} type="bar" height={300} />
              </div>
              <div className="bg-gray-800/40 backdrop-blur-sm rounded-3xl p-6 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4">Distribución de Gastos</h3>
                {categoryData.length > 0 ? (
                  <Chart options={pieChartOptions} series={categoryData.map(c => c.amount)} type="donut" height={300} />
                ) : (
                  <div className="text-center text-gray-400 py-12">No hay gastos este mes</div>
                )}
              </div>
            </div>

            {/* Suggestions */}
            <Suggestions totalExpenses={currentData.expense} totalIncome={currentData.income} savings={currentData.savings} topCategory={topCategory} />

            {/* Recent transactions */}
            <div className="bg-gray-800/40 backdrop-blur-sm rounded-3xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">📋 Últimos Movimientos</h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {transactions.slice(0, 10).map(tx => (
                  <div key={tx.id} className="flex justify-between items-center p-3 rounded-xl bg-gray-900/50">
                    <div>
                      <p className="font-medium text-white">{tx.category}</p>
                      <p className="text-xs text-gray-400">{tx.date.toLocaleDateString()}</p>
                    </div>
                    <p className={`font-bold ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                    </p>
                  </div>
                ))}
                {transactions.length === 0 && <p className="text-gray-400 text-center py-4">No hay movimientos registrados</p>}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-6">
            <PaymentManager />
            <div className="bg-gray-800/40 rounded-3xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-2">Consejos para pagos</h3>
              <p className="text-gray-300">Organiza tus deudas y suscripciones. Marcar pagos como "Pagados" te ayudará a mantener un historial y evitar atrasos.</p>
            </div>
          </div>
        )}

        {activeTab === 'investment' && (
          <InvestmentCalculator />
        )}
      </div>

      {showTransactionForm && <TransactionForm onClose={() => setShowTransactionForm(false)} onSuccess={loadTransactions} />}
    </div>
  );
}

export default App;