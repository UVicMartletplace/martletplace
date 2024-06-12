import {
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import _axios_instance from "../_axios_instance.tsx";
import {colors} from "../styles/colors.tsx";
import MultiFileUpload from "../extra_components/MultiFileUpload.tsx";


const CreateListing = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [newListingObject, setNewListingObject] = useState({
    listing: {
      title: "",
      description: "",
      price: 0,
      location: {
        latitude: 0.0,
        longitude: 0.0,
      },
      images: [
        {
          url: "",
        },
      ],
    },
  });

  const getUserLocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      setNewListingObject(prevState => ({
        ...prevState,
        listing: {
          ...prevState.listing,
          location: {
            ...prevState.listing.location,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
        }
      }))
    });
  }

  const sendPostToCreateListing = () => {
    getUserLocation()
    console.log("SENDING", newListingObject);
    _axios_instance
      .post("/listing", newListingObject)
      .then((response) => {
        alert("Listing Created!");
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
        alert("Listing Creation Failed");
      });
  };

  return (
    <Container>
      <Card>
        <CardContent>
          <Typography variant={"h2"}>Create Listing</Typography>
          <Grid container spacing={1}>
            <Grid item md={6} sm={12} xs={12}>
              <form noValidate autoComplete="off">
                <FormControl sx={{ width: "100%", padding: "10px" }}>
                  <TextField
                    id="field-title"
                    label="Title"
                    sx={{ m: "10px" }}
                    onChange={(event) => setNewListingObject(prevState => ({
                      ...prevState,
                      listing: {
                        ...prevState.listing,
                        title: event.target.value
                      }
                    }))}
                  />
                  <TextField
                    id="field-description"
                    label="Description"
                    type={"text"}
                    sx={{ m: "10px", display: "flex" }}
                    rows={10}
                    multiline
                    onChange={(event) => setNewListingObject(prevState => ({
                      ...prevState,
                      listing: {
                        ...prevState.listing,
                        description: event.target.value
                      }
                    }))}
                  />
                  <TextField
                    id="field-price"
                    label="Price"
                    type="number"
                    sx={{ m: "10px" }}
                    onChange={(event) => setNewListingObject(prevState => ({
                      ...prevState,
                      listing: {
                        ...prevState.listing,
                        price: parseFloat(event.target.value)
                      }
                    }))}
                  />
                </FormControl>
              </form>
            </Grid>
            <Grid item md={6} sm={12} xs={12}>
              <MultiFileUpload listingObject={newListingObject} setListingObject={setNewListingObject}/>
            </Grid>
          </Grid>
          <Button
            type="submit"
            variant="contained"
            sx={{
              mt: 2,
              backgroundColor: colors.martletplaceNavyBlue,
              "&:hover": { backgroundColor: colors.martletplaceBlueHover },
              textTransform: "none",
              fontSize: "16px",
              padding: "10px 0",
              width: "60%",
            }}
            style={{ margin: "10px", width: "200px"}}
            onClick={sendPostToCreateListing}
            id={"submit_button"}
          >
            Create Listing
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
};

export default CreateListing;
