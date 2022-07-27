import React, { Component } from "react";
import { GroceryType } from "../groceryType";
import "./GroceryList.css";
import ShoppingCartOutlined from "@material-ui/icons/ShoppingCartOutlined";
import DoneOutlined from "@material-ui/icons/DoneOutlined";
import {
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
  Slide,
  Zoom,
  TextField,
  Chip, 
  FormControl,
  MenuItem,
  Select,
  InputLabel
} from "@material-ui/core";
import SettingsIcon from "@material-ui/icons/Settings";

type GroceryProps = {
  groceries: GroceryType[];
  changeData: any;
  changeGrocerieName: (groceryId: string, groceryName: string) => void;
  changeGrocerieArea: (groceryId: string, groceryArea: string) => void;
};

export default class GroceryList extends Component<GroceryProps> {
  state = {
    showSuccessMessage: false,
    editMode: false,
    area: '',
  };

  handleGroceryBuyedButtonClicked = (
    groceryId: string,
    GroceryBuyed: boolean
  ) => {
    if (this.props.groceries.length === 1) {
      //display success message
      this.setState({
        showSuccessMessage: true
      });
      setTimeout(() => {
        this.setState({
          showSuccessMessage: false
        });
      }, 2000);
    }
    this.props.changeData(groceryId, GroceryBuyed);
  };

  handleGrocerieNameInputChanged = (groceryId: string) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    console.log(event, event.currentTarget.value, groceryId);
    this.props.changeGrocerieName(groceryId, event.currentTarget.value);
  };

  toggleEditMode = () => {
    this.setState({ editMode: !this.state.editMode });
  };

  
  handleChange = (areaChanged: string, groceryId: string) =>
    {
      this.setState({area: areaChanged})
      console.log(areaChanged, groceryId, this.state.area);
      this.props.changeGrocerieArea(groceryId, areaChanged);
  };

  render() {
    const groceryList =
      this.props.groceries.length > 0 ? (
        <div>
          <div className="EditButtonWrapper">
            <Button
              onClick={this.toggleEditMode}
              variant="outlined"
              size="small"
            >
              <SettingsIcon />
              Edit
            </Button>
          </div>
          {this.props.groceries.map(grocery => {
            return (
              <div className="GroceryItem" key={grocery.id}>
                <Card className="Card">
                  <CardContent>
                    <Typography variant="h5" component="h2">
                      {this.state.editMode ? (
                        <div>
                          <TextField
                          id="outlined-helperText"
                          label="Helper text"
                          onChange={this.handleGrocerieNameInputChanged(grocery.id)}
                          value={grocery.name}
                          margin="normal"
                          variant="outlined"
                        />
                        <br></br>
                        <FormControl>
                          <InputLabel id="demo-simple-select-label">Bereich</InputLabel>
                          <Select
                            id="demo-simple-select"
                            value={grocery.area}
                            onChange={(event) => this.handleChange(event.target.value as string, grocery.id)}
                          >
                            <MenuItem value={"Obst & Gemüse"}>Obst & Gemüse</MenuItem>
                            <MenuItem value={"Kühlung"}>Kühlung</MenuItem>
                            <MenuItem value={"Brot"}>Brot</MenuItem>
                          </Select>
                        </FormControl>
                        </div>
                      ) : (
                        grocery.name
                      )}
                    </Typography>
                    {!this.state.editMode && grocery.area && (
                        <Chip  style={{backgroundColor: 'red'}} label={grocery.area} color="primary" />
                    )}
                  </CardContent>
                  <CardActions disableSpacing>
                    {this.state.editMode ? (
                      <Button onClick={this.toggleEditMode} size="small">
                        speichern
                      </Button>
                    ) : (
                      <Button
                        onClick={() =>
                          this.handleGroceryBuyedButtonClicked(
                            grocery.id,
                            grocery.buyed
                          )
                        }
                        size="small"
                      >
                        gekauft
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </div>
            );
          })}
        </div>
      ) : (
        <Zoom
          in={!this.state.showSuccessMessage}
          style={{
            transitionDelay: !this.state.showSuccessMessage ? "200ms" : "0ms"
          }}
        >
          <div className="IconWrapper">
            <ShoppingCartOutlined color="disabled" className="CustomIcon" />
            <Button disabled>Nichts einzukaufen</Button>
          </div>
        </Zoom>
      );

    return (
      <div className="GroceryList">
        <Slide
          direction="up"
          in={this.state.showSuccessMessage}
          mountOnEnter
          unmountOnExit
        >
          <div className="IconWrapper">
            <DoneOutlined color="disabled" className="CustomIcon" />
            <Button disabled>Alles eingekauft</Button>
          </div>
        </Slide>
        {!this.state.showSuccessMessage && groceryList}
      </div>
    );
  }
}
