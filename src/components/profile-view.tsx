import React from 'react';
import { User, Mail, Calendar, Activity, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { useAuth } from '../template/auth';

interface ProfileViewProps {
    transactions: any[];
    payments: any[];
}

export const ProfileView: React.FC<ProfileViewProps> = ({ transactions, payments }) => {
    const { user } = useAuth();

    const allMovements = [
        ...transactions.map(t => ({ ...t, type: 'transaction', date: t.date })),
        ...payments.filter(p => p.isPaid).map(p => ({ ...p, type: 'payment', date: p.dueDate, amount: p.amount, description: p.title, category: 'Pago Programado' }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

    return (
        <div className="space-y-6">
            <div className="bg-gray-800/40 backdrop-blur-sm rounded-3xl border border-white/10 p-6 shadow-xl">
                <div className="flex items-center gap-6 flex-wrap">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                        <User className="w-12 h-12 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white">{user?.displayName || 'Usuario'}</h2>
                        <p className="text-gray-300 flex items-center gap-1"><Mail className="w-4 h-4" /> {user?.email}</p>
                        <p className="text-gray-400 text-sm">Miembro desde: {user?.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'desconocido'}</p>
                    </div>
                </div>
            </div>

            <div className="bg-gray-800/40 backdrop-blur-sm rounded-3xl border border-white/10 p-6 shadow-xl">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2"><Activity className="w-6 h-6" /> Historial completo de movimientos</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {allMovements.map((mov, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-gray-900/50 border border-white/5">
                            <div>
                                <p className="font-medium text-white">{mov.description || mov.title || 'Sin descripción'}</p>
                                <p className="text-xs text-gray-400">{mov.category} • {mov.date.toLocaleDateString()}</p>
                            </div>
                            <p className={`font-bold ${mov.type === 'transaction' && mov.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                                {mov.type === 'transaction' && mov.type === 'income' ? '+' : '-'}${mov.amount.toFixed(2)}
                            </p>
                        </div>
                    ))}
                    {allMovements.length === 0 && <p className="text-gray-400 text-center">No hay movimientos registrados</p>}
                </div>
            </div>
        </div>
    );
};