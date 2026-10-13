"use client";
import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import { initial, restore, serialize, type Scope } from "@/lib/analysis";
import { products } from "@/lib/data";
type Store = {
  scope: Scope;
  notice: string;
  update: (v: Partial<Scope>) => void;
  reset: () => void;
  toggleCompare: (id: string) => void;
};
const Context = createContext<Store | null>(null);
export function AtlasProvider({ children }: { children: ReactNode }) {
  const [scope, dispatch] = useReducer(
    (s: Scope, a: Partial<Scope>) => ({ ...s, ...a }),
    initial,
  );
  const [notice, setNotice] = useState("");
  useEffect(() => {
    function read() {
      const result = restore(location.search, products);
      if (!new URLSearchParams(location.search).has("compare")) {
        try {
          const saved = JSON.parse(
            localStorage.getItem("atlas-shortlist") || "null",
          );
          if (
            saved?.version === 1 &&
            saved.dataset === initial.dataset &&
            Array.isArray(saved.ids)
          )
            result.scope.compare = saved.ids
              .filter(
                (id: unknown) =>
                  typeof id === "string" &&
                  products.some((p) => p.product_id === id),
              )
              .slice(0, 4);
        } catch {
          localStorage.removeItem("atlas-shortlist");
        }
      }
      dispatch(result.scope);
      setNotice(result.notice);
    }
    read();
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, []);
  function update(v: Partial<Scope>) {
    const next = { ...scope, ...v };
    dispatch(v);
    history.pushState(null, "", location.pathname + serialize(next));
    try {
      localStorage.setItem(
        "atlas-shortlist",
        JSON.stringify({
          version: 1,
          dataset: initial.dataset,
          ids: next.compare,
        }),
      );
    } catch {
      setNotice("Local shortlist storage unavailable; share links still work.");
    }
  }
  function toggleCompare(id: string) {
    if (scope.compare.includes(id))
      update({ compare: scope.compare.filter((p) => p !== id) });
    else if (scope.compare.length < 4)
      update({ compare: [...scope.compare, id] });
    else
      setNotice(
        "Your comparison holds four products. Remove one to add another.",
      );
  }
  return (
    <Context.Provider
      value={{
        scope,
        notice,
        update,
        reset: () =>
          update({
            ...initial,
            brands: [],
            price_types: [],
            availability: [],
            selected: [],
            compare: [],
          }),
        toggleCompare,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useAtlas() {
  const value = useContext(Context);
  if (!value) throw new Error("AtlasProvider required");
  return value;
}
