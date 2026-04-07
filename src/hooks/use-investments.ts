// hooks/use-investments.ts
import { useEffect, useState } from "react";
import { where } from "firebase/firestore";
import { FirestoreService } from "../services/firestore.service";

export type InvestmentType =
  | "stocks"
  | "crypto"
  | "bonds"
  | "real_estate"
  | "savings"
  | "other";

export interface Investment {
  id: string;
  userId: string;
  name: string;
  type: InvestmentType;
  initialAmount: number;
  currentValue: number;
  annualRate: number; // % anual esperado
  startDate: Date;
  notes?: string;
  createdAt?: Date;
}

const service = new FirestoreService<Investment>("investments");

export function useInvestments(userId?: string) {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = service.subscribe(
      [where("userId", "==", userId)],
      (data) => {
        setInvestments(data);
        setLoading(false);
      },
    );
    return unsubscribe;
  }, [userId]);

  const add = async (inv: Omit<Investment, "id" | "userId">) => {
    if (!userId) return;
    await service.create({ ...inv, userId });
  };

  const update = async (id: string, data: Partial<Investment>) => {
    await service.update(id, data);
  };

  const remove = async (id: string) => {
    await service.delete(id);
  };

  // Proyección compuesta a N años
  const project = (investment: Investment, years: number): number => {
    const current = investment.currentValue;
    const rate = investment.annualRate / 100;
    return current * Math.pow(1 + rate, years);
  };

  const totalInvested = investments.reduce((a, i) => a + i.initialAmount, 0);
  const totalCurrentValue = investments.reduce((a, i) => a + i.currentValue, 0);
  const totalGain = totalCurrentValue - totalInvested;
  const totalGainPct =
    totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

  return {
    investments,
    loading,
    add,
    update,
    remove,
    project,
    totalInvested,
    totalCurrentValue,
    totalGain,
    totalGainPct,
  };
}
