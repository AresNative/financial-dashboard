import React, { useState, useEffect } from 'react';
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
  CalendarDays,
  UserCircle,
  Menu,
  X
} from 'lucide-react';
import Chart from 'react-apexcharts';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { InvestmentCalculator } from './components/investment-calculator';
import { PaymentManager } from './components/payment-manager';
import { ProfileView } from './components/profile-view';
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
  description?: string;
}

interface Payment {
  id: string;
  title: string;
  amount: number;
  dueDate: Date;
  isPaid: boolean;
}

function App() {
  const { user, logout, signInWithGoogle } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'payments' | 'investment' | 'profile'>('dashboard');
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    // Transacciones
    const qTrans = query(collection(db, 'transactions'), where('userId', '==', user.uid));
    const snapTrans = await getDocs(qTrans);
    const loadedTrans = snapTrans.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate()
    })) as Transaction[];
    setTransactions(loadedTrans.sort((a, b) => b.date.getTime() - a.date.getTime()));

    // Pagos
    const qPay = query(collection(db, 'payments'), where('userId', '==', user.uid));
    const snapPay = await getDocs(qPay);
    const loadedPay = snapPay.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      dueDate: doc.data().dueDate.toDate()
    })) as Payment[];
    setPayments(loadedPay);
    setLoading(false);
  };

  useEffect(() => {
    if (user) loadData();
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
      colors: ['#06b6d4', '#f59e0b', '#10b981'],
      plotOptions: { bar: { borderRadius: 10, horizontal: false } },
      tooltip: { theme: 'dark' as const, y: { formatter: (val: number) => `$${val.toFixed(2)}` } },
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
      {/* Menú lateral para móvil */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button onClick={() => setSidebarOpen(true)} className="bg-gray-800 p-2 rounded-xl text-white">
          <Menu className="w-6 h-6" />
        </button>
      </div>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 lg:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="w-64 bg-gray-900 h-full p-4" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSidebarOpen(false)} className="text-white float-right"><X /></button>
            <SidebarContent activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setSidebarOpen(false); }} logout={logout} />
          </div>
        </div>
      )}

      <div className="flex">
        {/* Sidebar para desktop */}
        <div className="hidden lg:block w-72 bg-gray-900/50 backdrop-blur-sm border-r border-white/10 min-h-screen p-6">
          <SidebarContent activeTab={activeTab} setActiveTab={setActiveTab} logout={logout} />
        </div>

        {/* Contenido principal */}
        <div className="flex-1 p-4 md:p-8">
          <div className="flex justify-end mb-4 lg:hidden">
            <button onClick={() => setShowTransactionForm(true)} className="bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2 rounded-xl text-white font-semibold flex items-center gap-2">
              <PlusCircle className="w-5 h-5" /> Nuevo
            </button>
          </div>

          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 rounded-3xl p-6 border border-white/10">
                  <div className="flex items-center gap-3 text-green-300"><ArrowUpCircle className="w-6 h-6" /> Ingresos</div>
                  <p className="text-3xl font-bold text-white mt-2">${currentData.income.toFixed(2)}</p>
                </div>
                <div className="bg-gradient-to-br from-red-900/40 to-rose-900/40 rounded-3xl p-6 border border-white/10">
                  <div className="flex items-center gap-3 text-red-300"><ArrowDownCircle className="w-6 h-6" /> Gastos</div>
                  <p className="text-3xl font-bold text-white mt-2">${currentData.expense.toFixed(2)}</p>
                </div>
                <div className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 rounded-3xl p-6 border border-white/10">
                  <div className="flex items-center gap-3 text-cyan-300"><Wallet className="w-6 h-6" /> Ahorro</div>
                  <p className="text-3xl font-bold text-white mt-2">${currentData.savings.toFixed(2)}</p>
                  <p className={`text-sm ${savingsChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>{savingsChange >= 0 ? '↑' : '↓'} {Math.abs(savingsChange).toFixed(1)}% vs mes anterior</p>
                </div>
              </div>

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

              <Suggestions totalExpenses={currentData.expense} totalIncome={currentData.income} savings={currentData.savings} topCategory={topCategory} />

              <div className="bg-gray-800/40 backdrop-blur-sm rounded-3xl p-6 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4">📋 Últimos Movimientos</h3>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {transactions.slice(0, 10).map(tx => (
                    <div key={tx.id} className="flex justify-between items-center p-3 rounded-xl bg-gray-900/50">
                      <div>
                        <p className="font-medium text-white">{tx.category} {tx.description && `- ${tx.description}`}</p>
                        <p className="text-xs text-gray-400">{tx.date.toLocaleDateString()}</p>
                      </div>
                      <p className={`font-bold ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                        {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                      </p>
                    </div>
                  ))}
                  {transactions.length === 0 && <p className="text-gray-400 text-center py-4">No hay movimientos</p>}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payments' && <PaymentManager />}
          {activeTab === 'investment' && <InvestmentCalculator />}
          {activeTab === 'profile' && <ProfileView transactions={transactions} payments={payments} />}
        </div>
      </div>

      {showTransactionForm && <TransactionForm onClose={() => setShowTransactionForm(false)} onSuccess={loadData} />}
    </div>
  );
}

// Componente Sidebar reutilizable
function SidebarContent({ activeTab, setActiveTab, logout }: { activeTab: string; setActiveTab: (tab: any) => void; logout: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-10">
        <Wallet className="w-8 h-8 text-cyan-400" />
        <h1 className="text-2xl font-bold text-white">Finanzas</h1>
      </div>
      <nav className="space-y-2 flex-1">
        <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'dashboard' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}>
          <LayoutDashboard className="w-5 h-5" /> Dashboard
        </button>
        <button onClick={() => setActiveTab('payments')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'payments' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}>
          <CreditCard className="w-5 h-5" /> Pagos
        </button>
        <button onClick={() => setActiveTab('investment')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'investment' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}>
          <TrendingUp className="w-5 h-5" /> Inversión
        </button>
        <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'profile' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}>
          <UserCircle className="w-5 h-5" /> Mi Perfil
        </button>
      </nav>
      <button onClick={logout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/20 transition mt-auto">
        <LogOut className="w-5 h-5" /> Cerrar sesión
      </button>
    </div>
  );
}

export default App;