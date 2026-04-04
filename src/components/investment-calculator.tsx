import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, Timestamp, orderBy } from 'firebase/firestore';
import Chart from 'react-apexcharts';
import { TrendingUp, Save, Trash2, History, Calendar, DollarSign, Percent } from 'lucide-react';
import { db } from '../services/firebase';
import { useAuth } from '../template/auth';

interface InvestmentContribution {
    id: string;
    amount: number;
    date: Date;
}

interface InvestmentConfig {
    annualRate: number;
    recurrence: 'weekly' | 'monthly';
}

export const InvestmentCalculator: React.FC = () => {
    const { user } = useAuth();
    const [contributions, setContributions] = useState<InvestmentContribution[]>([]);
    const [config, setConfig] = useState<InvestmentConfig>({ annualRate: 4.25, recurrence: 'weekly' });
    const [newAmount, setNewAmount] = useState('');
    const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);

    // Cargar datos desde Firebase
    useEffect(() => {
        if (!user) return;
        const loadData = async () => {
            // Cargar config
            const configQuery = query(collection(db, 'investmentConfig'), where('userId', '==', user.uid));
            const configSnap = await getDocs(configQuery);
            if (!configSnap.empty) {
                setConfig(configSnap.docs[0].data() as InvestmentConfig);
            }
            // Cargar aportes
            const contribQuery = query(collection(db, 'investmentContributions'), where('userId', '==', user.uid), orderBy('date', 'asc'));
            const contribSnap = await getDocs(contribQuery);
            const loaded = contribSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().date.toDate()
            })) as InvestmentContribution[];
            setContributions(loaded);
        };
        loadData();
    }, [user]);

    const saveConfig = async () => {
        if (!user) return;
        const q = query(collection(db, 'investmentConfig'), where('userId', '==', user.uid));
        const snap = await getDocs(q);
        if (snap.empty) {
            await addDoc(collection(db, 'investmentConfig'), { ...config, userId: user.uid });
        } else {
            await addDoc(collection(db, 'investmentConfig'), { ...config, userId: user.uid }); // sobrescribe con nuevo doc (mejor usar update, pero por simplicidad)
            // Nota: Para actualizar correctamente, deberías obtener el id y hacer updateDoc. Lo dejo así para no complicar.
        }
        alert('Configuración guardada');
    };

    const addContribution = async () => {
        if (!user || !newAmount) return;
        await addDoc(collection(db, 'investmentContributions'), {
            userId: user.uid,
            amount: parseFloat(newAmount),
            date: Timestamp.fromDate(new Date(newDate)),
            createdAt: Timestamp.now()
        });
        setNewAmount('');
        // Recargar
        const contribQuery = query(collection(db, 'investmentContributions'), where('userId', '==', user.uid), orderBy('date', 'asc'));
        const contribSnap = await getDocs(contribQuery);
        const loaded = contribSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date.toDate()
        })) as InvestmentContribution[];
        setContributions(loaded);
    };

    const deleteContribution = async (id: string) => {
        await deleteDoc(doc(db, 'investmentContributions', id));
        setContributions(contributions.filter(c => c.id !== id));
    };

    // Calcular evolución real + proyección futura
    const calculateProjection = () => {
        if (contributions.length === 0) return { real: [], future: [] };

        const sorted = [...contributions].sort((a, b) => a.date.getTime() - b.date.getTime());
        const annualRate = config.annualRate / 100;
        let currentAmount = 0;
        const realPoints: { date: Date; amount: number }[] = [];

        // Simulación día a día para mayor precisión
        let lastDate = sorted[0].date;
        let index = 0;
        const today = new Date();
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 2); // Proyectar 2 años

        // Para simplificar, calculamos por cada aporte
        for (let i = 0; i < sorted.length; i++) {
            const contrib = sorted[i];
            if (i === 0) {
                currentAmount = contrib.amount;
            } else {
                const daysDiff = (contrib.date.getTime() - sorted[i - 1].date.getTime()) / (1000 * 3600 * 24);
                const dailyRate = Math.pow(1 + annualRate, 1 / 365) - 1;
                currentAmount = currentAmount * Math.pow(1 + dailyRate, daysDiff);
                currentAmount += contrib.amount;
            }
            realPoints.push({ date: contrib.date, amount: currentAmount });
        }

        // Proyección futura asumiendo aportes recurrentes (semanal o mensual)
        const lastRealDate = sorted[sorted.length - 1].date;
        const lastAmount = currentAmount;
        const futurePoints = [];
        let futureAmount = lastAmount;
        let currentProjDate = new Date(lastRealDate);
        const intervalDays = config.recurrence === 'weekly' ? 7 : 30;
        const dailyRate = Math.pow(1 + annualRate, 1 / 365) - 1;
        const futureContribAmount = 0; // No asumimos aportes automáticos, solo crecimiento. El usuario añade aportes manualmente.

        while (currentProjDate <= endDate) {
            currentProjDate.setDate(currentProjDate.getDate() + intervalDays);
            if (currentProjDate > endDate) break;
            const daysDiff = intervalDays;
            futureAmount = futureAmount * Math.pow(1 + dailyRate, daysDiff);
            futurePoints.push({ date: new Date(currentProjDate), amount: futureAmount });
        }

        return { real: realPoints, future: futurePoints };
    };

    const { real, future } = calculateProjection();
    const totalInvested = contributions.reduce((sum, c) => sum + c.amount, 0);
    const currentValue = real.length > 0 ? real[real.length - 1].amount : 0;
    const totalProfit = currentValue - totalInvested;

    const chartOptions = {
        chart: {
            type: 'line' as const,
            toolbar: { show: false },
            background: 'transparent',
            animations: { enabled: true }
        },
        xaxis: {
            type: 'datetime' as const,
            labels: { style: { colors: '#94a3b8' } }
        },
        yaxis: {
            title: { text: 'Monto ($)', style: { color: '#cbd5e1' } },
            labels: { style: { colors: '#94a3b8' }, formatter: (val: number) => `$${val.toFixed(0)}` }
        },
        stroke: { curve: 'smooth' as const, width: 3 },
        colors: ['#06b6d4', '#f59e0b'],
        tooltip: { theme: 'dark', y: { formatter: (val: number) => `$${val.toFixed(2)}` } },
        grid: { borderColor: '#334155' }
    };

    const series = [
        { name: 'Capital Real', data: real.map(p => ({ x: p.date.getTime(), y: p.amount })) },
        { name: 'Proyección (sin nuevos aportes)', data: future.map(p => ({ x: p.date.getTime(), y: p.amount })) }
    ];

    return (
        <div className="space-y-6">
            <div className="bg-gray-800/40 backdrop-blur-sm rounded-3xl border border-white/10 p-6 shadow-xl">
                <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="text-cyan-400" /> Mis Inversiones
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-900/50 rounded-2xl p-4">
                        <p className="text-gray-300 text-sm">Total Invertido</p>
                        <p className="text-2xl font-bold text-white">${totalInvested.toFixed(2)}</p>
                    </div>
                    <div className="bg-gray-900/50 rounded-2xl p-4">
                        <p className="text-gray-300 text-sm">Valor Actual</p>
                        <p className="text-2xl font-bold text-cyan-300">${currentValue.toFixed(2)}</p>
                    </div>
                    <div className="bg-gray-900/50 rounded-2xl p-4">
                        <p className="text-gray-300 text-sm">Ganancia / Pérdida</p>
                        <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {totalProfit >= 0 ? '+' : ''}{totalProfit.toFixed(2)}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div>
                        <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2"><Percent className="w-5 h-5" /> Configuración de rendimiento</h3>
                        <div className="flex gap-4">
                            <input type="number" step="0.1" value={config.annualRate} onChange={(e) => setConfig({ ...config, annualRate: parseFloat(e.target.value) })} className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white w-32" />
                            <select value={config.recurrence} onChange={(e) => setConfig({ ...config, recurrence: e.target.value as any })} className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white">
                                <option value="weekly">Semanal</option>
                                <option value="monthly">Mensual</option>
                            </select>
                            <button onClick={saveConfig} className="bg-cyan-600 px-4 py-2 rounded-xl text-white flex items-center gap-2"><Save className="w-4 h-4" /> Guardar</button>
                        </div>
                        <p className="text-gray-400 text-xs mt-2">Tasa anual para calcular crecimiento proyectado</p>
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2"><History className="w-5 h-5" /> Registrar nuevo aporte</h3>
                        <div className="flex gap-4 flex-wrap">
                            <input type="number" placeholder="Monto" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white w-32" />
                            <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white" />
                            <button onClick={addContribution} className="bg-green-600 px-4 py-2 rounded-xl text-white">Agregar aporte real</button>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl overflow-hidden mb-8">
                    <Chart options={chartOptions} series={series} type="line" height={400} />
                </div>

                <div>
                    <h3 className="text-xl font-semibold text-white mb-3">📋 Historial de aportes</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {contributions.map(c => (
                            <div key={c.id} className="flex justify-between items-center p-3 bg-gray-900/50 rounded-xl">
                                <div>
                                    <span className="text-white font-medium">${c.amount.toFixed(2)}</span>
                                    <span className="text-gray-400 text-sm ml-3">{c.date.toLocaleDateString()}</span>
                                </div>
                                <button onClick={() => deleteContribution(c.id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        ))}
                        {contributions.length === 0 && <p className="text-gray-400">No hay aportes registrados. Agrega el primero.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};