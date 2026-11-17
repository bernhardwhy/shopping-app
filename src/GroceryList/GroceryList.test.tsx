import React from "react";
import ReactDOM from "react-dom";
import { act, Simulate } from "react-dom/test-utils";
import GroceryList from "./GroceryList";
import { GroceryType } from "../groceryType";
import { MarketFilter, getMarketViews } from "../markets";

let container: HTMLDivElement;
const changeData = jest.fn();
const changeName = jest.fn();
const changeArea = jest.fn();
const changeMarket = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  changeData.mockResolvedValue(undefined);
  changeName.mockResolvedValue(undefined);
  changeArea.mockResolvedValue(undefined);
  changeMarket.mockResolvedValue(undefined);
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => {
    ReactDOM.unmountComponentAtNode(container);
  });
  container.remove();
});

function renderList(groceries: GroceryType[], selectedMarket: MarketFilter = "all", completed = false) {
  act(() => {
    ReactDOM.render(
      <GroceryList
        groceries={groceries}
        changeData={changeData}
        changeGrocerieName={changeName}
        changeGrocerieArea={changeArea}
        changeGrocerieMarket={changeMarket}
        selectedMarket={selectedMarket}
        marketViews={getMarketViews(groceries)}
        onSelectMarket={jest.fn()}
        pendingIds={[]}
        completed={completed}
        movedItemId={null}
      />,
      container
    );
  });
}

it("groups items in category order with missing and unknown areas under Sonstiges", () => {
  const groceries: GroceryType[] = [
    { id: "screw", name: "Schrauben", buyed: false, area: "unknown" },
    { id: "milk", name: "Milch", buyed: false, area: "Bcooling" },
    { id: "tomato", name: "Tomaten", buyed: false, area: "Avegetables" },
    { id: "bag", name: "Tasche", buyed: false, area: "" }
  ];
  const original = groceries.slice();
  renderList(groceries);
  const sections = Array.from(container.querySelectorAll("section"));
  expect(sections.map(section => section.querySelector("h2")!.textContent)).toEqual([
    "Obst & Gemüse", "Milchprodukte & Eier", "Sonstiges"
  ]);
  expect(sections.map(section =>
    Array.from(section.querySelectorAll(".GroceryName")).map(item => item.textContent)
  )).toEqual([["Tomaten"], ["Milch"], ["Schrauben", "Tasche"]]);
  expect(groceries).toEqual(original);
});

it("calls the purchase callback without blocking the remaining list", () => {
  renderList([{ id: "tomato", name: "Tomaten", buyed: false, area: "Avegetables" }]);
  act(() => {
    Simulate.click(
      container.querySelector('[aria-label="Tomaten als gekauft markieren"]')!
    );
  });
  expect(changeData).toHaveBeenCalledWith("tomato", false);
  expect(container.querySelector(".GroceryName")!.textContent).toBe("Tomaten");
  expect(container.textContent).not.toContain("Alles eingekauft");
  renderList([], "all", true);
  expect(container.textContent).toContain("Alles eingekauft");
  renderList([{ id: "milk", name: "Milch", buyed: false, area: "Bcooling" }]);
  expect(container.textContent).toContain("Milch");
  expect(container.textContent).not.toContain("Alles eingekauft");
});

it("edits name and category immediately and returns to checklist mode with Fertig", () => {
  renderList([{ id: "tomato", name: "Tomaten", buyed: false, area: "Avegetables" }]);
  act(() => {
    Simulate.click(container.querySelector(".ListToolbar button")!);
  });
  const input = container.querySelector("input")!;
  const select = container.querySelector<HTMLSelectElement>("#grocery-area-tomato")!;
  act(() => {
    input.value = "Paradeiser";
    Simulate.change(input);
    select.value = "Hother";
    Simulate.change(select);
  });
  expect(changeName).toHaveBeenCalledWith("tomato", "Paradeiser");
  expect(changeArea).toHaveBeenCalledWith("tomato", "Hother");
  const done = Array.from(container.querySelectorAll("button")).find(
    button => button.textContent === "Fertig"
  )!;
  act(() => {
    Simulate.click(done);
  });
  expect(container.querySelector("input")).toBeNull();
  expect(container.querySelector('[aria-label="Tomaten als gekauft markieren"]')).not.toBeNull();
});

it("keeps keyboard focus on the category field when its row moves to another section", () => {
  const grocery = { id: "tomato", name: "Tomaten", buyed: false, area: "Avegetables" };
  renderList([grocery]);
  act(() => {
    Simulate.click(container.querySelector(".ListToolbar button")!);
  });
  const select = container.querySelector<HTMLSelectElement>("#grocery-area-tomato")!;
  select.focus();
  renderList([{ ...grocery, area: "Hother" }]);
  expect(document.activeElement).toBe(container.querySelector("#grocery-area-tomato"));
  expect(container.querySelector<HTMLSelectElement>("#grocery-area-tomato")!.value).toBe("Hother");
});

it("shows market labels in Alle but not redundantly in a selected store", () => {
  const groceries = [
    { id: "tomato", name: "Tomaten", buyed: false, marketId: "hofer" },
    { id: "screw", name: "Schrauben", buyed: false, marketId: "future" }
  ];
  renderList(groceries);
  expect(Array.from(container.querySelectorAll(".GroceryMarket")).map(item => item.textContent)).toEqual([
    "Hofer", "Ohne Markt"
  ]);
  renderList([groceries[0]], "hofer");
  expect(container.querySelector(".GroceryMarket")).toBeNull();
});

it("offers explicit repair and null clearing for unknown market assignments", () => {
  renderList([{ id: "screw", name: "Schrauben", buyed: false, marketId: "future" }]);
  act(() => {
    Simulate.click(container.querySelector(".ListToolbar button")!);
  });
  expect(container.textContent).toContain("Unbekannter Markt");
  expect(changeMarket).not.toHaveBeenCalled();
  const select = container.querySelector<HTMLSelectElement>("#grocery-market-screw")!;
  act(() => {
    select.value = "";
    Simulate.change(select);
  });
  expect(changeMarket).toHaveBeenCalledWith("screw", null);
});

it("retains a failed name draft and retries the exact edit", async () => {
  changeName.mockRejectedValueOnce(new Error("denied"));
  renderList([{ id: "tomato", name: "Tomaten", buyed: false }]);
  act(() => {
    Simulate.click(container.querySelector(".ListToolbar button")!);
  });
  const input = container.querySelector<HTMLInputElement>("#grocery-name-tomato")!;
  act(() => {
    input.value = "Paradeiser";
    Simulate.change(input);
  });
  await new Promise(resolve => setTimeout(resolve, 0));
  act(() => {});
  expect(input.value).toBe("Paradeiser");
  expect(container.querySelector('[role="alert"]')!.textContent).toContain("fehlgeschlagen");
  act(() => {
    Simulate.click(container.querySelector('[role="alert"] button')!);
  });
  expect(changeName).toHaveBeenLastCalledWith("tomato", "Paradeiser");
  renderList([{ id: "tomato", name: "Paradeiser", buyed: false }]);
  await new Promise(resolve => setTimeout(resolve, 0));
  act(() => {});
  expect(input.value).toBe("Paradeiser");
  expect(container.querySelector('[role="alert"]')).toBeNull();
});

it("retains a failed category draft across rollback and retries its destination", async () => {
  changeArea.mockRejectedValueOnce(new Error("denied"));
  const grocery = { id: "tomato", name: "Tomaten", buyed: false, area: "Avegetables" };
  renderList([grocery]);
  act(() => {
    Simulate.click(container.querySelector(".ListToolbar button")!);
  });
  act(() => {
    const select = container.querySelector<HTMLSelectElement>("#grocery-area-tomato")!;
    select.value = "Hother";
    Simulate.change(select);
  });
  await new Promise(resolve => setTimeout(resolve, 0));
  renderList([grocery]);
  expect(container.querySelector<HTMLSelectElement>("#grocery-area-tomato")!.value).toBe("Hother");
  expect(container.querySelector('[role="alert"]')!.textContent).toContain("fehlgeschlagen");
  act(() => {
    Simulate.click(container.querySelector('[role="alert"] button')!);
  });
  expect(changeArea).toHaveBeenLastCalledWith("tomato", "Hother");
  renderList([{ ...grocery, area: "Hother" }]);
  await new Promise(resolve => setTimeout(resolve, 0));
  act(() => {});
  expect(container.querySelector('[role="alert"]')).toBeNull();
});
