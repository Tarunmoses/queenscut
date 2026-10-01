import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';

export interface DraftItem {
  apparelType: string;
  measurements: Record<string, string>;
  designNotes: string;
  amountCharged: string;
}

interface DraftOrder {
  customerName: string;
  customerPhone: string;
  deliveryDate: string;
  items: DraftItem[];
  advanceReceived: string;
}

const emptyDraft: DraftOrder = {
  customerName: '',
  customerPhone: '',
  deliveryDate: '',
  items: [],
  advanceReceived: '',
};

interface CreateOrderContextValue {
  draft: DraftOrder;
  setCustomer: (name: string, phone: string, deliveryDate: string) => void;
  addOrUpdateItem: (item: DraftItem, index?: number) => void;
  removeItem: (index: number) => void;
  setAdvanceReceived: (value: string) => void;
  reset: () => void;
  totalAmount: number;
}

const CreateOrderCtx = createContext<CreateOrderContextValue | null>(null);

export function CreateOrderProvider({ children }: PropsWithChildren) {
  const [draft, setDraft] = useState<DraftOrder>(emptyDraft);

  const value = useMemo<CreateOrderContextValue>(
    () => ({
      draft,
      setCustomer: (customerName, customerPhone, deliveryDate) =>
        setDraft((d) => ({ ...d, customerName, customerPhone, deliveryDate })),
      addOrUpdateItem: (item, index) =>
        setDraft((d) => {
          const items = [...d.items];
          if (index !== undefined) {
            items[index] = item;
          } else {
            items.push(item);
          }
          return { ...d, items };
        }),
      removeItem: (index) =>
        setDraft((d) => ({ ...d, items: d.items.filter((_, i) => i !== index) })),
      setAdvanceReceived: (advanceReceived) => setDraft((d) => ({ ...d, advanceReceived })),
      reset: () => setDraft(emptyDraft),
      totalAmount: draft.items.reduce((sum, item) => sum + (Number(item.amountCharged) || 0), 0),
    }),
    [draft],
  );

  return <CreateOrderCtx.Provider value={value}>{children}</CreateOrderCtx.Provider>;
}

export function useCreateOrder() {
  const ctx = useContext(CreateOrderCtx);
  if (!ctx) throw new Error('useCreateOrder must be used within CreateOrderProvider');
  return ctx;
}
