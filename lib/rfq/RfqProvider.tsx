"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type RfqLine = {
  stockNumber: string;
  name: string;
  slug?: string;
  qty: string;
  notes?: string;
};

type RfqContextValue = {
  lines: RfqLine[];
  addLine: (line: Omit<RfqLine, "qty"> & { qty?: string }) => void;
  removeLine: (stockNumber: string) => void;
  updateQty: (stockNumber: string, qty: string) => void;
  clear: () => void;
  count: number;
};

const RfqContext = createContext<RfqContextValue | null>(null);
const STORAGE_KEY = "pnwx-rfq-v1";

export function RfqProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<RfqLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw) as RfqLine[]);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const addLine = useCallback((line: Omit<RfqLine, "qty"> & { qty?: string }) => {
    setLines((prev) => {
      const exists = prev.find(
        (l) => l.stockNumber.toUpperCase() === line.stockNumber.toUpperCase(),
      );
      if (exists) {
        return prev.map((l) =>
          l.stockNumber.toUpperCase() === line.stockNumber.toUpperCase()
            ? { ...l, qty: line.qty || l.qty || "1" }
            : l,
        );
      }
      return [
        ...prev,
        {
          stockNumber: line.stockNumber,
          name: line.name,
          slug: line.slug,
          qty: line.qty || "1",
          notes: line.notes,
        },
      ];
    });
  }, []);

  const removeLine = useCallback((stockNumber: string) => {
    setLines((prev) =>
      prev.filter((l) => l.stockNumber.toUpperCase() !== stockNumber.toUpperCase()),
    );
  }, []);

  const updateQty = useCallback((stockNumber: string, qty: string) => {
    setLines((prev) =>
      prev.map((l) =>
        l.stockNumber.toUpperCase() === stockNumber.toUpperCase() ? { ...l, qty } : l,
      ),
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo(
    () => ({
      lines,
      addLine,
      removeLine,
      updateQty,
      clear,
      count: lines.length,
    }),
    [lines, addLine, removeLine, updateQty, clear],
  );

  return <RfqContext.Provider value={value}>{children}</RfqContext.Provider>;
}

export function useRfq() {
  const ctx = useContext(RfqContext);
  if (!ctx) throw new Error("useRfq must be used within RfqProvider");
  return ctx;
}
