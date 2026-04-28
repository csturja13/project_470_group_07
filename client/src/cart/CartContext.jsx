import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { readCartFromStorage, writeCartToStorage } from "./cartStorage";

const CartContext = createContext(null);

function toCartKey({ kind, id }) {
  return `${kind}:${id}`;
}

function clampQty(qty, { min = 1, max = Infinity } = {}) {
  if (max < min) return max;
  const n = Number(qty);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.round(n)));
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => readCartFromStorage());

  useEffect(() => {
    writeCartToStorage(items);
  }, [items]);

  const api = useMemo(() => {
    function add(product, qty = 1) {
      if (!product?.kind || !product?.id) return;
      const key = toCartKey(product);

      const maxQty =
        product.kind === "pet"
          ? 1
          : product.stock != null && Number.isFinite(Number(product.stock))
            ? Math.max(0, Number(product.stock))
            : Infinity;

      if (maxQty < 1) return;

      setItems((prev) => {
        const existing = prev.find((x) => x.key === key);
        if (!existing) {
          const nextQty = clampQty(qty, { min: 1, max: maxQty });
          return [
            ...prev,
            {
              key,
              kind: product.kind,
              id: product.id,
              name: product.name || "Item",
              price: product.price ?? "",
              imageUrl: product.imageUrl || "",
              shopId: product.shopId || "",
              category: product.category || "",
              stock: product.stock ?? null,
              qty: nextQty
            }
          ];
        }

        const nextQty = clampQty(existing.qty + qty, { min: 1, max: maxQty });
        return prev.map((x) => (x.key === key ? { ...x, qty: nextQty } : x));
      });
    }

    function remove(key) {
      setItems((prev) => prev.filter((x) => x.key !== key));
    }

    function clear() {
      setItems([]);
    }

    function setQty(key, qty) {
      setItems((prev) =>
        prev.map((x) => {
          if (x.key !== key) return x;
          const maxQty =
            x.kind === "pet"
              ? 1
              : x.stock != null && Number.isFinite(Number(x.stock))
                ? Math.max(0, Number(x.stock))
                : Infinity;
          return { ...x, qty: clampQty(qty, { min: 1, max: maxQty }) };
        })
      );
    }

    return { items, add, remove, clear, setQty };
  }, [items]);

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

