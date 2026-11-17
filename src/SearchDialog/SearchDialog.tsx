import React, { useEffect } from "react";
import {
  createStyles,
  makeStyles,
  Theme
} from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import ListItemText from "@material-ui/core/ListItemText";
import ListItem from "@material-ui/core/ListItem";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import { GroceryType } from "../groceryType";
import { InputBase, Snackbar, useMediaQuery } from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import { isMarketId, marketLabel, markets, MarketFilter, MarketId } from "../markets";

type SearchDialogProps = {
  openDialog: boolean;
  onCloseDialog: () => void;
  groceries: GroceryType[];
  selectedMarket: MarketFilter;
  pendingIds: string[];
  handleListItemClicked: (itemId: string, itemBuyed: boolean, marketOverride?: MarketId | null) => Promise<void>;
  addNewGrocerieItem: (newGrocerieItemName: string, market: MarketId | null) => Promise<void>;
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      backgroundColor: theme.palette.background.default
    },
    appBar: {
      position: "relative",
      backgroundColor: theme.palette.background.default,
      color: theme.palette.text.primary,
      boxShadow: "none",
      borderBottom: "1px solid #d5dcd5"
    },
    toolbar: {
      width: "100%",
      maxWidth: 720,
      margin: "0 auto"
    },
    title: {
      marginLeft: theme.spacing(2),
      flex: 1,
      minWidth: 0,
      overflowWrap: "anywhere",
      fontSize: 20,
      lineHeight: 1.4
    },
    content: {
      width: "100%",
      maxWidth: 720,
      margin: "0 auto",
      padding: theme.spacing(3, 2, 4)
    },
    help: {
      color: theme.palette.text.secondary,
      fontSize: 14,
      lineHeight: 1.5
    },
    marketField: {
      display: "flex",
      flexDirection: "column",
      gap: theme.spacing(1),
      marginTop: theme.spacing(3),
      "& select": {
        width: "100%",
        minHeight: 48,
        padding: theme.spacing(1, 2),
        border: "1px solid #89958b",
        borderRadius: theme.shape.borderRadius,
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        font: "inherit"
      }
    },
    error: {
      color: "#82251f",
      padding: theme.spacing(2),
      border: "1px solid #a32d25",
      borderRadius: theme.shape.borderRadius,
      overflowWrap: "anywhere"
    },
    search: {
      position: "relative",
      borderRadius: theme.shape.borderRadius,
      backgroundColor: theme.palette.background.paper,
      border: "1px solid #89958b",
      width: "100%"
    },
    searchIcon: {
      width: theme.spacing(7),
      height: "100%",
      position: "absolute",
      pointerEvents: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    },
    inputRoot: {
      color: "inherit",
      width: "100%",
      borderRadius: theme.shape.borderRadius
    },
    inputFocused: {
      outline: `2px solid ${theme.palette.primary.main}`,
      outlineOffset: 2
    },
    inputInput: {
      padding: theme.spacing(2, 2, 2, 7),
      fontSize: 16,
      minWidth: 0,
      width: "100%"
    },
    listWrapper: {
      padding: 0,
      backgroundColor: theme.palette.background.paper,
      border: "1px solid #d5dcd5",
      borderRadius: theme.shape.borderRadius,
      "& .MuiListItem-root": { minHeight: 64 },
      "& .MuiListItemText-root": { overflowWrap: "anywhere" }
    }
  })
);

const SearchDialog = (props: SearchDialogProps) => {
  const classes = useStyles();
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [searchInput, setSearchInput] = React.useState("");
  const [destination, setDestination] = React.useState<MarketId | null>(null);
  const [overridden, setOverridden] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState("");
  const [snackbar, setSnackbar] = React.useState("");
  const busy = React.useRef(false);
  const mounted = React.useRef(true);

  useEffect(() => {
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    if (props.openDialog && !busy.current && !error) {
      setDestination(isMarketId(props.selectedMarket) ? props.selectedMarket : null);
      setOverridden(false);
    }
  }, [props.openDialog, props.selectedMarket, error]);

  function handleDialogClose() {
    props.onCloseDialog();
  }

  function handleSnackbarClose() {
    setSnackbar("");
  }

  const save = async (action: () => Promise<void>, label: string) => {
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    setError("");
    setSnackbar("");
    try {
      await action();
    } catch (writeError) {
      if (mounted.current) {
        setError("Speichern fehlgeschlagen. Bitte erneut hinzufügen.");
      }
      return;
    } finally {
      busy.current = false;
      if (mounted.current) setPending(false);
    }
    if (mounted.current) {
      setSearchInput("");
      setSnackbar(label === "Ohne Markt"
        ? "Zur Liste ohne Markt hinzugefügt" : `Zu ${label} hinzugefügt`);
    }
  };

  const query = searchInput.trim();
  const groceriesToDisplay = props.groceries.filter(item =>
    item.name.toLocaleLowerCase().includes(query.toLocaleLowerCase())
  );

  return (
    <div>
      <Dialog
        fullScreen
        open={props.openDialog}
        onClose={handleDialogClose}
        transitionDuration={reducedMotion ? 0 : 180}
        PaperProps={{
          className: `${classes.paper} ShoppingDialog`,
          "aria-labelledby": "add-dialog-title",
          "aria-modal": true
        }}
      >
        <AppBar className={classes.appBar}>
          <Toolbar className={classes.toolbar}>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleDialogClose}
              aria-label="Schließen"
            >
              <CloseIcon />
            </IconButton>
            <h2 className={classes.title} id="add-dialog-title">Artikel hinzufügen</h2>
          </Toolbar>
        </AppBar>
        <div className={classes.content}>
          <p className={classes.help}>Suche nach einem Artikel oder füge einen neuen hinzu.</p>
          <div className={classes.search}>
            <div className={classes.searchIcon}>
              <SearchIcon />
            </div>
            <InputBase
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearchInput(event.currentTarget.value)}
              disabled={pending}
              placeholder="Artikel suchen …"
              value={searchInput}
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput,
                focused: classes.inputFocused
              }}
              inputProps={{ "aria-label": "Artikel suchen" }}
            />
          </div>
          <div className={classes.marketField}>
            <label htmlFor="add-market">Markt für neue Artikel</label>
            <select
              id="add-market"
              value={destination ?? ""}
              disabled={pending}
              aria-describedby="market-destination-help"
              onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                const value = event.currentTarget.value;
                if (value !== "" && !isMarketId(value)) {
                  setError("Bitte einen gültigen Markt auswählen.");
                  return;
                }
                setDestination(isMarketId(value) ? value : null);
                setOverridden(true);
              }}
            >
              <option value="">Ohne Markt</option>
              {markets.map(market => (
                <option key={market.id} value={market.id}>{market.label}</option>
              ))}
            </select>
          </div>
          <p className={classes.help} id="market-destination-help">
            Erneut hinzugefügte Artikel behalten ihren gespeicherten Markt,
            bis du die Auswahl änderst. Das Ziel steht beim Artikel.
          </p>
          {error && <p className={classes.error} role="alert">{error}</p>}
          {pending && <p role="status">Wird gespeichert …</p>}
          <h3 className={classes.help}>Artikel</h3>
          <List className={classes.listWrapper}>
            {query && (
              <ListItem
                data-action="create"
                button
                disabled={pending}
                onClick={() => {
                  void save(() => props.addNewGrocerieItem(query, destination), marketLabel(destination));
                }}
              >
                <ListItemText
                  primary={`${query} neu anlegen`}
                  secondary={`Hinzufügen · ${marketLabel(destination)}`}
                />
              </ListItem>
            )}
            {groceriesToDisplay.map(item => {
              const target = item.buyed && overridden ? destination : item.marketId;
              return (
                <React.Fragment key={item.id}>
                  <ListItem
                    data-grocery-id={item.id}
                    button
                    disabled={!item.buyed || pending || props.pendingIds.includes(item.id)}
                    onClick={() => {
                      if (!item.buyed) return;
                      void save(
                        () => props.handleListItemClicked(item.id, item.buyed, overridden ? destination : undefined),
                        marketLabel(target)
                      );
                    }}
                  >
                    <ListItemText
                      primary={item.name}
                      secondary={`${item.buyed ? "Erneut hinzufügen" : "Bereits auf der Liste"} · ${marketLabel(target)}`}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              );
            })}
            {!query && groceriesToDisplay.length === 0 && (
              <ListItem>
                <ListItemText primary="Noch keine Artikel" secondary="Gib oben einen Namen ein." />
              </ListItem>
            )}
          </List>
        </div>
      </Dialog>
      <Snackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left"
        }}
        open={snackbar !== ""}
        autoHideDuration={2000}
        onClose={handleSnackbarClose}
        ContentProps={{
          role: "status",
          "aria-live": "polite",
          "aria-atomic": true,
          "aria-describedby": "message-id"
        }}
        message={<span id="message-id">{snackbar}</span>}
        action={[
          <IconButton
            key="close"
            aria-label="Meldung schließen"
            color="inherit"
            onClick={handleSnackbarClose}
          >
            <CloseIcon />
          </IconButton>
        ]}
      />
    </div>
  );
};

export default SearchDialog;
