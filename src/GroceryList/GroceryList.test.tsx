import React from "react";
import ReactDOM from "react-dom";
import GroceryList from "./GroceryList";
import { GroceryType } from "../groceryType";

it("renders the grocery name", () => {
  const div = document.createElement("div");
  const groceries: GroceryType[] = [{
    id: "213",
    name: "test",
    buyed: true,
    area: "Hother"
  }];
  ReactDOM.render(
    <GroceryList
      groceries={groceries}
      changeData={jest.fn()}
      changeGrocerieName={jest.fn()}
      changeGrocerieArea={jest.fn()}
    />,
    div
  );
  expect(div.textContent).toContain("test");
  ReactDOM.unmountComponentAtNode(div);
});
