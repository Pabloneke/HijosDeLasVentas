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

// Máximo de unidades que se pueden llevar: el stock del producto (sin stock informado, sin tope;
// el checkout vuelve a validar contra la base de productos).
const limitOf = (item) => (item.stock == null ? Infinity : Math.max(0, Number(item.stock)));

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

    // Devuelve true si se agregó una unidad, false si no hay stock suficiente.
    const addItem = (product, sourceElement) => {
        const existing = items.find((item) => String(item.id) === String(product.id));
        const stock = limitOf(product);
        if ((existing ? existing.quantity : 0) + 1 > stock) return false;

        setItems((currentItems) => {
            if (currentItems.some((item) => String(item.id) === String(product.id))) {
                return currentItems.map((item) => (
                    String(item.id) === String(product.id)
                        ? { ...item, stock: product.stock ?? item.stock, quantity: Math.min(item.quantity + 1, stock) }
                        : item
                ));
            }
            return [...currentItems, { ...product, quantity: 1 }];
        });

        const target = cartTargetRef.current;
        if (!sourceElement || !target || prefersReducedMotion()) return true;

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
        return true;
    };

    const removeItem = (id) => {
        setItems((currentItems) => currentItems.filter((item) => String(item.id) !== String(id)));
    };

    // La cantidad nunca supera el stock del ítem.
    const updateQuantity = (id, quantity) => {
        const requested = Math.max(0, Math.floor(Number(quantity)) || 0);
        setItems((currentItems) => requested === 0
            ? currentItems.filter((item) => String(item.id) !== String(id))
            : currentItems.map((item) => (
                String(item.id) === String(id)
                    ? { ...item, quantity: Math.min(requested, limitOf(item)) }
                    : item
            )));
    };

    // Ajusta el carrito al stock vigente: recorta cantidades y quita productos agotados o eliminados.
    // stockById: { [id]: stock }
    const syncStock = (stockById) => {
        setItems((currentItems) => {
            const next = currentItems
                .map((item) => {
                    const stock = stockById[item.id];
                    if (stock == null) return null;
                    return { ...item, stock, quantity: Math.min(item.quantity, stock) };
                })
                .filter((item) => item && item.quantity > 0);
            const changed = next.length !== currentItems.length
                || next.some((item, i) => item.quantity !== currentItems[i].quantity || item.stock !== currentItems[i].stock);
            return changed ? next : currentItems;
        });
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
        syncStock,
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
