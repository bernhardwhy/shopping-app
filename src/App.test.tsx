import React from "react";
import ReactDOM from "react-dom";
import { act, Simulate } from "react-dom/test-utils";
import App from "./App";

const mockOn = jest.fn();
const mockOff = jest.fn();
const mockUpdate = jest.fn();
const mockPush = jest.fn();
const mockSet = jest.fn();

jest.mock("./shared/config", () => ({
  firebaseDB: {
    database: () => ({
      ref: () => ({
        child: () => ({
          on: mockOn,
          off: mockOff,
          update: mockUpdate,
          push: mockPush
        })
      })
    })
  }
}));

let container: HTMLDivElement;

beforeEach(() => {
  jest.clearAllMocks();
  mockUpdate.mockReset();
  mockUpdate.mockResolvedValue(undefined);
  mockSet.mockReset();
  mockSet.mockResolvedValue(undefined);
  mockPush.mockReturnValue({ key: "created", set: mockSet });
  container = document.createElement("div");
  document.body.appendChild(container);
  act(() => {
    ReactDOM.render(<App />, container);
  });
});

afterEach(() => {
  act(() => {
    ReactDOM.unmountComponentAtNode(container);
  });
  container.remove();
});

function emitSnapshot(records: object | null) {
  const subscription = mockOn.mock.calls[mockOn.mock.calls.length - 1];
  act(() => {
    subscription[1]({ val: () => records });
  });
}

it("renders the shopping title and loading status while awaiting groceries", () => {
  expect(container.querySelector("h1")!.textContent).toBe("Einkaufsliste");
  expect(container.querySelector('[role="status"]')!.textContent).toContain(
    "Einkaufsliste wird geladen"
  );
});

it("counts and renders only outstanding groceries after a snapshot", () => {
  emitSnapshot({
    tomato: { name: "Tomaten", buyed: false, area: "Avegetables" },
    milk: { name: "Milch", buyed: false, area: "Bcooling" },
    bread: { name: "Brot", buyed: true, area: "Ebakery" }
  });
  expect(container.querySelector(".AppSummary")!.textContent).toBe(
    "2 Artikel offen"
  );
  expect(container.textContent).toContain("Tomaten");
  expect(container.textContent).toContain("Milch");
  expect(container.querySelector('[aria-label="Brot als gekauft markieren"]')).toBeNull();
});

it("renders an empty null collection and then its first uncategorized item", () => {
  emitSnapshot(null);
  expect(container.textContent).toContain("Nichts einzukaufen");
  expect(container.querySelector(".AppSummary")!.textContent).toBe(
    "0 Artikel offen"
  );
  emitSnapshot({ first: { name: "Schrauben", buyed: false } });
  expect(container.textContent).toContain("Sonstiges");
  expect(container.textContent).toContain("Schrauben");
  expect(container.querySelector(".AppSummary")!.textContent).toBe(
    "1 Artikel offen"
  );
});

it("recovers from a read failure after retry receives a successful snapshot", () => {
  act(() => {
    mockOn.mock.calls[0][2](new Error("unavailable"));
  });
  expect(container.querySelector('[role="alert"]')!.textContent).toContain(
    "nicht geladen"
  );
  act(() => {
    Simulate.click(container.querySelector('[role="alert"] button')!);
  });
  expect(mockOn).toHaveBeenCalledTimes(2);
  emitSnapshot({ first: { name: "Milch", buyed: false, area: "Bcooling" } });
  expect(container.querySelector('[role="alert"]')).toBeNull();
  expect(container.textContent).toContain("Milch");
});

it("writes a purchase by grocery id and waits for the list snapshot to update", async () => {
  emitSnapshot({ tomato: { name: "Tomaten", buyed: false, area: "Avegetables" } });
  act(() => {
    Simulate.click(
      container.querySelector('[aria-label="Tomaten als gekauft markieren"]')!
    );
  });
  expect(mockUpdate).toHaveBeenCalledWith({ buyed: true });
  expect(container.textContent).toContain("Tomaten");
  emitSnapshot({ tomato: { name: "Tomaten", buyed: true, area: "Avegetables" } });
  await flushWrites();
  expect(container.textContent).toContain("Alles eingekauft");
  expect(container.querySelector(".AppSummary")!.textContent).toBe(
    "0 Artikel offen"
  );
});

async function flushWrites() {
  await new Promise(resolve => setTimeout(resolve, 0));
  act(() => {});
}

function deferredWrite() {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((success, failure) => {
    resolve = success;
    reject = failure;
  });
  return { promise, resolve, reject };
}

function selectMarket(id: string) {
  act(() => {
    Simulate.click(container.querySelector(`#market-filter-${id}`)!);
  });
}

function filterLabels() {
  return Array.from(container.querySelectorAll(".MarketFilters button")).map(
    button => button.textContent
  );
}

it("filters legacy, null and unknown markets without rewriting them", () => {
  emitSnapshot({
    tomato: { name: "Tomaten", buyed: false, marketId: "hofer" },
    milk: { name: "Milch", buyed: false, marketId: "billa" },
    legacy: { name: "Tasche", buyed: false },
    unknown: { name: "Schrauben", buyed: false, marketId: "future" },
    cleared: { name: "Seife", buyed: false, marketId: null },
    bought: { name: "Brot", buyed: true, marketId: "hofer" }
  });
  expect(filterLabels()).toEqual(["Alle5", "Ohne Markt3", "Hofer1", "Billa1", "Lidl0", "Bauhaus0", "Biohof0"]);
  expect(container.querySelector("#market-filter-all")!.getAttribute("aria-pressed")).toBe("true");
  selectMarket("hofer");
  expect(Array.from(container.querySelectorAll(".GroceryName")).map(item => item.textContent)).toEqual(["Tomaten"]);
  expect(container.querySelector(".AppSummary")!.textContent).toBe("1 bei Hofer / 5 insgesamt");
  selectMarket("unassigned");
  expect(Array.from(container.querySelectorAll(".GroceryName")).map(item => item.textContent)).toEqual([
    "Tasche", "Schrauben", "Seife"
  ]);
  expect(mockUpdate).not.toHaveBeenCalled();
});

it("keeps zero-count filters reachable on a null snapshot and updates from later snapshots", () => {
  emitSnapshot(null);
  expect(filterLabels()).toEqual(["Alle0", "Ohne Markt0", "Hofer0", "Billa0", "Lidl0", "Bauhaus0", "Biohof0"]);
  selectMarket("hofer");
  expect(container.textContent).not.toContain("alles erledigt");
  emitSnapshot({ tomato: { name: "Tomaten", buyed: false, marketId: "hofer" } });
  expect(container.querySelector(".GroceryName")!.textContent).toBe("Tomaten");
  emitSnapshot({ tomato: { name: "Tomaten", buyed: false, marketId: "billa" } });
  expect(container.querySelector(".GroceryName")).toBeNull();
  selectMarket("billa");
  expect(container.querySelector(".GroceryName")!.textContent).toBe("Tomaten");
});

it("holds optimistic purchase rows and counts until acknowledgment without freezing other records", async () => {
  const write = deferredWrite();
  mockUpdate.mockReturnValueOnce(write.promise);
  const tomato = { name: "Tomaten", buyed: false, marketId: "hofer" };
  emitSnapshot({ tomato, milk: { name: "Milch", buyed: false, marketId: "billa" } });
  selectMarket("hofer");
  act(() => {
    Simulate.click(container.querySelector('[aria-label="Tomaten als gekauft markieren"]')!);
  });
  emitSnapshot({
    tomato: { ...tomato, buyed: true },
    milk: { name: "Hafermilch", buyed: false, marketId: "billa" }
  });
  expect(container.querySelector(".GroceryName")!.textContent).toBe("Tomaten");
  expect(filterLabels()).toContain("Hofer1");
  selectMarket("billa");
  expect(container.querySelector(".GroceryName")!.textContent).toBe("Hafermilch");
  selectMarket("hofer");
  write.resolve();
  await flushWrites();
  expect(container.querySelector(".GroceryName")).toBeNull();
  expect(filterLabels()).toContain("Hofer0");
  expect(container.textContent).not.toContain("Alles eingekauft");
});

it.each(["before", "after"])("retains a failed purchase and retries when rollback arrives %s rejection", async ordering => {
  const write = deferredWrite();
  mockUpdate.mockReturnValueOnce(write.promise);
  const tomato = { name: "Tomaten", buyed: false, marketId: "hofer" };
  emitSnapshot({ tomato });
  selectMarket("hofer");
  act(() => {
    Simulate.click(container.querySelector('[aria-label="Tomaten als gekauft markieren"]')!);
  });
  emitSnapshot({ tomato: { ...tomato, buyed: true } });
  if (ordering === "before") emitSnapshot({ tomato });
  write.reject(new Error("permission denied"));
  await flushWrites();
  expect(container.querySelector(".GroceryName")!.textContent).toBe("Tomaten");
  expect(filterLabels()).toContain("Hofer1");
  expect(container.querySelector('[role="alert"]')!.textContent).toContain("fehlgeschlagen");
  if (ordering === "after") emitSnapshot({ tomato });
  act(() => {
    Simulate.click(container.querySelector('[role="alert"] button')!);
  });
  emitSnapshot({ tomato: { ...tomato, buyed: true } });
  await flushWrites();
  expect(container.textContent).toContain("Bei Hofer alles erledigt");
  expect(container.querySelector(".GroceryName")).toBeNull();
  expect(filterLabels()).toContain("Alle0");
});

it.each([false, true])("moves an acknowledged item and preserves deliberate focus movement: %s", async moveFocus => {
  const write = deferredWrite();
  mockUpdate.mockReturnValueOnce(write.promise);
  const tomato = { name: "Tomaten", buyed: false, marketId: "hofer" };
  emitSnapshot({ tomato });
  selectMarket("hofer");
  act(() => {
    Simulate.click(container.querySelector(".ListToolbar button")!);
  });
  const select = container.querySelector<HTMLSelectElement>("#grocery-market-tomato")!;
  select.focus();
  act(() => {
    select.value = "billa";
    Simulate.change(select);
  });
  expect(mockUpdate).toHaveBeenCalledWith({ marketId: "billa" });
  emitSnapshot({ tomato: { ...tomato, marketId: "billa" } });
  expect(container.querySelector("#grocery-market-tomato")).not.toBeNull();
  if (moveFocus) container.querySelector<HTMLButtonElement>('[aria-label="Artikel hinzufügen"]')!.focus();
  write.resolve();
  await flushWrites();
  expect(container.querySelector("#grocery-market-tomato")).toBeNull();
  expect(document.activeElement).toBe(container.querySelector(
    moveFocus ? '[aria-label="Artikel hinzufügen"]' : "#market-filter-hofer"
  ));
  expect(container.querySelector(".WriteStatus")!.textContent).toContain("Billa");
  expect(container.textContent).not.toContain("alles erledigt");
});

it("does not remove a failed market assignment or announce movement", async () => {
  const write = deferredWrite();
  mockUpdate.mockReturnValueOnce(write.promise);
  const tomato = { name: "Tomaten", buyed: false, marketId: "hofer" };
  emitSnapshot({ tomato });
  selectMarket("hofer");
  act(() => {
    Simulate.click(container.querySelector(".ListToolbar button")!);
  });
  const select = container.querySelector<HTMLSelectElement>("#grocery-market-tomato")!;
  act(() => {
    select.value = "billa";
    Simulate.change(select);
  });
  emitSnapshot({ tomato: { ...tomato, marketId: "billa" } });
  write.reject(new Error("denied"));
  await flushWrites();
  expect(container.querySelector("#grocery-market-tomato")).not.toBeNull();
  expect(container.querySelector(".WriteStatus")!.textContent).toBe("");
  expect(container.querySelector('[role="alert"]')!.textContent).toContain("fehlgeschlagen");
});

function openAdd() {
  act(() => {
    Simulate.click(container.querySelector('[aria-label="Artikel hinzufügen"]')!);
  });
}

function createItem(name: string) {
  const input = document.querySelector<HTMLInputElement>('[aria-label="Artikel suchen"]')!;
  act(() => {
    input.value = name;
    Simulate.change(input);
  });
  act(() => {
    Simulate.click(document.querySelector('[data-action="create"]')!);
  });
  return input;
}

it("writes a selected-market creation and counts it only after acknowledgment", async () => {
  const write = deferredWrite();
  mockSet.mockReturnValueOnce(write.promise);
  emitSnapshot(null);
  selectMarket("lidl");
  openAdd();
  const input = createItem("  Reis  ");
  expect(mockPush).toHaveBeenCalledWith();
  expect(mockSet).toHaveBeenCalledWith({ name: "Reis", buyed: false, marketId: "lidl" });
  const created = { name: "Reis", buyed: false, marketId: "lidl" };
  emitSnapshot({ created });
  expect(filterLabels()).toContain("Lidl0");
  expect(container.querySelector(".GroceryName")).toBeNull();
  expect(input.value).toBe("  Reis  ");
  write.resolve();
  await flushWrites();
  expect(filterLabels()).toContain("Lidl1");
  expect(container.querySelector(".GroceryName")!.textContent).toBe("Reis");
  expect(input.value).toBe("");
  expect(document.body.textContent).toContain("Zu Lidl hinzugefügt");
});

it("keeps a rejected optimistic creation out of counts while retrying with a fresh id", async () => {
  const write = deferredWrite();
  mockSet.mockReturnValueOnce(write.promise);
  emitSnapshot(null);
  openAdd();
  const input = createItem("Reis");
  const created = { name: "Reis", buyed: false, marketId: null };
  emitSnapshot({ created });
  write.reject(new Error("denied"));
  await flushWrites();
  expect(filterLabels()).toContain("Alle0");
  expect(input.value).toBe("Reis");
  expect(document.querySelector('[role="alert"]')!.textContent).toContain("fehlgeschlagen");
  mockPush.mockReturnValueOnce({ key: "retry", set: mockSet });
  act(() => {
    Simulate.click(document.querySelector('[data-action="create"]')!);
  });
  emitSnapshot({ created, retry: created });
  await flushWrites();
  expect(filterLabels()).toContain("Alle1");
  emitSnapshot({ retry: created });
  expect(filterLabels()).toContain("Alle1");
  expect(mockSet).toHaveBeenCalledTimes(2);
});

it("re-adds saved history without overwriting its market unless explicitly reassigned", async () => {
  const milk = { name: "Milch", buyed: true, marketId: "billa" };
  emitSnapshot({ milk });
  selectMarket("hofer");
  openAdd();
  act(() => {
    Simulate.click(document.querySelector('[data-grocery-id="milk"]')!);
  });
  expect(mockUpdate).toHaveBeenLastCalledWith({ buyed: false });
  emitSnapshot({ milk: { ...milk, buyed: false } });
  await flushWrites();
  expect(filterLabels()).toContain("Billa1");
  expect(container.querySelector(".GroceryName")).toBeNull();
  expect(document.body.textContent).toContain("Zu Billa hinzugefügt");
  emitSnapshot({ milk });
  const select = document.querySelector<HTMLSelectElement>("#add-market")!;
  act(() => {
    select.value = "";
    Simulate.change(select);
  });
  act(() => {
    Simulate.click(document.querySelector('[data-grocery-id="milk"]')!);
  });
  expect(mockUpdate).toHaveBeenLastCalledWith({ buyed: false, marketId: null });
  emitSnapshot({ milk: { ...milk, buyed: false, marketId: null } });
  await flushWrites();
  expect(filterLabels()).toContain("Ohne Markt1");
});

it("resets the selected market to Alle when the app is mounted again", () => {
  emitSnapshot(null);
  selectMarket("bauhaus");
  act(() => {
    ReactDOM.unmountComponentAtNode(container);
    ReactDOM.render(<App />, container);
  });
  emitSnapshot(null);
  expect(container.querySelector("#market-filter-all")!.getAttribute("aria-pressed")).toBe("true");
});
