import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    id: string; // product id
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
    get totalItems(): number;
    get totalPrice(): number;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (newItem) => set((state) => {
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
            }),
            removeItem: (id) => set((state) => ({
                items: state.items.filter(item => item.id !== id)
            })),
            updateQuantity: (id, quantity) => set((state) => {
                if (quantity <= 0) return state;
                return {
                    items: state.items.map(item =>
                        item.id === id ? { ...item, quantity } : item
                    )
                };
            }),
            clearCart: () => set({ items: [] }),
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
