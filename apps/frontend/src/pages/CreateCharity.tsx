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
  FormHelperText,
  Grid,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import SearchBar from "../components/searchBar";
import { colors } from "../styles/colors";
import _axios_instance from "../_axios_instance";
import { CharityObject, OrganizationObject } from "../types.ts";

interface ImageObject {
  image: File | undefined;
  imageString: string | undefined;
  index: number;
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
  const [startDate, setStartDate] = useState<string>("2024-07-01");
  const [endDate, setEndDate] = useState<string>("2024-07-31");
  const [dateError, setDateError] = useState<string>("");

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

  // Submits
  const handleSubmit: FormEventHandler<HTMLFormElement> = async (
    submissionEvent,
  ) => {
    submissionEvent.preventDefault();
    if (!dateError) return;
    const logoURL = await asyncListingImageWrapperLogo();
    if (!logoURL) {
      alert("Image failed to upload");
      return;
    }
    const newDataObject = await asyncListingImageWrapperPartners(logoURL);
    if (newDataObject) {
      try {
        const response = await _axios_instance.post(
          "/charities",
          newDataObject,
        );
        if (response) {
          alert("Charity Created!");
          window.location.reload();
        } else {
          alert("Charity Creation Failed");
        }
      } catch (error) {
        alert("Charity Creation Failed");
        console.error(error);
      }
    } else {
      alert("Images failed to upload, please try again later");
    }
  };

  // Uploads an array of files to the blobstore
  const asyncUploadImages = async (
    Images: ImageUploadObject[],
  ): Promise<ImageUploadedObject[] | false> => {
    const retrievedImages: ImageUploadedObject[] = [];
    const uploadPromises = Images.map(async (image) => {
      try {
        const imageFile = image.image;
        // Upload the image
        const response = await _axios_instance.post("/images", imageFile, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        return { url: response.data.url, index: image.index };
      } catch (error) {
        console.error("Error uploading image:", error);
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

      // Return the list of successfully uploaded images
      return retrievedImages;
    } catch (error) {
      console.error("Error in uploading image process:", error);
      return false;
    }
  };

  // Uploads the main charity image to the s3 blob store
  const asyncListingImageWrapperLogo = async (): Promise<boolean | string> => {
    try {
      if (!logoImage) return true;
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

  // Uploads the partner images to the s3 blobstore and packages the partner logos
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

  // Uploads the payload
  const updateNewCharityPayload = (key: keyof CharityObject, value: string) => {
    setNewCharityObject((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  // Updates the number of organizations or updates them if they already exist
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
        updatedOrganizations.push(newOrganization);
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
      const dateEnd = new Date(endDate);
      updateNewCharityPayload("startDate", dateStart.toISOString());
      setDateError(
        dateEnd > dateStart ? "" : "End Date must be after Start Date",
      );
    }
  };

  const updateEndDate = (event: ChangeEvent<HTMLInputElement>) => {
    const dateValue = event.target.value;
    setEndDate(dateValue);
    if (dateValue) {
      const dateEnd = new Date(dateValue);
      const dateStart = new Date(startDate);
      updateNewCharityPayload("endDate", dateEnd.toISOString());
      setDateError(
        dateEnd > dateStart ? "" : "End Date must be after Start Date",
      );
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

  // Finds the index given a key(org name)
  const indexFromKey = (key: string): number => {
    let i = 0;
    for (; i < newCharityObject.organizations.length; i++) {
      if (newCharityObject.organizations[i].name == key) {
        return i;
      }
    }
    return -1;
  };

  // Removes an organization, and re-indexes the images
  const removeOrganization = (index: number) => {
    setNewCharityObject((prevState) => {
      const updatedOrganizations = [...prevState.organizations];

      updatedOrganizations.splice(index, 1);
      let updatedPartnerImages;
      for (let i = 0; i < partnerImages.length; i++) {
        if (partnerImages[i].index == index) {
          updatedPartnerImages = partnerImages;
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

  // Adds a blank organization to be filled by user
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

  // Uploads the images to memory
  const handleImageUpload = async (
    index: number,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    if (event.target.files?.[0]) {
      const imageString = await imageBlobToBase64(event.target.files?.[0]);
      if (partnerImages.some((obj) => obj.index === index)) {
        for (let i = 0; i < partnerImages.length; i++) {
          if (partnerImages[i].index === index) {
            setPartnerImages((prevList) =>
              prevList.map((obj) =>
                obj.index === index
                  ? {
                      ...obj,
                      image: event.target.files?.[0],
                      imageString: imageString,
                    }
                  : obj,
              ),
            );
          }
        }
      } else {
        const newImage: ImageObject = {
          index: index,
          image: event.target.files?.[0],
          imageString: imageString,
        };
        setPartnerImages((prevState) => [...prevState, newImage]);
      }
    }
  };

  // Get the org image from the given index
  const getImageFromOrgIndex = (index: number) => {
    for (let i = 0; i < partnerImages.length; i++) {
      if (partnerImages[i].index == index) {
        return partnerImages[i].imageString;
      }
    }
    return undefined;
  };

  // Converts the image file blob to base64 for preview
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
            <Typography variant="h5">Create Charity</Typography>
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
                    required
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
                    alt="Charity Event Logo"
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
                    error={!!dateError}
                  />

                  <TextField
                    type="date"
                    label="Charity End Date"
                    id="charity-date-end"
                    onChange={updateEndDate}
                    value={endDate}
                    error={!!dateError}
                  />
                  {dateError && (
                    <FormHelperText error>{dateError}</FormHelperText>
                  )}
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
                        <Box key={index} sx={{ marginBottom: "10px" }}>
                          <Grid container>
                            <Grid item lg={6} sm={12}>
                              <Box sx={{ margin: "10px" }}>
                                <TextField
                                  type="text"
                                  label="Organization Title"
                                  id={`org-title-${index}`}
                                  onChange={(
                                    e: ChangeEvent<HTMLInputElement>,
                                  ) =>
                                    updateOrganizationName(e, organization.name)
                                  }
                                  value={organization.name}
                                  sx={{ margin: "10px" }}
                                />
                                {!organization.receiving ? (
                                  <TextField
                                    type="number"
                                    label="Donated Number"
                                    id={`org-donation-${index}`}
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
                                ) : (
                                  <Typography sx={{ display: "inline" }}>
                                    Receiving Charities cant donate
                                  </Typography>
                                )}
                              </Box>
                              <Box sx={{ marginLeft: "20px" }}>
                                <Button
                                  variant="contained"
                                  component="label"
                                  id={`upload-button-${index}`}
                                >
                                  Upload Picture
                                  <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    id={`upload-input-${index}`}
                                    onChange={(event) => {
                                      handleImageUpload(index, event).then();
                                    }}
                                  />
                                </Button>
                                <FormControlLabel
                                  label="Charity Receiving?"
                                  id={`org-received-${index}`}
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
                                  sx={{ color: "red" }}
                                  variant="outlined"
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
