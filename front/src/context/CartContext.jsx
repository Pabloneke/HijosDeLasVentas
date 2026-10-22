import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

const CART_KEY = 'carrito';
const CartContext = createContext(null);

const readCart = () => {
    if (typeof localStorage === 'undefined') return [];
    try {
        const stored = JSON.parse(localStorage.getItem(CART_KEY));
        return Array.isArray(stored)
            ? stored.filter((item) => item && item.id != null && Number(item.quantity) > 0)
                .map((item) => ({ ...item, quantity: Number(item.quantity) }))
            : [];
    } catch {
        return [];
    }
};

const prefersReducedMotion = () =>
    typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export const CartProvider = ({ children }) => {
    const [items, setItems] = useState(readCart);
    const [animation, setAnimation] = useState(null);
    const cartTargetRef = useRef(null);
    const animationTimeoutRef = useRef(null);

    useEffect(() => {
        localStorage.setItem(CART_KEY, JSON.stringify(items));
    }, [items]);

    useEffect(() => () => {
        if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
    }, []);

    const registerCartTarget = (element) => {
        cartTargetRef.current = element;
    };

    const addItem = (product, sourceElement) => {
        setItems((currentItems) => {
            const existing = currentItems.find((item) => String(item.id) === String(product.id));
            if (existing) {
                return currentItems.map((item) => (
                    String(item.id) === String(product.id)
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                ));
            }
            return [...currentItems, { ...product, quantity: 1 }];
        });

        const target = cartTargetRef.current;
        if (!sourceElement || !target || prefersReducedMotion()) return;

        const sourceRect = sourceElement.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
        setAnimation({
            id: Date.now() + Math.random(),
            image: product.image,
            name: product.name,
            from: {
                left: sourceRect.left,
                top: sourceRect.top,
                width: Math.min(sourceRect.width, 120),
                height: Math.min(sourceRect.height, 120),
            },
            to: {
                left: targetRect.left + targetRect.width / 2 - 16,
                top: targetRect.top + targetRect.height / 2 - 16,
            },
        });
        animationTimeoutRef.current = setTimeout(() => setAnimation(null), 650);
    };

    const removeItem = (id) => {
        setItems((currentItems) => currentItems.filter((item) => String(item.id) !== String(id)));
    };

    const updateQuantity = (id, quantity) => {
        const nextQuantity = Math.max(0, Number(quantity) || 0);
        setItems((currentItems) => nextQuantity === 0
            ? currentItems.filter((item) => String(item.id) !== String(id))
            : currentItems.map((item) => (
                String(item.id) === String(id) ? { ...item, quantity: nextQuantity } : item
            )));
    };

    const clearCart = () => setItems([]);

    const value = useMemo(() => ({
        items,
        itemCount: items.reduce((total, item) => total + item.quantity, 0),
        total: items.reduce((total, item) => total + Number(item.price) * item.quantity, 0),
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        registerCartTarget,
    }), [items]);

    return (
        <CartContext.Provider value={value}>
            {children}
            {animation && (
                <img
                    key={animation.id}
                    className="cart-fly-image"
                    src={animation.image}
                    alt=""
                    aria-hidden="true"
                    style={{
                        '--cart-from-left': `${animation.from.left}px`,
                        '--cart-from-top': `${animation.from.top}px`,
                        '--cart-from-width': `${animation.from.width}px`,
                        '--cart-from-height': `${animation.from.height}px`,
                        '--cart-to-left': `${animation.to.left}px`,
                        '--cart-to-top': `${animation.to.top}px`,
                    }}
                />
            )}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart debe usarse dentro de un CartProvider');
    return context;
};
