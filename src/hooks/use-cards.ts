// hooks/use-cards.ts
import { useEffect, useState } from "react";
import { where } from "firebase/firestore";
import { FirestoreService } from "../services/firestore.service";

export type CardType = "debit" | "credit";
export type CardBrand = "visa" | "mastercard" | "amex" | "other";

export interface Card {
    id: string;
    userId: string;
    alias: string;          // "Mi BBVA débito"
    brand: CardBrand;
    type: CardType;
    lastFour: string;       // últimos 4 dígitos
    bank: string;
    color: string;          // hex para el gradiente
    isDefault?: boolean;
    createdAt?: Date;
}

const service = new FirestoreService<Card>("cards");

export function useCards(userId?: string) {
    const [cards, setCards] = useState<Card[]>([]);
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
                setCards(data);
                setLoading(false);
            }
        );
        return unsubscribe;
    }, [userId]);

    const add = async (card: Omit<Card, "id" | "userId">) => {
        if (!userId) return;
        await service.create({ ...card, userId });
    };

    const remove = async (id: string) => {
        await service.delete(id);
    };

    const setDefault = async (id: string) => {
        // Quita default de todos, luego pone el nuevo
        await Promise.all(
            cards.map((c) => service.update(c.id, { isDefault: c.id === id }))
        );
    };

    const defaultCard = cards.find((c) => c.isDefault) ?? cards[0];

    return { cards, loading, add, remove, setDefault, defaultCard };
}