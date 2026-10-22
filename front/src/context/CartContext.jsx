import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

const CART_STORAGE_KEY = 'carrito';
const CartContext = createContext(null);

const readStoredCart = () => {
    if (typeof window === 'undefined') return [];

    try {
        const storedCart = window.localStorage.getItem(CART_STORAGE_KEY);
        const parsedCart = storedCart ? JSON.parse(storedCart) : [];
        return Array.isArray(parsedCart) ? parsedCart : [];
    } catch {
        return [];
    }
};

export const CartProvider = ({ children }) => {
    const [items, setItems] = useState(readStoredCart);
    const cartTargetRef = useRef(null);
    const [animations, setAnimations] = useState([]);

    useEffect(() => {
        window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }, [items]);

    const addToCart = (product, sourceElement) => {
        setItems((currentItems) => {
            const existingItem = currentItems.find((item) => item.id === product.id);

            if (existingItem) {
                return currentItems.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }

            return [...currentItems, { ...product, quantity: 1 }];
        });

        const targetElement = cartTargetRef.current;
        if (!sourceElement || !targetElement || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        const sourceRect = sourceElement.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();
        setAnimations((currentAnimations) => [...currentAnimations, {
            id: `${product.id}-${Date.now()}`,
            image: product.image,
            startX: sourceRect.left + sourceRect.width / 2 - 28,
            startY: sourceRect.top + sourceRect.height / 2 - 28,
            endX: targetRect.left + targetRect.width / 2 - 14,
            endY: targetRect.top + targetRect.height / 2 - 14,
        }]);
    };

    const updateQuantity = (id, quantity) => {
        const nextQuantity = Math.max(0, Number(quantity) || 0);
        setItems((currentItems) =>
            nextQuantity === 0
                ? currentItems.filter((item) => item.id !== id)
                : currentItems.map((item) =>
                    item.id === id ? { ...item, quantity: nextQuantity } : item
                )
        );
    };

    const removeFromCart = (id) => {
        setItems((currentItems) => currentItems.filter((item) => item.id !== id));
    };

    const clearCart = () => setItems([]);

    const value = useMemo(() => ({
        items,
        totalItems: items.reduce((total, item) => total + item.quantity, 0),
        total: items.reduce((total, item) => total + item.price * item.quantity, 0),
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartTargetRef,
    }), [items]);

    return (
        <CartContext.Provider value={value}>
            {children}
            {animations.map((animation) => (
                <img
                    key={animation.id}
                    className="cart-flight-animation"
                    src={animation.image}
                    alt=""
                    style={{
                        '--cart-start-x': `${animation.startX}px`,
                        '--cart-start-y': `${animation.startY}px`,
                        '--cart-end-x': `${animation.endX}px`,
                        '--cart-end-y': `${animation.endY}px`,
                    }}
                    onAnimationEnd={() => setAnimations((currentAnimations) =>
                        currentAnimations.filter((currentAnimation) => currentAnimation.id !== animation.id)
                    )}
                />
            ))}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart debe utilizarse dentro de CartProvider');
    return context;
};
