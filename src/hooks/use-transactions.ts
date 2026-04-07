// hooks/use-transactions.ts
import { useEffect, useState } from "react";
import { where } from "firebase/firestore";
import { FirestoreService } from "../services/firestore.service";

type Transaction = {
  id: string;
  userId: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description?: string;
  date: Date;
};

const service = new FirestoreService<Transaction>("transactions");

export function useTransactions(userId?: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false); // ← fix: no quedar atascado en loading
      return;
    }

    setLoading(true);

    const unsubscribe = service.subscribe(
      [where("userId", "==", userId)],
      (data) => {
        setTransactions(data);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [userId]);

  const add = async (tx: Omit<Transaction, "id">) => {
    if (!userId) return;
    await service.create({
      ...tx,
      userId,
    });
  };

  const remove = async (id: string) => {
    await service.delete(id);
  };

  return { transactions, loading, add, remove };
}
