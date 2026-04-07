// hooks/use-scheduled-payments.ts
import { useEffect, useState } from "react";
import { where } from "firebase/firestore";
import { FirestoreService } from "../services/firestore.service";

export type Frequency = "once" | "weekly" | "biweekly" | "monthly" | "yearly";

export interface ScheduledPayment {
  id: string;
  userId: string;
  name: string;
  amount: number;
  category: string;
  frequency: Frequency;
  nextDueDate: Date;
  notes?: string;
  isPaid?: boolean;
  paidAt?: Date;
  createdAt?: Date;
}

const service = new FirestoreService<ScheduledPayment>("scheduled_payments");

function isSameDay(a: Date, b: Date) {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

function isOverdue(date: Date) {
  const d = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return d < today;
}

function isUpcoming(date: Date, days = 7) {
  const d = new Date(date);
  const today = new Date();
  const limit = new Date();
  limit.setDate(limit.getDate() + days);
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  limit.setHours(23, 59, 59, 999);
  return d > today && d <= limit;
}

/** Advance nextDueDate by one period based on frequency */
function advanceDate(date: Date, frequency: Frequency): Date {
  const d = new Date(date);
  switch (frequency) {
    case "weekly":
      d.setDate(d.getDate() + 7);
      break;
    case "biweekly":
      d.setDate(d.getDate() + 14);
      break;
    case "monthly":
      d.setMonth(d.getMonth() + 1);
      break;
    case "yearly":
      d.setFullYear(d.getFullYear() + 1);
      break;
    default:
      break;
  }
  return d;
}

export function useScheduledPayments(userId?: string) {
  const [payments, setPayments] = useState<ScheduledPayment[]>([]);
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
        // Sort: overdue first, then by date
        const sorted = data.sort((a, b) => {
          const da = new Date(a.nextDueDate).getTime();
          const db = new Date(b.nextDueDate).getTime();
          return da - db;
        });
        setPayments(sorted);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [userId]);

  const add = async (payment: Omit<ScheduledPayment, "id" | "userId">) => {
    if (!userId) return;
    // Firestore rechaza campos con valor undefined — los eliminamos antes de guardar
    const clean = Object.fromEntries(
      Object.entries({ ...payment, userId, isPaid: false }).filter(
        ([, v]) => v !== undefined,
      ),
    ) as Omit<ScheduledPayment, "id">;
    await service.create(clean);
  };

  const remove = async (id: string) => {
    await service.delete(id);
  };

  /** Mark as paid. For recurring payments, advances the nextDueDate. */
  const markAsPaid = async (payment: ScheduledPayment) => {
    if (payment.frequency === "once") {
      await service.update(payment.id, { isPaid: true, paidAt: new Date() });
    } else {
      const nextDate = advanceDate(
        new Date(payment.nextDueDate),
        payment.frequency,
      );
      await service.update(payment.id, {
        nextDueDate: nextDate,
        isPaid: false,
        paidAt: undefined,
      });
    }
  };

  const getDueToday = () =>
    payments.filter(
      (p) => !p.isPaid && isSameDay(new Date(p.nextDueDate), new Date()),
    );

  const getOverdue = () =>
    payments.filter((p) => !p.isPaid && isOverdue(new Date(p.nextDueDate)));

  const getUpcoming = () =>
    payments.filter((p) => !p.isPaid && isUpcoming(new Date(p.nextDueDate)));

  return {
    payments,
    loading,
    add,
    remove,
    markAsPaid,
    getDueToday,
    getOverdue,
    getUpcoming,
  };
}
