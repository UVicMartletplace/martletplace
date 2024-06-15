import {Box, Button, Card, CardContent, Container, FormControl, Grid, TextField, Typography,} from "@mui/material";
import {ChangeEvent, FormEventHandler, useState} from "react";
import _axios_instance from "../_axios_instance.tsx";
import {colors} from "../styles/colors.tsx";
import MultiFileUpload from "../extra_components/MultiFileUpload.tsx";
import Carousel from "../extra_components/Carousel.tsx";

interface ImageURLObject {
  url: string;
}
interface LocationObject {
  latitude: number;
  longitude: number;
}

interface ListingObject {
  title: string;
  description: string;
  price: number;
  location: LocationObject;
  images: ImageURLObject[];
}

interface NewListingObject {
  listing: ListingObject;
}

const CreateListing = () => {
  const [listingImages, setListingImages] = useState<string[]>([]);

  // This newListingObject bundles all the listing data for upload to the server
  const [newListingObject, setNewListingObject] = useState<NewListingObject>({
    listing: {
      title: "",
      description: "",
      price: 0,
      location: {
        latitude: 48.463302,
        longitude: -123.310800,
      },
      images: [],
    },
  });


  // Updates and sends the newListingObject, to the server via post under /api/listing
  const handleSubmit: FormEventHandler<HTMLFormElement> = async (submissionEvent) => {
    submissionEvent.preventDefault();
    // In order to make sure that the images are retrieved before submitting
    const successImages: boolean = await asyncListingImageWrapper();
    const successLocation: boolean = await asyncListingLocationWrapper();

    if (successImages && successLocation) {
      _axios_instance
        .post("/listing", newListingObject)
        .then(() => {
          alert("Listing Created!");
        })
        .catch(() => {
          alert("Listing Creation Failed");
        });
    } else if (!successImages) {
      alert("Images failed to upload, please try again later");
    } else {
      // Currently this is added to catch if the location is not set, we could default this to the location of the university instead
      alert(
        "Error occurred when creating a listing, you may need to enable location permissions for this site",
      );
    }
  };

  const updateNewListingPayload = (key: keyof ListingObject, value: string | number | LocationObject) => {
    if (["title", "description", "price", "location", "images"].includes(key)) {
      setNewListingObject(prevState => ({
        ...prevState,
        listing: {
          ...prevState.listing,
          [key]: value
        }
      }));
      return newListingObject.listing[key] === value;
    }
  };

  const asyncListingImageWrapper = async (): Promise<boolean> => {
  try {
    const imagesObjectArray = await asyncUploadImages();
    if (imagesObjectArray) {
      const tempListingObject = newListingObject;
      tempListingObject.listing.images = imagesObjectArray
      setNewListingObject(prevState => ({...prevState, tempListingObject}));
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error('Error uploading images:', error);
    return false;
  }};


  const updateListingTitle = (event: ChangeEvent<HTMLInputElement>) => {
    // Handle
    updateNewListingPayload("title", event.target.value);
  }

  const updateListingDescription = (event: ChangeEvent<HTMLTextAreaElement>) => {
    // Handle
    updateNewListingPayload("description", event.target.value)
  }

  const updateListingPrice = (event: ChangeEvent<HTMLInputElement>) => {
    // Handle
    const priceValue:number = +event.target.value;
    updateNewListingPayload("price", priceValue >= 0 ? priceValue : priceValue * -1);
  }

  // Gets the user location, and adds it to the listing object
  const updateListingLocation = () => {
    try {
      const currentLocation: LocationObject = {latitude: 0, longitude: 0}
      navigator.geolocation.getCurrentPosition((position) => {
        const currentLatitude = position.coords.latitude;
        const currentLongitude = position.coords.longitude;
        if (currentLatitude !== 0 && currentLongitude !== 0) {
          currentLocation.latitude = currentLatitude;
          currentLocation.longitude = currentLongitude;
        }
      });
      updateNewListingPayload("location", currentLocation)
      return true;
    } catch (error) {
      return false;
    }
  };

   const asyncListingLocationWrapper = async (): Promise<boolean> => {
    try {
      return updateListingLocation();
    } catch (error) {
      return false;
    }
  }

  // This function makes sure that the passed in url is a base64 data string
  const isImageValid = (url: string) => {
    try {
      return url.startsWith("data:image/");
    } catch (error) {
      return false
    }
  };


  // Uploads the images to the s3 server, this is handled separately
  // This may need to be modified to use File objects instead of the file strings
  const asyncUploadImages = async () => {
    const retrievedImages: ImageURLObject[] = [];
    try {
      await Promise.all(
        listingImages.map(async (image) => {
          try {
            const response = await _axios_instance.post(
              "/images",
              { image: image },
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              },
            );
            retrievedImages.push({ url: response.data.url });
          } catch (error) {
            console.error("Error uploading images:", error);
            return false;
          }
        }),
      );
      return retrievedImages;
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
                <form noValidate autoComplete="off" onSubmit={handleSubmit}>
                  <FormControl sx={{ width: "100%", padding: "10px" }}>
                    <TextField
                      id="field-title"
                      label="Title"
                      sx={{ m: "10px" }}
                      multiline
                      rows={1}
                      onChange={updateListingTitle}
                    />
                    <TextField
                      id="field-description"
                      label="Description"
                      type="text"
                      sx={{ m: "10px", display: "flex" }}
                      rows={10}
                      multiline
                      onChange={updateListingDescription}
                    />
                    <TextField
                      id="field-price"
                      label="Price(CAD)"
                      type="number"
                      sx={{ m: "10px" }}
                      multiline
                      rows={1}
                      InputProps={{ inputProps: { min: 0 } }}
                      onChange={updateListingPrice}
                    />
                  </FormControl>
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
                      id={"submit-button"}
                    >
                      Create Listing
                    </Button>
                    <MultiFileUpload
                      passedImages={listingImages}
                      setPassedImages={setListingImages}
                      multipleUpload={true}
                      htmlForButton={buttonHTML}
                    />
                  </Box>
                </form>
              </Box>
            </Grid>
            <Grid item lg={6} xs={12}>
              <Box>
                <Typography variant={"h5"} sx={{ paddingLeft: "20px" }}>
                  Image Preview
                </Typography>
                <Box sx={{ padding: "10px" }}>
                  {!isImageValid(listingImages[0]) ? (
                    <Typography sx={{ paddingLeft: "10px" }} variant={"body2"}>
                      No images uploaded yet
                    </Typography>
                  ) : (
                    <Carousel imageURLs={listingImages} />
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
