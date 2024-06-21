import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  FormHelperText,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { ChangeEvent, FormEventHandler, useEffect, useState } from "react";
import _axios_instance from "../_axios_instance.tsx";
import { colors } from "../styles/colors.tsx";
import MultiFileUpload from "../components/MultiFileUpload.tsx";
import Carousel from "../components/Carousel.tsx";
import { useNavigate, useParams } from "react-router-dom";
import { AxiosError } from "axios";

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
  status: string;
}

interface NewListingObject {
  listing: ListingObject;
}

const EditListing = () => {
  const { id } = useParams();
  const [listingImages, setListingImages] = useState<string[]>([]);
  const [priceError, setPriceError] = useState<string>("");
  const [titleError, setTitleError] = useState<string>("");
  const [listingImageBinaries, setListingImageBinaries] = useState<string[]>(
    [],
  );
  const [listingValid, setListingValid] = useState<boolean>(false);
  const navigate = useNavigate();

  const [newListingObject, setNewListingObject] = useState<NewListingObject>({
    listing: {
      title: "",
      description: "",
      price: 0,
      location: {
        latitude: 48.463302,
        longitude: -123.3108,
      },
      images: [],
      status: "AVAILABLE",
    },
  });

  useEffect(() => {
    _axios_instance
      .get("/listing/" + id)
      .then((response) => {
        setNewListingObject((prevState) => ({
          ...prevState,
          listing: {
            ...prevState.listing,
            title: response.data.title || "",
            description: response.data.description || "",
            price: +response.data.price || 0,
            status: response.data.status || "AVAILABLE",
            images: response.data.images || [],
          },
        }));
        setListingValid(true);
      })
      .catch(() => {
        alert("Listing not updated successfully");
      });
  }, [id]);

  const updateNewListingPayload = (
    key: keyof ListingObject,
    value: string | number | LocationObject,
  ) => {
    setNewListingObject((prevState) => ({
      ...prevState,
      listing: {
        ...prevState.listing,
        [key]: value,
      },
    }));
  };

  const asyncListingImageWrapper = async (): Promise<boolean> => {
    try {
      const imagesObjectArray = await asyncUploadImages();
      if (imagesObjectArray) {
        setNewListingObject((prevState) => ({
          ...prevState,
          listing: {
            ...prevState.listing,
            images: imagesObjectArray,
          },
        }));
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (
    submissionEvent,
  ) => {
    submissionEvent.preventDefault();

    if (!priceError && !titleError) {
      const successImages: boolean = await asyncListingImageWrapper();

      if (successImages) {
        _axios_instance
          .patch("/listing/" + id, newListingObject)
          .then(() => {
            alert("Listing Updated!");
            navigate("/");
          })
          .catch(() => {
            alert("Listing Update Failed");
          });
      } else if (!successImages) {
        alert("Images failed to upload, please try again later");
      } else {
        alert(
          "Error occurred when updating the listing, you may need to enable location permissions for this site",
        );
      }
    }
  };

  const updateListingTitle = (event: ChangeEvent<HTMLInputElement>) => {
    const title = event.target.value;
    if (!title) {
      setTitleError("This field is required");
    } else {
      setTitleError("");
    }
    updateNewListingPayload("title", title);
  };

  const updateListingDescription = (
    event: ChangeEvent<HTMLTextAreaElement>,
  ) => {
    updateNewListingPayload("description", event.target.value);
  };

  const updateListingPrice = (event: ChangeEvent<HTMLInputElement>) => {
    const priceValue = event.target.value;
    const regex = /^\d+(\.\d{1,2})?$/;
    if (!regex.test(priceValue)) {
      setPriceError(
        "This price is not valid, please make sure the value is positive and in the form xx.xx",
      );
    } else {
      setPriceError("");
      updateNewListingPayload("price", priceValue ? Number(priceValue) : 0);
    }
  };

  const isImageValid = (url: string) => {
    try {
      return url.startsWith("data:image/");
    } catch (error) {
      return false;
    }
  };

  const asyncUploadImages = async (): Promise<ImageURLObject[] | false> => {
    const retrievedImages: ImageURLObject[] = [];
    const uploadPromises = listingImageBinaries.map(async (imageBinary) => {
      try {
        const response = await _axios_instance.post("/images", imageBinary, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        return { url: response.data.url };
      } catch (error) {
        return null;
      }
    });

    try {
      const results = await Promise.all(uploadPromises);
      results.forEach((result) => {
        if (result) {
          retrievedImages.push(result);
        }
      });
      return retrievedImages;
    } catch (error) {
      return false;
    }
  };

  const handleUpdateStatus = () => {
    setNewListingObject((prevState) => ({
      ...prevState,
      listing: {
        ...prevState.listing,
        status: prevState.listing.status === "AVAILABLE" ? "SOLD" : "AVAILABLE",
      },
    }));
  };

  const handleDelete = () => {
    _axios_instance
      .delete("/listing/" + id)
      .then(() => {
        alert("Listing Deleted Successfully");
        navigate("/user");
      })
      .catch((error: AxiosError) => {
        if (error.response) {
          switch (error.response.status) {
            case 401:
              alert("You are not authorized to change this listing");
              break;
            case 404:
              alert("This listing was not found");
              break;
            default:
              alert("Error occurred and listing not deleted");
          }
        } else {
          alert("Error occurred and listing not deleted");
        }
      });
  };

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
      {listingValid ? (
        <Card>
          <CardContent>
            <Typography variant="h2">Edit Listing</Typography>
            <Grid container spacing={1}>
              <Grid item md={6} sm={12} xs={12}>
                <Box>
                  <form autoComplete="off" onSubmit={handleSubmit}>
                    <FormControl sx={{ width: "100%", gap: "10px" }}>
                      <TextField
                        id="field-title"
                        label="Title"
                        sx={{ m: "10px" }}
                        rows={1}
                        onChange={updateListingTitle}
                        required
                        error={!!titleError}
                        value={newListingObject.listing.title}
                      />
                      {titleError && (
                        <FormHelperText error>{titleError}</FormHelperText>
                      )}
                      <TextField
                        id="field-description"
                        label="Description"
                        type="text"
                        sx={{ m: "10px", display: "flex" }}
                        rows={10}
                        multiline
                        onChange={updateListingDescription}
                        value={newListingObject.listing.description}
                      />
                      <TextField
                        id="field-price"
                        label="Price(CAD)"
                        type="number"
                        sx={{ m: "10px" }}
                        rows={1}
                        onChange={updateListingPrice}
                        error={!!priceError}
                        value={newListingObject.listing.price ?? ""}
                      />
                      {priceError && (
                        <FormHelperText error>{priceError}</FormHelperText>
                      )}
                    </FormControl>
                    <Box>
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
                          id="submit-button"
                        >
                          Update Listing
                        </Button>
                        <MultiFileUpload
                          passedImages={listingImages}
                          setPassedImages={setListingImages}
                          multipleUpload={true}
                          htmlForButton={buttonHTML}
                          imageBinary={listingImageBinaries}
                          setImageBinaries={setListingImageBinaries}
                        />
                      </Box>
                      <Box>
                        <Button
                          sx={{
                            display: "inline",
                            mt: 2,
                            backgroundColor: colors.martletplaceRed,
                            "&:hover": {
                              backgroundColor: colors.martletplaceRedHover,
                            },
                            textTransform: "none",
                            fontSize: "16px",
                            padding: "10px 20px",
                            margin: "10px",
                          }}
                          variant="contained"
                          id="delete-button"
                          onClick={handleDelete}
                        >
                          Delete Posting
                        </Button>
                        <Button
                          sx={{
                            display: "inline",
                            mt: 2,
                            backgroundColor: colors.martletplaceYellow,
                            "&:hover": {
                              backgroundColor: colors.martletplaceYellowHover,
                            },
                            textTransform: "none",
                            fontSize: "16px",
                            padding: "10px 20px",
                            margin: "10px",
                          }}
                          variant="contained"
                          id="status-button"
                          onClick={handleUpdateStatus}
                        >
                          {newListingObject.listing.status === "AVAILABLE"
                            ? "Mark Purchased"
                            : "Mark Not Purchased"}
                        </Button>
                      </Box>
                    </Box>
                  </form>
                </Box>
              </Grid>
              <Grid item lg={6} xs={12}>
                <Box>
                  <Typography variant="h5" sx={{ paddingLeft: "20px" }}>
                    Image Preview
                  </Typography>
                  <Box sx={{ padding: "10px" }}>
                    {!isImageValid(listingImages[0]) ? (
                      <Typography sx={{ paddingLeft: "10px" }} variant="body2">
                        No images uploaded yet, these images will overwrite the
                        current ones.
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
      ) : (
        <Typography>Listing Not Valid</Typography>
      )}
    </Container>
  );
};

export default EditListing;
