import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { marketplaceService } from '../../services/marketplaceService';

export interface CartItem {
    id: string;
    seller_id: string;
    title: string;
    price: number;
    image_url: string;
    quantity: number;
}

interface CartStore {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'quantity'>) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    syncToServer: () => Promise<void>;
    loadFromServer: () => Promise<void>;
    mergeServerCart: (serverItems: CartItem[]) => void;
    get totalItems(): number;
    get totalPrice(): number;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (newItem) => {
                set((state) => {
                    const existingItem = state.items.find(item => item.id === newItem.id);
                    if (existingItem) {
                        return {
                            items: state.items.map(item =>
                                item.id === newItem.id
                                    ? { ...item, quantity: item.quantity + 1 }
                                    : item
                            )
                        };
                    }
                    return { items: [...state.items, { ...newItem, quantity: 1 }] };
                });
                // Sync to server after add
                setTimeout(() => get().syncToServer(), 100);
            },
            removeItem: (id) => {
                set((state) => ({
                    items: state.items.filter(item => item.id !== id)
                }));
                setTimeout(() => get().syncToServer(), 100);
            },
            updateQuantity: (id, quantity) => {
                if (quantity <= 0) return;
                set((state) => ({
                    items: state.items.map(item =>
                        item.id === id ? { ...item, quantity } : item
                    )
                }));
                setTimeout(() => get().syncToServer(), 100);
            },
            clearCart: () => {
                set({ items: [] });
                setTimeout(() => get().syncToServer(), 100);
            },
            syncToServer: async () => {
                const { items } = get();
                await marketplaceService.syncCartToServer(items.map(i => ({ id: i.id, quantity: i.quantity })));
            },
            loadFromServer: async () => {
                const { data } = await marketplaceService.getServerCart();
                if (data && data.length > 0) {
                    const { items: localItems } = get();
                    // Merge: server items take precedence, but keep local items not in server
                    const serverMap = new Map(data.map((i: any) => [i.id, i]));
                    const mergedMap = new Map(localItems.map(i => [i.id, i]));

                    for (const [pid, serverItem] of serverMap) {
                        mergedMap.set(pid, {
                            ...serverItem,
                            quantity: Math.max(serverItem.quantity, mergedMap.get(pid)?.quantity || 0)
                        });
                    }

                    set({ items: Array.from(mergedMap.values()) });
                }
            },
            mergeServerCart: (serverItems) => {
                const { items: localItems } = get();
                const serverMap = new Map(serverItems.map(i => [i.id, i]));
                const mergedMap = new Map(localItems.map(i => [i.id, i]));

                for (const [pid, serverItem] of serverMap) {
                    mergedMap.set(pid, {
                        ...serverItem,
                        quantity: Math.max(serverItem.quantity, mergedMap.get(pid)?.quantity || 0)
                    });
                }

                set({ items: Array.from(mergedMap.values()) });
            },
            get totalItems() {
                return get().items.reduce((total, item) => total + item.quantity, 0);
            },
            get totalPrice() {
                return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
            }
        }),
        {
            name: 'marketplace-cart',
        }
    )
);
