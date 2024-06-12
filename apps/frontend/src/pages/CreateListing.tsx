import {
  Box,
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
import Carousel from "../extra_components/Carousel.tsx";


const CreateListing = () => {

  const [images, setImages] = useState<string[]>([]);

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

  const sendPostToCreateListing = async () => {
    console.log("Our Images", images)
    uploadImages()
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

  const uploadImages = () => {
    setNewListingObject(prevState => ({
        ...prevState,
        listing: {
          ...prevState.listing,
          images: [{url: ""}]
        }
    }));
    const returnedImageURL = [{url: ""}];
    for (let i= 0; i < images.length; i++) {
      _axios_instance.post("/images", {image: images[i]},{headers: {
        'Content-Type': 'multipart/form-data'
      }}).then(response => {
        returnedImageURL.push({url: response.data.url})
      }).catch((error) => console.log(error));
    }
    if (returnedImageURL.length === images.length) {
      setNewListingObject(prevState => ({
          ...prevState,
          listing: {
            ...prevState.listing,
            images: returnedImageURL
          }
      }))
    } else {
      alert("Error uploading images, try again later")
    }

  }

  const buttonHTML = (<span style={{textAlign: "center"}}>
          <Button className="btn-choose" variant="outlined" component="span" sx={{
              mt: 2,
              textTransform: "none",
              fontSize: "16px",
              padding: "10px 20px",
              margin: "10px"}}>
            Choose Images
          </Button>
        </span>)

  const isImageValid = (url: string) => {
    try {
      return url.startsWith("data")
    } catch (error) {
      console.log(error);
      return false
    }

  };

return (
  <Container>
    <Card>
      <CardContent>
        <Typography variant={"h2"}>Create Listing</Typography>
        <Grid container spacing={1}>
            <Grid item md={6} sm={12} xs={12}>
              <Box>
              <form noValidate autoComplete="off" >
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
              </form></Box>
              <Grid container sx={{padding: "10px"}}>
            <Grid item sm={12}>
              <Box sx={{display: "flex"}}>
              <Button
            type="submit"
            variant="contained"
            sx={{
              display: "inline",
              mt: 2,
              backgroundColor: colors.martletplaceNavyBlue,
              "&:hover": { backgroundColor: colors.martletplaceBlueHover },
              textTransform: "none",
              fontSize: "16px",
              padding: "10px 20px",
              margin: "10px",
            }}
            onClick={sendPostToCreateListing}
            id={"submit-button"}
          >
            Create Listing
          </Button>
              <MultiFileUpload passedImages={images} setPassedImages={setImages} multipleUpload={true} htmlForButton={buttonHTML}/></Box>
            </Grid>
                <Grid item sm={4}>

            </Grid>
          </Grid>
            </Grid>
            <Grid item lg={6} xs={12} >
              <Box>
                <Typography variant={"h5"} sx={{paddingLeft:"20px"}}>Image Preview</Typography>
              <Box sx={{padding: "10px"}}>
                {!isImageValid(images[0]) ?
                  <Typography sx={{paddingLeft:"10px"}} variant={"body2"}>No images uploaded yet</Typography> :
                  <Carousel imageURLs={images}/> }
              </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default CreateListing;
