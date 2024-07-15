import { ChangeEvent, FormEventHandler, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  Grid,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import SearchBar from "../components/searchBar";
import { colors } from "../styles/colors";
import _axios_instance from "../_axios_instance";

interface OrganizationObject {
  name: string;
  logoUrl: string;
  donated: number;
  receiving: boolean;
}

interface CharityObject {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  imageUrl: string;
  organizations: OrganizationObject[];
}

interface ImageObject {
  image: File | undefined;
  index: number;
  imageString: string | undefined;
}

interface ImageUploadObject {
  image: File;
  index: number;
}

interface ImageUploadedObject {
  url: string;
  index: number;
}

const CreateCharity = () => {
  const [sent, setSent] = useState(false);
  const [startDate, setStartDate] = useState<string>("2024-07-15");
  const [partnerImages, setPartnerImages] = useState<ImageObject[]>([]);
  const [logoImage, setLogoImage] = useState<File | null>(null);
  const [logoImageString, setLogoImageString] = useState<string>();

  const [newCharityObject, setNewCharityObject] = useState<CharityObject>({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    imageUrl: "",
    organizations: [],
  });

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (
    submissionEvent,
  ) => {
    submissionEvent.preventDefault();
    if (sent) return;
    const logoURL = await asyncListingImageWrapperLogo();
    if (!logoURL) {
      alert("Image failed to upload");
      return;
    }
    console.log("LOGO URL", logoURL);
    const newDataObject = await asyncListingImageWrapperPartners(logoURL);
    if (newDataObject) {
      console.log("Sending", newDataObject);
      _axios_instance
        .post("/charities", newDataObject)
        .then(() => {
          alert("Charity Created!");
          setSent(true);
        })
        .catch(() => {
          alert("Charity Creation Failed");
          setSent(false);
        });
    } else {
      alert("Images failed to upload, please try again later");
      setSent(false);
    }
  };

  const asyncUploadImages = async (
    Images: ImageUploadObject[],
  ): Promise<ImageUploadedObject[] | false> => {
    const retrievedImages: ImageUploadedObject[] = [];
    // Create an array of promises for image uploads
    const uploadPromises = Images.map(async (image) => {
      try {
        const imageFile = image.image;
        // Attempt to upload the image
        const response = await _axios_instance.post("/images", imageFile, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        // Return the URL of the uploaded image on success
        return { url: response.data.url, index: image.index };
      } catch (error) {
        // Log error and return null on failure
        console.error("Error uploading image:", error);
        return null; // Indicate failure with null
      }
    });

    try {
      // Wait for all upload promises to resolve
      const results = await Promise.all(uploadPromises);

      // Filter successful uploads and add to retrievedImages
      results.forEach((result) => {
        if (result) {
          retrievedImages.push(result);
        }
      });

      // Return the list of successfully uploaded images
      return retrievedImages;
    } catch (error) {
      // Handle any errors that occurred during the uploading process
      console.error("Error in uploading image process:", error);
      return false;
    }
  };

  const asyncListingImageWrapperLogo = async (): Promise<boolean | string> => {
    try {
      // Upload logoImage
      if (!logoImage) return true;
      console.log(logoImage);
      const logoImagesObjectArray = await asyncUploadImages([
        { image: logoImage, index: 0 },
      ]);

      if (logoImagesObjectArray) {
        const newURL = logoImagesObjectArray[0].url;
        setNewCharityObject((prevState) => ({
          ...prevState,
          imageUrl: newURL,
        }));

        return newURL;
      } else {
        console.error("No images uploaded for logoImage.");
        return false;
      }
    } catch (error) {
      console.error("Error uploading logo image:", error);
      return false;
    }
  };

  const asyncListingImageWrapperPartners = async (
    logoUrlResult: string | boolean,
  ): Promise<boolean | CharityObject> => {
    try {
      if (partnerImages.length === 0) {
        return { ...newCharityObject, imageUrl: logoUrlResult as string };
      }

      // Check if newCharityObject.organizations is an array
      if (!Array.isArray(newCharityObject.organizations)) {
        console.error(
          "newCharityObject.organizations is not an array:",
          newCharityObject.organizations,
        );
        return false;
      }

      // Upload partnerImages
      const partnerImagesArray = partnerImages
        .filter((obj) => obj.image !== undefined)
        .map((obj, index) => ({ image: obj.image as File, index }));

      const partnerImagesObjectArray =
        await asyncUploadImages(partnerImagesArray);
      if (partnerImagesObjectArray && partnerImagesObjectArray.length > 0) {
        const newOrganizations = [...newCharityObject.organizations];
        for (let i = 0; i < newCharityObject.organizations.length; i++) {
          newOrganizations[partnerImagesObjectArray[i].index].logoUrl =
            partnerImagesObjectArray[i].url;
        }
        setNewCharityObject((prevState) => ({
          ...prevState,
          organizations: newOrganizations,
        }));
        return {
          ...newCharityObject,
          organizations: newOrganizations,
          imageUrl: logoUrlResult as string,
        };
      } else {
        console.error("No images uploaded for partnerImages.");
        return false;
      }
    } catch (error) {
      console.error("Error uploading partner images:", error);
      return false;
    }
  };

  const updateNewCharityPayload = (key: keyof CharityObject, value: string) => {
    setNewCharityObject((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  const updateOrganizationPayload = (
    index: number,
    key: keyof OrganizationObject,
    value: string | number | boolean,
  ) => {
    setNewCharityObject((prevState) => {
      const updatedOrganizations = [...prevState.organizations];
      try {
        updatedOrganizations[index] = {
          ...updatedOrganizations[index],
          [key]: value,
        };
      } catch (error) {
        const newOrganization: OrganizationObject = {
          name: "",
          logoUrl: "",
          donated: 0,
          receiving: false,
        };
        console.log(updatedOrganizations);
        updatedOrganizations.push(newOrganization);
        console.log("Added", updatedOrganizations);
      }

      return {
        ...prevState,
        organizations: updatedOrganizations,
      };
    });
  };

  const updateCharityName = (event: ChangeEvent<HTMLInputElement>) => {
    updateNewCharityPayload("name", event.target.value);
  };

  const updateDescription = (event: ChangeEvent<HTMLInputElement>) => {
    updateNewCharityPayload("description", event.target.value);
  };

  const updateStartDate = (event: ChangeEvent<HTMLInputElement>) => {
    const dateValue = event.target.value;
    setStartDate(dateValue);
    if (dateValue) {
      const dateStart = new Date(dateValue);
      const dateEnd = new Date(dateStart);
      dateEnd.setDate(dateStart.getDate() + 31);
      updateNewCharityPayload("startDate", dateStart.toISOString());
      updateNewCharityPayload("endDate", dateEnd.toISOString());
    }
  };

  const updateCharityImage = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setLogoImage(event.target.files[0]);
      const imageString = await imageBlobToBase64(event.target.files[0]);
      setLogoImageString(imageString);
    }
  };

  const updateOrganizationName = (
    event: ChangeEvent<HTMLInputElement>,
    key: string,
  ) => {
    const index = indexFromKey(key);
    if (index !== -1) {
      updateOrganizationPayload(index, "name", event.target.value);
    }
  };

  const updateOrganizationDonated = (
    event: ChangeEvent<HTMLInputElement>,
    key: string,
  ) => {
    const index = indexFromKey(key);
    if (index !== -1) {
      updateOrganizationPayload(
        index,
        "donated",
        parseInt(event.target.value, 10),
      );
    }
  };

  const updateOrganizationReceiving = (
    event: ChangeEvent<HTMLInputElement>,
    key: string,
  ) => {
    const index = indexFromKey(key);
    if (index !== -1) {
      updateOrganizationPayload(index, "receiving", event.target.checked);
    }
  };

  const indexFromKey = (key: string): number => {
    let i = 0;
    for (; i < newCharityObject.organizations.length; i++) {
      if (newCharityObject.organizations[i].name == key) {
        return i;
      }
    }
    return -1; // Replace with actual logic to find index
  };

  const removeOrganization = (index: number) => {
    setNewCharityObject((prevState) => {
      const updatedOrganizations = [...prevState.organizations];

      updatedOrganizations.splice(index, 1);

      for (let i = 0; i < partnerImages.length; i++) {
        console.log("index", i, partnerImages);
        if (partnerImages[i].index == index) {
          const updatedPartnerImages = partnerImages;
          updatedPartnerImages.splice(i, 1);
          for (i = 0; i < updatedPartnerImages.length; i++) {
            updatedPartnerImages[i].index = i;
            console.log("Reassigning the indexes");
          }
          setPartnerImages(updatedPartnerImages);
        }
      }
      return {
        ...prevState,
        organizations: updatedOrganizations,
      };
    });
  };

  const addOrganization = () => {
    setNewCharityObject((prevState) => {
      const updatedOrganizations = [...prevState.organizations];
      const newOrganization: OrganizationObject = {
        name: "",
        logoUrl: "",
        donated: 0,
        receiving: false,
      };
      updatedOrganizations.push(newOrganization);

      return {
        ...prevState,
        organizations: updatedOrganizations,
      };
    });
  };

  const handleImageUpload = async (
    index: number,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    if (event.target.files?.[0]) {
      const imageString = await imageBlobToBase64(event.target.files?.[0]);
      const newImage: ImageObject = {
        index: index,
        image: event.target.files?.[0],
        imageString: imageString,
      };
      setPartnerImages((prevState) => [...prevState, newImage]);
    }
  };

  const getImageFromOrgIndex = (index: number) => {
    for (let i = 0; i < partnerImages.length; i++) {
      if (partnerImages[i].index == index) {
        return partnerImages[i].imageString;
      }
    }
    return undefined;
  };

  const imageBlobToBase64 = (
    image: File | null,
  ): Promise<string | undefined> => {
    return new Promise((resolve, reject) => {
      if (image) {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result as string);
        };
        reader.onerror = (error) => {
          reject(error);
        };
        reader.readAsDataURL(image);
      } else {
        resolve(undefined);
      }
    });
  };

  return (
    <>
      <SearchBar />
      <Container>
        <Card sx={{ marginTop: "32px", padding: "10px" }}>
          <CardContent>
            <Typography variant={"h5"}>Create Charity</Typography>
            <Box>
              <form noValidate autoComplete="off" onSubmit={handleSubmit}>
                <FormControl
                  sx={{ width: "100%", padding: "10px", gap: "10px" }}
                >
                  <TextField
                    type="text"
                    label="Charity Title"
                    id="charity-title"
                    onChange={updateCharityName}
                    value={newCharityObject.name}
                  />
                  <TextField
                    type="text"
                    multiline
                    label="Charity Description"
                    id="charity-description"
                    onChange={updateDescription}
                    value={newCharityObject.description}
                  />
                  <img
                    src={logoImageString}
                    style={{
                      display: logoImageString ? "block" : "none",
                      maxHeight: "300px",
                      width: "auto",
                      aspectRatio: "auto",
                      objectFit: "contain",
                    }}
                    alt={"Charity Event Logo"}
                  />
                  <Button
                    variant="contained"
                    component="label"
                    id="upload-logo-button"
                  >
                    Upload Picture
                    <input
                      id="upload-logo-input"
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={updateCharityImage}
                    />
                  </Button>
                  <TextField
                    type="date"
                    label="Charity Start Date"
                    id="charity-date"
                    onChange={updateStartDate}
                    value={startDate}
                  />

                  <Paper
                    sx={{
                      width: "100%",
                      padding: "10px",
                      margin: "10px",
                      display:
                        newCharityObject.organizations.length > 0
                          ? "block"
                          : "none",
                    }}
                  >
                    {newCharityObject.organizations.map(
                      (organization, index) => (
                        <Box key={index}>
                          <Grid container>
                            <Grid item lg={6} sm={12}>
                              <Box sx={{ margin: "10px" }}>
                                <TextField
                                  type="text"
                                  label="Organization Title"
                                  id={"org-title-" + index}
                                  onChange={(
                                    e: ChangeEvent<HTMLInputElement>,
                                  ) =>
                                    updateOrganizationName(e, organization.name)
                                  }
                                  value={organization.name}
                                  sx={{ margin: "10px" }}
                                />
                                <TextField
                                  type="number"
                                  label="Donated Number"
                                  id={"org-donation-" + index}
                                  onChange={(
                                    e: ChangeEvent<HTMLInputElement>,
                                  ) =>
                                    updateOrganizationDonated(
                                      e,
                                      organization.name,
                                    )
                                  }
                                  value={organization.donated.toString()}
                                  sx={{ margin: "10px" }}
                                />
                              </Box>
                              <Box sx={{ marginLeft: "20px" }}>
                                <Button
                                  variant="contained"
                                  component="label"
                                  id={"upload-button-" + index}
                                >
                                  Upload Picture
                                  <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    id={"upload-input-" + index}
                                    onChange={(event) => {
                                      handleImageUpload(index, event).then();
                                    }}
                                  />
                                </Button>
                                <FormControlLabel
                                  label="Charity Receiving?"
                                  id={"org-received-" + index}
                                  sx={{ margin: "10px" }}
                                  control={
                                    <Checkbox
                                      checked={organization.receiving}
                                      onChange={(
                                        e: ChangeEvent<HTMLInputElement>,
                                      ) =>
                                        updateOrganizationReceiving(
                                          e,
                                          organization.name,
                                        )
                                      }
                                    />
                                  }
                                />

                                <Button
                                  onClick={() => {
                                    removeOrganization(index);
                                  }}
                                >
                                  Remove
                                </Button>
                              </Box>
                            </Grid>
                            <Grid item lg={6} sm={12}>
                              <Box
                                sx={{
                                  width: "100%",
                                  height: "auto",
                                  display: "flex",
                                  justifyContent: "left",
                                  alignItems: "center",
                                }}
                              >
                                <img
                                  style={{
                                    objectFit: "contain",
                                    maxWidth: "100%",
                                    maxHeight: "300px",
                                    display: getImageFromOrgIndex(index)
                                      ? "block"
                                      : "none",
                                  }}
                                  src={getImageFromOrgIndex(index) ?? ""}
                                  alt="Partner Logo"
                                />
                              </Box>
                            </Grid>
                          </Grid>
                        </Box>
                      ),
                    )}
                  </Paper>
                  <Button
                    sx={{ flex: "12" }}
                    id="add-organization"
                    onClick={() => {
                      addOrganization();
                    }}
                  >
                    Add Organization
                  </Button>
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
                    Create Charity Event
                  </Button>
                  <Button
                    variant="contained"
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
                    onClick={() => {
                      alert(
                        "The Following Object Will be Submitted(Files are uploaded at the end)\n" +
                          JSON.stringify(newCharityObject, null, 2),
                      );
                      console.log("STATUS\n", newCharityObject);
                    }}
                  >
                    STATUS
                  </Button>
                </Box>
              </form>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </>
  );
};

export default CreateCharity;
