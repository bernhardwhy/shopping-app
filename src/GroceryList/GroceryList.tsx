import React, { Component } from "react";
import { Button, IconButton, TextField } from "@material-ui/core";
import ShoppingCartOutlined from "@material-ui/icons/ShoppingCartOutlined";
import DoneOutlined from "@material-ui/icons/DoneOutlined";
import CheckBoxOutlineBlank from "@material-ui/icons/CheckBoxOutlineBlank";
import SettingsOutlined from "@material-ui/icons/SettingsOutlined";
import CheckOutlined from "@material-ui/icons/CheckOutlined";
import { GroceryType } from "../groceryType";
import { isMarketId, marketLabel, markets, MarketFilter, MarketId, MarketView } from "../markets";
import "./GroceryList.css";

type GroceryProps = {
  groceries: GroceryType[];
  changeData: (groceryId: string, isBuyed: boolean) => Promise<void>;
  changeGrocerieName: (groceryId: string, groceryName: string) => Promise<void>;
  changeGrocerieArea: (groceryId: string, groceryArea: string) => Promise<void>;
  changeGrocerieMarket: (groceryId: string, market: MarketId | null) => Promise<void>;
  selectedMarket: MarketFilter;
  marketViews: MarketView[];
  onSelectMarket: (market: MarketFilter) => void;
  pendingIds: string[];
  completed: boolean;
  movedItemId: string | null;
};

type GroceryState = {
  editMode: boolean;
  names: Record<string, string>;
  areas: Record<string, string>;
  marketDrafts: Record<string, string>;
  errors: Record<string, { name: string; retry: () => void }>;
};

const OtherArea = { identifier: "Hother", name: "Sonstiges" };

const AreaNames = [
  { identifier: "Avegetables", name: "Obst & Gemüse" },
  { identifier: "Bcooling", name: "Milchprodukte & Eier" },
  { identifier: "Cmeat", name: "Fleisch & Fisch" },
  { identifier: "DdryFood", name: "Trockenware" },
  { identifier: "Ebakery", name: "Brot" },
  { identifier: "Fhygiene", name: "Hygieneabteilung" },
  { identifier: "Gcakestuff", name: "Backabteilung" },
  OtherArea
];

function getArea(identifier?: string | null) {
  return AreaNames.find(area => area.identifier === identifier) || OtherArea;
}

export default class GroceryList extends Component<GroceryProps, GroceryState, string | null> {
  state: GroceryState = { editMode: false, names: {}, areas: {}, marketDrafts: {}, errors: {} };
  private list = React.createRef<HTMLDivElement>();
  private mounted = false;
  private operations = new Map<string, number>();

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  getSnapshotBeforeUpdate() {
    const active = document.activeElement;
    return active instanceof HTMLElement && this.list.current?.contains(active)
      ? active.id
      : null;
  }

  componentDidUpdate(
    previousProps: GroceryProps,
    previousState: GroceryState,
    focusedFieldId: string | null
  ) {
    // Regrouping an edited item replaces its section's input elements.
    if (focusedFieldId) {
      const field = document.getElementById(focusedFieldId);
      if (field && this.list.current?.contains(field) && field !== document.activeElement) {
        field.focus();
      } else if (focusedFieldId === `grocery-market-${this.props.movedItemId}`) {
        document.getElementById(`market-filter-${this.props.selectedMarket}`)?.focus();
      }
    }
    if (previousProps.groceries.length > 0 && this.props.groceries.length === 0) {
      this.setState({ editMode: false });
    }
  }

  toggleEditMode = () => {
    this.setState((state: GroceryState) => ({
      editMode: !state.editMode
    }));
  };

  private runAction = async (
    grocery: GroceryType,
    field: string,
    action: () => Promise<void>,
    onSuccess?: () => void
  ): Promise<void> => {
    const key = `${grocery.id}:${field}`;
    const version = (this.operations.get(key) ?? 0) + 1;
    this.operations.set(key, version);
    this.setState(state => {
      const errors = { ...state.errors };
      delete errors[key];
      return { errors };
    });
    try {
      await action();
    } catch (error) {
      if (this.mounted && this.operations.get(key) === version) {
        this.setState(state => ({
          errors: {
            ...state.errors,
            [key]: {
              name: grocery.name,
              retry: () => { void this.runAction(grocery, field, action, onSuccess); }
            }
          }
        }));
      }
      return;
    }
    if (this.mounted && this.operations.get(key) === version && onSuccess) onSuccess();
  };

  private editName = (grocery: GroceryType, value: string) => {
    this.setState(state => ({ names: { ...state.names, [grocery.id]: value } }));
    void this.runAction(grocery, "name",
      () => this.props.changeGrocerieName(grocery.id, value),
      () => this.setState(state => {
        const names = { ...state.names };
        delete names[grocery.id];
        return { names };
      })
    );
  };

  private editArea = (grocery: GroceryType, value: string) => {
    this.setState(state => ({ areas: { ...state.areas, [grocery.id]: value } }));
    void this.runAction(grocery, "area",
      () => this.props.changeGrocerieArea(grocery.id, value),
      () => this.setState(state => {
        const areas = { ...state.areas };
        delete areas[grocery.id];
        return { areas };
      })
    );
  };

  private editMarket = (grocery: GroceryType, value: string) => {
    if (value !== "" && !isMarketId(value)) {
      void this.runAction(grocery, "market", () => Promise.reject(new Error("Ungültiger Markt.")));
      return;
    }
    this.setState(state => ({ marketDrafts: { ...state.marketDrafts, [grocery.id]: value } }));
    const market = isMarketId(value) ? value : null;
    void this.runAction(grocery, "market",
      () => this.props.changeGrocerieMarket(grocery.id, market),
      () => this.setState(state => {
        const marketDrafts = { ...state.marketDrafts };
        delete marketDrafts[grocery.id];
        return { marketDrafts };
      })
    );
  };

  render() {
    const { selectedMarket, completed } = this.props;
    const emptyTitle = completed
      ? selectedMarket === "all" ? "Alles eingekauft"
        : selectedMarket === "unassigned" ? "Alle Artikel ohne Markt erledigt"
          : `Bei ${marketLabel(selectedMarket)} alles erledigt`
      : selectedMarket === "all" ? "Nichts einzukaufen"
        : selectedMarket === "unassigned" ? "Keine Artikel ohne Markt"
          : `Keine Artikel bei ${marketLabel(selectedMarket)}`;
    return (
      <div className="GroceryList" ref={this.list}>
        <nav className="MarketFilters" aria-label="Märkte">
          {this.props.marketViews.map(view => (
            <Button
              key={view.id}
              id={`market-filter-${view.id}`}
              aria-pressed={selectedMarket === view.id}
              onClick={() => this.props.onSelectMarket(view.id)}
              className="MarketFilter"
            >
              {selectedMarket === view.id && <CheckOutlined />}
              {view.label}<span className="MarketCount">{view.count}</span>
            </Button>
          ))}
        </nav>
        {Object.entries(this.state.errors).map(([key, error]) => (
          <div className="ListError" role="alert" key={key}>
            <p>{error.name}: Speichern fehlgeschlagen.</p>
            <Button color="primary" onClick={error.retry}>Erneut versuchen</Button>
          </div>
        ))}
        {this.props.groceries.length > 0 ? (
          <React.Fragment>
            <div className="ListToolbar">
              <p>Nach Bereichen sortiert</p>
              <Button
                onClick={this.toggleEditMode}
                color="primary"
                aria-pressed={this.state.editMode}
              >
                <SettingsOutlined className="EditIcon" />
                {this.state.editMode ? "Fertig" : "Bearbeiten"}
              </Button>
            </div>
            {AreaNames.map(area => {
              const groceries = this.props.groceries.filter(
                grocery => getArea(grocery.area).identifier === area.identifier
              );
              if (groceries.length === 0) return null;
              return (
                <section
                  className="GrocerySection"
                  key={area.identifier}
                  aria-labelledby={`category-${area.identifier}`}
                >
                  <h2 id={`category-${area.identifier}`}>{area.name}</h2>
                  <ul className="GroceryItems">
                    {groceries.map(grocery => (
                      <li className="GroceryItem" key={grocery.id}>
                        {this.state.editMode ? (
                          <div className="GroceryEditFields">
                            <TextField
                              id={`grocery-name-${grocery.id}`}
                              label="Artikelname"
                              variant="outlined"
                              fullWidth
                              disabled={this.props.pendingIds.includes(grocery.id)}
                              value={this.state.names[grocery.id] ?? grocery.name}
                              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                                this.editName(grocery, event.currentTarget.value)
                              }
                            />
                            <label className="AreaField" htmlFor={`grocery-area-${grocery.id}`}>
                              Bereich
                              <select
                                id={`grocery-area-${grocery.id}`}
                                disabled={this.props.pendingIds.includes(grocery.id)}
                                value={this.state.areas[grocery.id] ?? getArea(grocery.area).identifier}
                                onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                                  this.editArea(grocery, event.currentTarget.value)
                                }
                              >
                                {AreaNames.map(option => (
                                  <option key={option.identifier} value={option.identifier}>
                                    {option.name}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <div className="AreaField">
                              <label htmlFor={`grocery-market-${grocery.id}`}>Markt</label>
                              <select
                                id={`grocery-market-${grocery.id}`}
                                value={this.state.marketDrafts[grocery.id] ?? grocery.marketId ?? ""}
                                aria-disabled={this.props.pendingIds.includes(grocery.id)}
                                onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                                  if (this.props.pendingIds.includes(grocery.id)) {
                                    event.currentTarget.value = this.state.marketDrafts[grocery.id] ?? grocery.marketId ?? "";
                                    return;
                                  }
                                  this.editMarket(grocery, event.currentTarget.value);
                                }}
                              >
                                {grocery.marketId && !isMarketId(grocery.marketId) && (
                                  <option value={grocery.marketId} disabled>Unbekannter Markt</option>
                                )}
                                <option value="">Ohne Markt</option>
                                {markets.map(market => (
                                  <option key={market.id} value={market.id}>{market.label}</option>
                                ))}
                              </select>
                              {grocery.marketId && !isMarketId(grocery.marketId) && (
                                <small>Unbekannter Markt. Bitte neu zuordnen.</small>
                              )}
                            </div>
                            {this.props.pendingIds.includes(grocery.id) && <small role="status">Wird gespeichert …</small>}
                          </div>
                        ) : (
                          <React.Fragment>
                            <IconButton
                              className="PurchaseButton"
                              color="primary"
                              aria-label={`${grocery.name} als gekauft markieren`}
                              disabled={this.props.pendingIds.includes(grocery.id)}
                              onClick={() => {
                                void this.runAction(grocery, "buyed",
                                  () => this.props.changeData(grocery.id, grocery.buyed));
                              }}
                            >
                              <CheckBoxOutlineBlank />
                            </IconButton>
                            <div className="GroceryDetails">
                              <span className="GroceryName">{grocery.name}</span>
                              {selectedMarket === "all" && (
                                <span className="GroceryMarket">{marketLabel(grocery.marketId)}</span>
                              )}
                              {this.props.pendingIds.includes(grocery.id) && <small role="status">Wird gespeichert …</small>}
                            </div>
                          </React.Fragment>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </React.Fragment>
        ) : (
          <div className="EmptyList" role="status">
            {completed
              ? <DoneOutlined className="EmptyListIcon" />
              : <ShoppingCartOutlined className="EmptyListIcon" />}
            <h2>{emptyTitle}</h2>
            <p>Füge Artikel für deinen nächsten Einkauf hinzu.</p>
          </div>
        )}
      </div>
    );
  }
}
