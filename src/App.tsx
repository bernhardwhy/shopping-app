import React, { Component } from "react";
import "./App.css";
import { firebaseDB } from "./shared/config";
import { GroceryType } from "./groceryType";

import { Button, Fab } from "@material-ui/core";
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core/styles";
import GroceryList from "./GroceryList/GroceryList";
import SearchDialog from "./SearchDialog/SearchDialog";
import AddCircleOutlineSharp from "@material-ui/icons/AddCircleOutlineSharp";
import {
  filterGroceries, getMarketViews, isMarketId, marketLabel, MarketFilter, MarketId
} from "./markets";

const theme = createMuiTheme({
  palette: {
    primary: { main: "#245C3A" },
    background: { default: "#F7F6F2", paper: "#FFFFFF" },
    text: { primary: "#202923", secondary: "#56635A" }
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    button: { textTransform: "none", fontWeight: 600 }
  },
  shape: { borderRadius: 12 },
  overrides: {
    MuiButton: { root: { minHeight: 44 } },
    MuiIconButton: { root: { minWidth: 44, minHeight: 44 } },
    MuiButtonBase: {
      root: {
        "&:focus-visible": { outline: "3px solid #245C3A", outlineOffset: 3 }
      }
    },
    MuiSnackbarContent: { root: { backgroundColor: "#245C3A" } }
  }
});

type AppState = {
  groceries: GroceryType[];
  loading: boolean;
  errorLoadingData: boolean;
  dialogOpen: boolean;
  selectedMarket: MarketFilter;
  pendingIds: string[];
  completedFilter: MarketFilter | null;
  movedItemId: string | null;
  statusMessage: string;
};

type GroceryRecords = Record<string, Omit<GroceryType, "id">>;
type MembershipPatch = { buyed?: boolean; marketId?: string | null };
type PendingMembership = {
  before: GroceryType;
  patch: MembershipPatch;
  failed: boolean;
};

export default class App extends Component<{}, AppState> {
  state: AppState = {
    groceries: [],
    loading: true,
    errorLoadingData: false,
    dialogOpen: false,
    selectedMarket: "all",
    pendingIds: [],
    completedFilter: null,
    movedItemId: null,
    statusMessage: ""
  };

  private groceriesDatabase = firebaseDB.database().ref().child("groceries");
  private latestGroceries: GroceryType[] = [];
  private membershipWrites = new Map<string, PendingMembership>();
  private creations = new Map<string, boolean>();
  private mounted = false;

  componentDidMount() {
    this.mounted = true;
    this.fetchData();
  }

  componentWillUnmount() {
    this.mounted = false;
    this.groceriesDatabase.off("value", this.handleSnapshot);
  }

  handleSnapshot = (snap: { val: () => GroceryRecords | null }) => {
    const records = snap.val() ?? {};
    this.latestGroceries = Object.entries(records).map(([id, grocery]) => ({
      ...grocery,
      id
    }));
    this.reconcileFailedWrites();
    this.publish({ loading: false, errorLoadingData: false });
  };

  private reconcileFailedWrites() {
    this.membershipWrites.forEach((write, id) => {
      if (!write.failed) return;
      const current = this.latestGroceries.find(item => item.id === id);
      const stillOptimistic = current &&
        (write.patch.buyed === undefined || current.buyed === write.patch.buyed) &&
        (!("marketId" in write.patch) || (current.marketId ?? null) === (write.patch.marketId ?? null));
      if (!stillOptimistic) this.membershipWrites.delete(id);
    });
    this.creations.forEach((failed, id) => {
      if (failed && !this.latestGroceries.some(item => item.id === id)) {
        this.creations.delete(id);
      }
    });
  }

  private displayedGroceries(): GroceryType[] {
    const groceries = this.latestGroceries
      .filter(item => !this.creations.has(item.id))
      .map(item => {
        const write = this.membershipWrites.get(item.id);
        if (!write) return item;
        // Value listeners fire optimistically; mask only the fields awaiting acknowledgment.
        return {
          ...item,
          ...("buyed" in write.patch ? { buyed: write.before.buyed } : {}),
          ...("marketId" in write.patch ? { marketId: write.before.marketId } : {})
        };
      });
    this.membershipWrites.forEach((write, id) => {
      if (!write.failed && !groceries.some(item => item.id === id)) {
        groceries.push(write.before);
      }
    });
    return groceries;
  }

  private publish(changes: Partial<AppState> = {}) {
    if (!this.mounted) return;
    this.setState(state => ({
      ...state,
      groceries: this.displayedGroceries(),
      pendingIds: Array.from(this.membershipWrites)
        .filter(([, write]) => !write.failed)
        .map(([id]) => id),
      ...changes
    }));
  }

  selectMarket = (selectedMarket: MarketFilter) => {
    this.setState({
      selectedMarket, completedFilter: null, movedItemId: null, statusMessage: ""
    });
  };

  fetchData = () => {
    this.groceriesDatabase.off("value", this.handleSnapshot);
    this.setState({ loading: true, errorLoadingData: false });
    this.groceriesDatabase.on(
      "value",
      this.handleSnapshot,
      () => {
        this.setState({ loading: false, errorLoadingData: true });
      }
    );
  };

  private async writeMembership(groceryId: string, patch: MembershipPatch): Promise<void> {
    if (this.membershipWrites.has(groceryId)) {
      throw new Error("Die vorherige Änderung wird noch synchronisiert.");
    }
    const before = this.state.groceries.find(item => item.id === groceryId);
    if (!before) throw new Error("Der Artikel ist nicht mehr verfügbar.");
    const selectedMarket = this.state.selectedMarket;
    const write = { before, patch, failed: false };
    this.membershipWrites.set(groceryId, write);
    this.publish({ statusMessage: "", movedItemId: null, completedFilter: null });
    try {
      await firebaseDB.database().ref().child("groceries/" + groceryId).update(patch);
    } catch (error) {
      write.failed = true;
      this.reconcileFailedWrites();
      this.publish();
      throw error;
    }
    this.membershipWrites.delete(groceryId);
    const remaining = filterGroceries(this.displayedGroceries(), selectedMarket);
    const sameView = this.state.selectedMarket === selectedMarket;
    const assignment = patch.buyed === undefined && "marketId" in patch;
    this.publish({
      completedFilter: sameView && patch.buyed === true && remaining.length === 0
        ? selectedMarket : null,
      movedItemId: assignment && sameView && !remaining.some(item => item.id === groceryId)
        ? groceryId : null,
      statusMessage: assignment ? `${before.name}: ${marketLabel(patch.marketId)}.` : ""
    });
  }

  changeData = async (
    groceryId: string, isBuyed: boolean, marketOverride?: MarketId | null
  ): Promise<void> => {
    if (marketOverride !== undefined && marketOverride !== null && !isMarketId(marketOverride)) {
      throw new Error("Ungültiger Markt.");
    }
    const current = this.state.groceries.find(item => item.id === groceryId);
    if (!current || current.buyed !== isBuyed) {
      throw new Error("Die Einkaufsliste hat sich geändert. Bitte erneut versuchen.");
    }
    await this.writeMembership(groceryId, {
      buyed: !isBuyed,
      ...(marketOverride !== undefined ? { marketId: marketOverride } : {})
    });
    if ("vibrate" in navigator) navigator.vibrate(100);
  };

  changeGrocerieMarket = async (groceryId: string, marketId: MarketId | null): Promise<void> => {
    if (marketId !== null && !isMarketId(marketId)) throw new Error("Ungültiger Markt.");
    await this.writeMembership(groceryId, { marketId });
  };

  changeGrocerieName = async (groceryId: string, groceryName: string): Promise<void> => {
    if (!groceryName.trim()) throw new Error("Bitte einen Artikelnamen eingeben.");
    await firebaseDB.database().ref().child("groceries/" + groceryId).update({
      name: groceryName
    });
  };

  changeGrocerieArea = async (groceryId: string, groceryArea: string): Promise<void> => {
    await firebaseDB.database().ref().child("groceries/" + groceryId).update({
      area: groceryArea
    });
  };

  addData = async (newGrocerieName: string, marketId: MarketId | null): Promise<void> => {
    const name = newGrocerieName.trim();
    if (!name) throw new Error("Bitte einen Artikelnamen eingeben.");
    if (marketId !== null && !isMarketId(marketId)) throw new Error("Ungültiger Markt.");
    const reference = this.groceriesDatabase.push();
    const id = reference.key;
    if (!id) throw new Error("Der Artikel konnte nicht angelegt werden.");
    this.creations.set(id, false);
    this.publish();
    try {
      await reference.set({ name, buyed: false, marketId });
    } catch (error) {
      this.creations.set(id, true);
      this.reconcileFailedWrites();
      this.publish();
      throw error;
    }
    this.creations.delete(id);
    this.publish();
  };

  handleDialogClose = () => {
    this.setState({ dialogOpen: false });
  };

  handleDialogOpen = () => {
    this.setState({ dialogOpen: true });
  };

  render() {
    const { groceries, selectedMarket } = this.state;
    const groceriesToBuy = filterGroceries(groceries, selectedMarket);
    const total = filterGroceries(groceries, "all").length;
    const selectedLabel = selectedMarket === "unassigned" ? "Ohne Markt" : marketLabel(selectedMarket);
    return (
      <MuiThemeProvider theme={theme}>
        <div className="App">
          <main className="AppContent">
            <header className="AppHeader">
              <p className="AppEyebrow">Dein Einkauf</p>
              <h1>Einkaufsliste</h1>
              <p className="AppSummary" aria-live="polite" aria-atomic="true">
                {this.state.loading
                  ? "Einen Moment bitte"
                  : this.state.errorLoadingData
                    ? "Keine Verbindung zur Einkaufsliste"
                    : selectedMarket === "all"
                      ? `${total} Artikel offen`
                      : `${groceriesToBuy.length} ${selectedMarket === "unassigned" ? "ohne Markt" : `bei ${selectedLabel}`} / ${total} insgesamt`}
              </p>
            </header>
            {this.state.errorLoadingData ? (
              <div className="StatusPanel" role="alert">
                <h2>Keine Verbindung</h2>
                <p>Die Einkaufsliste konnte nicht geladen werden.</p>
                <Button onClick={this.fetchData} variant="outlined" color="primary">
                  Erneut versuchen
                </Button>
              </div>
            ) : this.state.loading ? (
              <p className="StatusPanel" role="status">
                Einkaufsliste wird geladen …
              </p>
            ) : (
              <GroceryList
                groceries={groceriesToBuy}
                changeData={this.changeData}
                changeGrocerieName={this.changeGrocerieName}
                changeGrocerieArea={this.changeGrocerieArea}
                changeGrocerieMarket={this.changeGrocerieMarket}
                selectedMarket={selectedMarket}
                marketViews={getMarketViews(groceries)}
                onSelectMarket={this.selectMarket}
                pendingIds={this.state.pendingIds}
                completed={this.state.completedFilter === selectedMarket}
                movedItemId={this.state.movedItemId}
              />
            )}
            <p className="WriteStatus" role="status" aria-live="polite" aria-atomic="true">
              {this.state.statusMessage}
            </p>
          </main>
          <SearchDialog
            addNewGrocerieItem={this.addData}
            handleListItemClicked={this.changeData}
            groceries={this.state.groceries}
            openDialog={this.state.dialogOpen}
            onCloseDialog={this.handleDialogClose}
            selectedMarket={selectedMarket}
            pendingIds={this.state.pendingIds}
          />
          <div className="AddActionBar">
            <Fab
              variant="extended"
              size="large"
              color="primary"
              aria-label="Artikel hinzufügen"
              onClick={this.handleDialogOpen}
              disabled={this.state.loading}
            >
              <AddCircleOutlineSharp />
              Hinzufügen
            </Fab>
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}
