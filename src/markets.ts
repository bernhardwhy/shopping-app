import { GroceryType } from "./groceryType";

export const markets = [
  { id: "hofer", label: "Hofer" },
  { id: "billa", label: "Billa" },
  { id: "lidl", label: "Lidl" },
  { id: "bauhaus", label: "Bauhaus" },
  { id: "biohof", label: "Biohof" },
] as const;

export type MarketId = typeof markets[number]["id"];
export type MarketFilter = "all" | "unassigned" | MarketId;
export type MarketView = { id: MarketFilter; label: string; count: number };

export function isMarketId(value: unknown): value is MarketId {
  return markets.some(market => market.id === value);
}

export function marketLabel(value?: string | null): string {
  return markets.find(market => market.id === value)?.label ?? "Ohne Markt";
}

export function filterGroceries(groceries: GroceryType[], filter: MarketFilter): GroceryType[] {
  return groceries.filter(item => {
    const destination = isMarketId(item.marketId) ? item.marketId : "unassigned";
    return item.buyed === false && (filter === "all" || destination === filter);
  });
}

export function getMarketViews(groceries: GroceryType[]): MarketView[] {
  const views: { id: MarketFilter; label: string }[] = [
    { id: "all", label: "Alle" },
    { id: "unassigned", label: "Ohne Markt" },
    ...markets
  ];
  return views.map(view => ({
    ...view,
    count: filterGroceries(groceries, view.id).length
  }));
}
