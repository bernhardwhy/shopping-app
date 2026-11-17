import React from "react";
import ReactDOM from "react-dom";
import { act, Simulate } from "react-dom/test-utils";
import SearchDialog from "./SearchDialog";
import { GroceryType } from "../groceryType";
import { MarketFilter } from "../markets";

let container: HTMLDivElement;
const addItem = jest.fn();
const readdItem = jest.fn();
const close = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  addItem.mockReset();
  addItem.mockResolvedValue(undefined);
  readdItem.mockReset();
  readdItem.mockResolvedValue(undefined);
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => {
    ReactDOM.unmountComponentAtNode(container);
  });
  container.remove();
});

function renderDialog(groceries: GroceryType[], selectedMarket: MarketFilter = "all", open = true) {
  act(() => {
    ReactDOM.render(
      <SearchDialog
        openDialog={open}
        selectedMarket={selectedMarket}
        pendingIds={[]}
        onCloseDialog={close}
        groceries={groceries}
        addNewGrocerieItem={addItem}
        handleListItemClicked={readdItem}
      />,
      container
    );
  });
}

it("re-adds history to its saved market and labels active matches as already on the list", async () => {
  renderDialog([
    { id: "milk", name: "Milch", buyed: true, area: "Bcooling", marketId: "billa" },
    { id: "active", name: "Tomaten", buyed: false, area: "Avegetables" }
  ]);
  const dialog = document.querySelector('[role="dialog"]')!;
  expect(dialog.getAttribute("aria-labelledby")).toBe(dialog.querySelector("h2")!.id);
  expect(dialog.textContent).toContain("Milch");
  expect(dialog.textContent).toContain("Bereits auf der Liste");
  expect(dialog.querySelector('[data-grocery-id="active"]')!.getAttribute("aria-disabled")).toBe("true");
  const historyItem = dialog.querySelector('[data-grocery-id="milk"]')!;
  expect(historyItem.textContent).toContain("Billa");
  act(() => {
    Simulate.click(historyItem);
  });
  expect(readdItem).toHaveBeenCalledWith("milk", true, undefined);
  await flushWrites();
  expect(document.body.textContent).toContain("Zu Billa hinzugefügt");
  expect(document.querySelector(".MuiSnackbarContent-root")!.getAttribute("role")).toBe("status");
});

it("creates a trimmed item at the selected market and clears search only after acknowledgment", async () => {
  const write = deferredWrite();
  addItem.mockReturnValueOnce(write.promise);
  renderDialog([]);
  const dialog = document.querySelector('[role="dialog"]')!;
  const input = dialog.querySelector("input")!;
  act(() => {
    input.value = "  Kaffee  ";
    Simulate.change(input);
  });
  const create = dialog.querySelector('[data-action="create"]')!;
  act(() => {
    Simulate.click(create);
  });
  expect(addItem).toHaveBeenCalledWith("Kaffee", null);
  expect(input.value).toBe("  Kaffee  ");
  expect(document.querySelector(".MuiSnackbarContent-message")).toBeNull();
  write.resolve();
  await flushWrites();
  expect(input.value).toBe("");
});

it("closes the full-screen dialog without changing the shopping list", () => {
  renderDialog([]);
  act(() => {
    Simulate.click(document.querySelector('[role="dialog"] button')!);
  });
  expect(close).toHaveBeenCalledTimes(1);
  expect(addItem).not.toHaveBeenCalled();
  expect(readdItem).not.toHaveBeenCalled();
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

function setSearch(value: string) {
  const input = document.querySelector<HTMLInputElement>('[aria-label="Artikel suchen"]')!;
  act(() => {
    input.value = value;
    Simulate.change(input);
  });
}

it("defaults new items from the selected market and resets to unassigned on reopening from Alle", () => {
  renderDialog([], "hofer");
  expect(document.querySelector<HTMLSelectElement>("#add-market")!.value).toBe("hofer");
  renderDialog([], "hofer", false);
  renderDialog([], "all");
  expect(document.querySelector<HTMLSelectElement>("#add-market")!.value).toBe("");
  renderDialog([], "all", false);
  renderDialog([], "unassigned");
  expect(document.querySelector<HTMLSelectElement>("#add-market")!.value).toBe("");
});

it("preserves a history destination until the user deliberately overrides the selector", async () => {
  const milk = { id: "milk", name: "Milch", buyed: true, marketId: "billa" };
  renderDialog([milk], "hofer");
  act(() => {
    Simulate.click(document.querySelector('[data-grocery-id="milk"]')!);
  });
  expect(readdItem).toHaveBeenLastCalledWith("milk", true, undefined);
  await flushWrites();
  const select = document.querySelector<HTMLSelectElement>("#add-market")!;
  act(() => {
    select.value = "";
    Simulate.change(select);
  });
  act(() => {
    Simulate.click(document.querySelector('[data-grocery-id="milk"]')!);
  });
  expect(readdItem).toHaveBeenLastCalledWith("milk", true, null);
  await flushWrites();
});

it("always offers valid creation beside matches and treats search punctuation literally", () => {
  renderDialog([{ id: "active", name: "Milch", buyed: false }]);
  setSearch("Milch");
  expect(document.querySelector('[data-action="create"]')!.textContent).toContain("Milch");
  expect(document.querySelector('[data-grocery-id="active"]')!.textContent).toContain("Bereits auf der Liste");
  setSearch("[");
  expect(document.querySelector('[data-action="create"]')!.textContent).toContain("[");
  setSearch("   ");
  expect(document.querySelector('[data-action="create"]')).toBeNull();
  expect(addItem).not.toHaveBeenCalled();
});

it("retains a failed creation's text and market for retry and never announces false success", async () => {
  const write = deferredWrite();
  addItem.mockReturnValueOnce(write.promise);
  renderDialog([], "lidl");
  setSearch("Reis");
  act(() => {
    Simulate.click(document.querySelector('[data-action="create"]')!);
  });
  write.reject(new Error("denied"));
  await flushWrites();
  expect(document.querySelector<HTMLInputElement>('[aria-label="Artikel suchen"]')!.value).toBe("Reis");
  expect(document.querySelector<HTMLSelectElement>("#add-market")!.value).toBe("lidl");
  expect(document.querySelector('[role="alert"]')!.textContent).toContain("fehlgeschlagen");
  expect(document.querySelector(".MuiSnackbarContent-message")).toBeNull();
  renderDialog([], "lidl", false);
  renderDialog([], "hofer");
  expect(document.querySelector<HTMLSelectElement>("#add-market")!.value).toBe("lidl");
  expect(document.querySelector('[role="alert"]')!.textContent).toContain("fehlgeschlagen");
  act(() => {
    Simulate.click(document.querySelector('[data-action="create"]')!);
  });
  await flushWrites();
  expect(addItem).toHaveBeenLastCalledWith("Reis", "lidl");
  expect(document.body.textContent).toContain("Zu Lidl hinzugefügt");
});

it("keeps a failed re-add available with its saved destination", async () => {
  const write = deferredWrite();
  readdItem.mockReturnValueOnce(write.promise);
  renderDialog([{ id: "milk", name: "Milch", buyed: true, marketId: "billa" }], "hofer");
  act(() => {
    Simulate.click(document.querySelector('[data-grocery-id="milk"]')!);
  });
  write.reject(new Error("denied"));
  await flushWrites();
  expect(document.querySelector('[data-grocery-id="milk"]')!.textContent).toContain("Billa");
  expect(document.querySelector('[role="alert"]')).not.toBeNull();
  expect(document.querySelector(".MuiSnackbarContent-message")).toBeNull();
});
