import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs, updateDoc, deleteDoc, Timestamp, writeBatch, doc } from 'firebase/firestore';
import { Calendar, DollarSign, CheckCircle, Clock, Trash2, Plus } from 'lucide-react';
import { db } from '../services/firebase';
import { useAuth } from '../template/auth';

interface Payment {
    id: string;
    title: string;
    amount: number;
    dueDate: Date;
    isPaid: boolean;
    transactionId?: string; // ID de la transacción de gasto creada
}

export const PaymentManager: React.FC = () => {
    const { user } = useAuth();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [dueDate, setDueDate] = useState('');

    const loadPayments = async () => {
        if (!user) return;
        const q = query(collection(db, 'payments'), where('userId', '==', user.uid));
        const snapshot = await getDocs(q);
        const loaded = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            dueDate: doc.data().dueDate.toDate()
        })) as Payment[];
        setPayments(loaded.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()));
    };

    useEffect(() => {
        loadPayments();
    }, [user]);

    // Al marcar como pagado, crea una transacción de gasto automática
    const togglePaid = async (payment: Payment) => {
        if (!user) return;
        const batch = writeBatch(db);
        const paymentRef = doc(db, 'payments', payment.id);

        if (!payment.isPaid) {
            // Crear transacción de gasto
            const transactionRef = doc(collection(db, 'transactions'));
            batch.set(transactionRef, {
                userId: user.uid,
                type: 'expense',
                amount: payment.amount,
                category: 'Pago Programado',
                description: payment.title,
                date: Timestamp.fromDate(payment.dueDate),
                createdAt: Timestamp.now(),
                paymentId: payment.id
            });
            batch.update(paymentRef, { isPaid: true, transactionId: transactionRef.id });
        } else {
            // Si se desmarca, eliminar la transacción asociada
            if (payment.transactionId) {
                const transRef = doc(db, 'transactions', payment.transactionId);
                batch.delete(transRef);
            }
            batch.update(paymentRef, { isPaid: false, transactionId: null });
        }
        await batch.commit();
        loadPayments();
    };

    const deletePayment = async (payment: Payment) => {
        if (!user) return;
        const batch = writeBatch(db);
        const paymentRef = doc(db, 'payments', payment.id);
        batch.delete(paymentRef);
        if (payment.transactionId) {
            const transRef = doc(db, 'transactions', payment.transactionId);
            batch.delete(transRef);
        }
        await batch.commit();
        loadPayments();
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !title || !amount || !dueDate) return;

        await addDoc(collection(db, 'payments'), {
            userId: user.uid,
            title,
            amount: parseFloat(amount),
            dueDate: Timestamp.fromDate(new Date(dueDate)),
            isPaid: false,
            createdAt: Timestamp.now()
        });

        setTitle('');
        setAmount('');
        setDueDate('');
        setShowForm(false);
        loadPayments();
    };

    const totalPending = payments.filter(p => !p.isPaid).reduce((sum, p) => sum + p.amount, 0);

    return (
        <div className="bg-gray-800/40 backdrop-blur-sm rounded-3xl border border-white/10 p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-2xl font-bold text-white">📅 Pagos Programados</h3>
                    <p className="text-gray-400 text-sm">Total pendiente: <span className="text-red-400 font-bold">${totalPending.toFixed(2)}</span></p>
                    <p className="text-gray-500 text-xs">Al marcar "Pagar" se registrará automáticamente en tus gastos</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2 rounded-xl text-white font-semibold hover:scale-105 transition flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Agregar Pago
                </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
                {payments.length === 0 && (
                    <div className="text-center text-gray-400 py-8">No hay pagos registrados</div>
                )}
                {payments.map(payment => (
                    <div key={payment.id} className={`flex items-center justify-between p-4 rounded-xl transition ${payment.isPaid ? 'bg-green-900/30 border border-green-500/30' : 'bg-gray-900/50 border border-white/10'}`}>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-white">{payment.title}</h4>
                                {payment.isPaid ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Clock className="w-4 h-4 text-yellow-400" />}
                            </div>
                            <div className="flex gap-4 text-sm mt-1">
                                <span className="flex items-center gap-1 text-gray-300"><DollarSign className="w-3 h-3" /> ${payment.amount.toFixed(2)}</span>
                                <span className="flex items-center gap-1 text-gray-300"><Calendar className="w-3 h-3" /> {payment.dueDate.toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => togglePaid(payment)}
                                className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${payment.isPaid ? 'bg-gray-700 text-gray-300' : 'bg-green-600 text-white hover:bg-green-500'}`}
                            >
                                {payment.isPaid ? 'Desmarcar' : 'Pagar'}
                            </button>
                            <button
                                onClick={() => deletePayment(payment)}
                                className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-3xl border border-white/10 p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold text-white mb-4">Nuevo Pago Programado</h3>
                        <form onSubmit={handleAdd} className="space-y-3">
                            <input type="text" placeholder="Concepto (Ej: Coppel, Netflix)" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white" required />
                            <input type="number" placeholder="Monto" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white" required />
                            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white" required />
                            <div className="flex gap-3 mt-4">
                                <button type="submit" className="flex-1 bg-cyan-600 py-2 rounded-xl text-white">Guardar</button>
                                <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-gray-700 py-2 rounded-xl text-white">Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};