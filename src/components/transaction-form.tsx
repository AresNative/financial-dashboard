import React, { useState } from 'react';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { PlusCircle, X } from 'lucide-react';
import { db } from '../services/firebase';
import { useAuth } from '../template/auth';

interface TransactionFormProps {
    onClose: () => void;
    onSuccess: () => void;
}

const categories = {
    income: ['Salario', 'Freelance', 'Inversiones', 'Regalos', 'Otros'],
    expense: ['Comida', 'Transporte', 'Entretenimiento', 'Servicios', 'Salud', 'Educación', 'Compras', 'Deudas', 'Pago Programado', 'Otros']
};

export const TransactionForm: React.FC<TransactionFormProps> = ({ onClose, onSuccess }) => {
    const { user } = useAuth();
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !amount || !category) return;

        await addDoc(collection(db, 'transactions'), {
            userId: user.uid,
            type,
            amount: parseFloat(amount),
            category,
            description,
            date: Timestamp.fromDate(new Date(date)),
            createdAt: Timestamp.now()
        });

        onSuccess();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900/95 rounded-3xl border border-white/10 p-6 w-full max-w-md shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-white">Nueva Transacción</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setType('expense')}
                            className={`flex-1 py-2 rounded-xl font-semibold transition ${type === 'expense' ? 'bg-red-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                        >
                            Gasto
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('income')}
                            className={`flex-1 py-2 rounded-xl font-semibold transition ${type === 'income' ? 'bg-green-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                        >
                            Ingreso
                        </button>
                    </div>

                    <div>
                        <label className="text-gray-300 text-sm block mb-1">Monto</label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-cyan-400"
                            placeholder="0.00"
                        />
                    </div>

                    <div>
                        <label className="text-gray-300 text-sm block mb-1">Categoría</label>
                        <select
                            required
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-cyan-400"
                        >
                            <option value="">Seleccionar</option>
                            {(type === 'income' ? categories.income : categories.expense).map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-gray-300 text-sm block mb-1">Descripción (opcional)</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-cyan-400"
                            placeholder="Ej: Supermercado"
                        />
                    </div>

                    <div>
                        <label className="text-gray-300 text-sm block mb-1">Fecha</label>
                        <input
                            type="date"
                            required
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-cyan-400"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 py-3 rounded-xl font-bold text-white hover:opacity-90 transition flex items-center justify-center gap-2"
                    >
                        <PlusCircle className="w-5 h-5" />
                        Agregar Transacción
                    </button>
                </form>
            </div>
        </div>
    );
};