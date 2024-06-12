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
import { colors } from "../styles/colors.tsx";
import MultiFileUpload from "../extra_components/MultiFileUpload.tsx";
import Carousel from "../extra_components/Carousel.tsx";

interface URLObject {
  url: string;
}
interface LocationObject {
  latitude: number,
  longitude: number,
}

interface ListingObject {
  title: string;
  description: string;
  price: number;
  location: LocationObject;
  images: URLObject[];
}

interface NewListingObject {
  listing: ListingObject;
}

const CreateListing = () => {
  const [images, setImages] = useState<string[]>([]);

  // This newListingObject bundles all the listing data for upload to the server
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [newListingObject, setNewListingObject] = useState<NewListingObject>({
    listing: {
      title: "",
      description: "",
      price: 0,
      location: {
        latitude: 0.0,
        longitude: 0.0,
      },
      images: [],
    },
  });

  // Gets the user location, and adds it to the listing object
  const getUserLocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      setNewListingObject((prevState) => ({
        ...prevState,
        listing: {
          ...prevState.listing,
          location: {
            ...prevState.listing.location,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        },
      }));
    });
  };

  // Updates and sends the newListingObject, to the server via post under /api/listing
  const sendPostToCreateListing = async () => {
    // In order to make sure that
    const success = await uploadImages();
    getUserLocation();
    console.log("SENDING", newListingObject);
    //console.log("Image Successful", imageUploadSuccessful)
    if (success && newListingObject.listing.location.latitude !== 0) {
      console.log("Sent Listing Object", newListingObject)
      _axios_instance
      .post("/listing", newListingObject)
      .then((response) => {
        alert("Listing Created!");
        console.log("Response to upload", response);
      })
      .catch((error) => {
        console.log("Response to error", error);
        alert("Listing Creation Failed");
      });
    } if (!success) {
      alert("Images failed to upload, please try again later")
    }else {
      // Currently this is added to catch if the location is not set, we could default this to the location of the university instead
      alert("Error occured when creating a listing, you may need to enable location permissions for this site")
    }
  };

  // This function makes sure that the passed in url is a base64 data string
  const isImageValid = (url: string) => {
    try {
      return url.startsWith("data");
    } catch (error) {
      if (error === TypeError && url === undefined){
        return true;
      }
      return false;
    }
  };

  // Uploads the images to the s3 server, this is handled seperately
  // This may need to be modified to use File objects instead of the file strings
  const uploadImages = async () => {
    const returnedImageURL: URLObject[] = [];
    try {
      await Promise.all(
        images.map(async (image) => {
          try {
            const response = await _axios_instance.post(
              "/images",
              { image: image },
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              }
            );
            console.log("Request return", response.data.url);
            returnedImageURL.push({ url: response.data.url });
            newListingObject.listing.images.push({url: response.data.url});
          } catch (error) {
            console.error("Error uploading image:", error);
          }
        })
      );
      return true;
    } catch (error) {
      console.error("Error uploading images:", error);
      return false;
    }
  };

  // Upload button html
  const buttonHTML = (
    <span style={{ textAlign: "center" }}>
      <Button
        className="btn-choose"
        variant="outlined"
        component="span"
        sx={{
          mt: 2,
          textTransform: "none",
          fontSize: "16px",
          padding: "10px 20px",
          margin: "10px",
        }}
      >
        Choose Images
      </Button>
    </span>
  );

  return (
    <Container>
      <Card>
        <CardContent>
          <Typography variant={"h2"}>Create Listing</Typography>
          <Grid container spacing={1}>
            <Grid item md={6} sm={12} xs={12}>
              <Box>
                <form noValidate autoComplete="off">
                  <FormControl sx={{ width: "100%", padding: "10px" }}>
                    <TextField
                      id="field-title"
                      label="Title"
                      sx={{ m: "10px" }}
                      onChange={(event) =>
                        setNewListingObject((prevState) => ({
                          ...prevState,
                          listing: {
                            ...prevState.listing,
                            title: event.target.value,
                          },
                        }))
                      }
                    />
                    <TextField
                      id="field-description"
                      label="Description"
                      type={"text"}
                      sx={{ m: "10px", display: "flex" }}
                      rows={10}
                      multiline
                      onChange={(event) =>
                        setNewListingObject((prevState) => ({
                          ...prevState,
                          listing: {
                            ...prevState.listing,
                            description: event.target.value,
                          },
                        }))
                      }
                    />
                    <TextField
                      id="field-price"
                      label="Price"
                      type="number"
                      sx={{ m: "10px" }}
                      onChange={(event) =>
                        setNewListingObject((prevState) => ({
                          ...prevState,
                          listing: {
                            ...prevState.listing,
                            price: parseFloat(event.target.value),
                          },
                        }))
                      }
                    />
                  </FormControl>
                </form>
              </Box>
              <Grid container sx={{ padding: "10px" }}>
                <Grid item sm={12}>
                  <Box sx={{ display: "flex" }}>
                    <Button
                      type="submit"
                      variant="contained"
                      sx={{
                        display: "inline",
                        mt: 2,
                        backgroundColor: colors.martletplaceNavyBlue,
                        "&:hover": {
                          backgroundColor: colors.martletplaceBlueHover,
                        },
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
                    <MultiFileUpload
                      passedImages={images}
                      setPassedImages={setImages}
                      multipleUpload={true}
                      htmlForButton={buttonHTML}
                    />
                  </Box>
                </Grid>
                <Grid item sm={4}></Grid>
              </Grid>
            </Grid>
            <Grid item lg={6} xs={12}>
              <Box>
                <Typography variant={"h5"} sx={{ paddingLeft: "20px" }}>
                  Image Preview
                </Typography>
                <Box sx={{ padding: "10px" }}>
                  {!isImageValid(images[0]) ? (
                    <Typography sx={{ paddingLeft: "10px" }} variant={"body2"}>
                      No images uploaded yet
                    </Typography>
                  ) : (
                    <Carousel imageURLs={images} />
                  )}
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
