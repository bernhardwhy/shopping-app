import { getMarketViews, filterGroceries } from "./markets";
import { GroceryType } from "./groceryType";

const marketRecordFixtures: GroceryType[] = [
  { id: "tomato", name: "Tomaten", buyed: false, marketId: "hofer" },
  { id: "milk", name: "Milch", buyed: false, marketId: "billa" },
  { id: "legacy", name: "Tasche", buyed: false },
  { id: "null", name: "Seife", buyed: false, marketId: null },
  { id: "unknown", name: "Schrauben", buyed: false, marketId: "future-store" },
  { id: "bought", name: "Brot", buyed: true, marketId: "hofer" }
];

it("counts outstanding items once per destination and keeps zero-count markets", () => {
  const marketCatalogFixtures = [
    { id: "all", label: "Alle", count: 5 },
    { id: "unassigned", label: "Ohne Markt", count: 3 },
    { id: "hofer", label: "Hofer", count: 1 },
    { id: "billa", label: "Billa", count: 1 },
    { id: "lidl", label: "Lidl", count: 0 },
    { id: "bauhaus", label: "Bauhaus", count: 0 },
    { id: "biohof", label: "Biohof", count: 0 }
  ];
  expect(getMarketViews(marketRecordFixtures)).toEqual(marketCatalogFixtures);
  expect(filterGroceries(marketRecordFixtures, "all").map(item => item.id)).toEqual([
    "tomato", "milk", "legacy", "null", "unknown"
  ]);
  expect(filterGroceries(marketRecordFixtures, "unassigned").map(item => item.id)).toEqual([
    "legacy", "null", "unknown"
  ]);
  expect(filterGroceries(marketRecordFixtures, "hofer").map(item => item.id)).toEqual(["tomato"]);
  expect(marketRecordFixtures[4].marketId).toBe("future-store");
});

it("keeps all seven destinations available for an empty collection", () => {
  expect(getMarketViews([]).map(view => view.count)).toEqual([0, 0, 0, 0, 0, 0, 0]);
});
