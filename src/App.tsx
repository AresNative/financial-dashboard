import { useState } from "react";
import { Wallet, LogOut, PlusCircle, Bell, TrendingUp, CreditCard, BarChart2 } from "lucide-react";
import { useAuth } from "./template/auth";
import { useTransactions } from "./hooks/use-transactions";
import { useScheduledPayments } from "./hooks/use-scheduled-payments";
import { useInvestments } from "./hooks/use-investments";
import { useCards } from "./hooks/use-cards";
import { DashboardPanel } from "./components/dashboard-panel";
import { TransactionForm } from "./components/transaction-form";
import { ScheduledPaymentsPanel } from "./components/scheduled-payments-panel";
import { ScheduledPaymentForm } from "./components/scheduled-payment-form";
import { InvestmentsPanel } from "./components/investments-panel";
import { InvestmentForm } from "./components/investment-form";
import { DepositPanel } from "./components/deposit-panel";

type ActiveTab = "dashboard" | "payments" | "investments" | "deposit";

export default function App() {
  const { user, logout, signInWithGoogle } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [showTxForm, setShowTxForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showInvestmentForm, setShowInvestmentForm] = useState(false);

  const { transactions, loading: txLoading, add: addTransaction, remove: removeTransaction } = useTransactions(user?.uid);
  const { payments, loading: paymentsLoading, add: addPayment, remove: removePayment, markAsPaid, getDueToday, getUpcoming, getOverdue } = useScheduledPayments(user?.uid);
  const { investments, loading: invLoading, add: addInvestment, remove: removeInvestment, project, totalInvested, totalCurrentValue, totalGain, totalGainPct } = useInvestments(user?.uid);
  const { cards, add: addCard, remove: removeCard, setDefault } = useCards(user?.uid);

  const alertCount = getOverdue().length + getDueToday().length;

  const handleDeposit = (amount: number, _cardId: string, description: string) => {
    addTransaction({ type: "income", amount, category: "other", description, date: new Date(), userId: user!.uid });
  };

  // LOGIN
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050810] text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>
        <div className="text-center space-y-8 relative z-10 px-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center shadow-2xl shadow-cyan-500/20">
                <Wallet className="w-9 h-9 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-[#050810] animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              Finanzas Intelligence
            </h1>
            <p className="text-white/40 text-base font-light tracking-wide">Control financiero en tiempo real</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {["Tiempo real", "Pagos programados", "Inversiones", "Depósitos"].map((f) => (
              <span key={f} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/50 text-xs">{f}</span>
            ))}
          </div>
          <button
            onClick={signInWithGoogle}
            className="flex items-center gap-3 mx-auto bg-white text-gray-900 px-8 py-4 rounded-2xl font-semibold text-base shadow-xl hover:scale-105 transition-all duration-200"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Iniciar con Google
          </button>
          <p className="text-white/20 text-xs">Tus datos son privados y seguros</p>
        </div>
      </div>
    );
  }

  const loading =
    activeTab === "dashboard" ? txLoading :
      activeTab === "payments" ? paymentsLoading :
        activeTab === "investments" ? invLoading : false;

  const showAddButton = activeTab !== "deposit";

  const handleAdd = () => {
    if (activeTab === "dashboard") setShowTxForm(true);
    else if (activeTab === "payments") setShowPaymentForm(true);
    else if (activeTab === "investments") setShowInvestmentForm(true);
  };

  return (
    <div className="min-h-screen bg-[#050810] text-white">
      {/* HEADER */}
      <header className="sticky top-0 z-20 bg-[#050810]/90 backdrop-blur-lg border-b border-white/5 px-4 py-3">
        <div className="max-w-lg mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-sm leading-tight">Finanzas</h1>
              <p className="text-white/30 text-[10px] leading-tight">{user.displayName?.split(" ")[0]}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {alertCount > 0 && (
              <button onClick={() => setActiveTab("payments")} className="relative bg-amber-500/20 p-2 rounded-lg">
                <Bell className="w-4 h-4 text-amber-400" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full text-[9px] font-bold flex items-center justify-center text-black">{alertCount}</span>
              </button>
            )}
            {showAddButton && (
              <button onClick={handleAdd} className="bg-cyan-500/20 p-2 rounded-lg hover:bg-cyan-500/30 transition-colors">
                <PlusCircle className="w-4 h-4 text-cyan-400" />
              </button>
            )}
            <button onClick={logout} className="bg-red-500/10 p-2 rounded-lg hover:bg-red-500/20 transition-colors">
              <LogOut className="w-4 h-4 text-red-400" />
            </button>
          </div>
        </div>
      </header>

      {/* BOTTOM-STYLE TAB NAV */}
      <div className="max-w-lg mx-auto px-4 pt-4">
        <div className="flex gap-1 bg-white/5 rounded-xl p-1">
          {([
            { id: "dashboard", icon: TrendingUp, label: "Dashboard", badge: undefined },
            { id: "payments", icon: Bell, label: "Pagos", badge: alertCount },
            { id: "investments", icon: BarChart2, label: "Inversiones", badge: undefined },
            { id: "deposit", icon: CreditCard, label: "Depósitos", badge: undefined },
          ] as const).map(({ id, icon: Icon, label, badge = undefined }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-lg text-[10px] font-medium transition-all duration-200 relative ${activeTab === id ? "bg-white/10 text-white" : "text-white/35 hover:text-white/55"
                }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {badge ? (
                <span className="absolute top-1 right-2 w-3.5 h-3.5 bg-amber-500 rounded-full text-[8px] font-bold flex items-center justify-center text-black">
                  {badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <main className="max-w-lg mx-auto px-4 pt-4 pb-8">
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => <div key={i} className="bg-[#0b1220] h-24 rounded-2xl" />)}
          </div>
        ) : (
          <>
            {activeTab === "dashboard" && (
              <DashboardPanel
                transactions={transactions}
                payments={payments}
                totalInvested={totalInvested}
                totalCurrentValue={totalCurrentValue}
                onAddTransaction={() => setShowTxForm(true)}
                onRemoveTransaction={removeTransaction}
                onGoToPayments={() => setActiveTab("payments")}
                onGoToInvestments={() => setActiveTab("investments")}
              />
            )}
            {activeTab === "payments" && (
              <ScheduledPaymentsPanel
                payments={payments}
                onMarkAsPaid={markAsPaid}
                onRemove={removePayment}
                onAdd={() => setShowPaymentForm(true)}
                getDueToday={getDueToday}
                getUpcoming={getUpcoming}
                getOverdue={getOverdue}
              />
            )}
            {activeTab === "investments" && (
              <InvestmentsPanel
                investments={investments}
                totalInvested={totalInvested}
                totalCurrentValue={totalCurrentValue}
                totalGain={totalGain}
                totalGainPct={totalGainPct}
                project={project}
                onAdd={() => setShowInvestmentForm(true)}
                onRemove={removeInvestment}
              />
            )}
            {activeTab === "deposit" && (
              <DepositPanel
                cards={cards}
                onAddCard={addCard}
                onRemoveCard={removeCard}
                onSetDefault={setDefault}
                onDeposit={handleDeposit}
              />
            )}
          </>
        )}
      </main>

      {/* MODALS */}
      {showTxForm && (
        <TransactionForm
          onClose={() => setShowTxForm(false)}
          onSubmit={(tx) => { addTransaction({ ...tx, userId: user.uid }); setShowTxForm(false); }}
        />
      )}
      {showPaymentForm && (
        <ScheduledPaymentForm
          onClose={() => setShowPaymentForm(false)}
          onSubmit={(p) => { addPayment(p); setShowPaymentForm(false); }}
        />
      )}
      {showInvestmentForm && (
        <InvestmentForm
          onClose={() => setShowInvestmentForm(false)}
          onSubmit={(inv: any) => { addInvestment(inv); setShowInvestmentForm(false); }}
        />
      )}
    </div>
  );
}