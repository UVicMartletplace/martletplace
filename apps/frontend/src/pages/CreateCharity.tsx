import { ChangeEvent, FormEventHandler, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import SearchBar from "../components/searchBar";
import { colors } from "../styles/colors";
import _axios_instance from "../_axios_instance";

interface ImageURLObject {
  url: string;
}

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

const CreateCharity = () => {
  const [sent, setSent] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [partnerImages, setPartnerImages] = useState<ImageObject[]>([]);
  const [logoImage, setLogoImage] = useState<File | null>(null);
  const [logoImageString, setLogoImageString] = useState<string>();
  const [logoUrlResult, setLogoUrlResult] = useState<string>();
  const [imageUploadSuccess, setImageUploadSuccess] = useState<boolean[]>([
    false,
    false,
  ]);

  const [newCharityObject, setNewCharityObject] = useState<CharityObject>({
    name: "string",
    description: "string",
    startDate: "2024-07-13T06:58:17.461Z",
    endDate: "2024-07-13T06:58:17.461Z",
    imageUrl: "string",
    organizations: [],
  });

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (
    submissionEvent,
  ) => {
    submissionEvent.preventDefault();
    console.log(
      "Partner Images",
      partnerImages,
      "\nNew Charity Object",
      newCharityObject,
    );
    asyncListingImageWrapper().then();
    asyncListingImageWrapperPartners().then();

    if (true) {
      if (imageUploadSuccess[0] && imageUploadSuccess[1]) {
        if (logoUrlResult) updateNewCharityPayload("imageUrl", logoUrlResult);
        console.log(logoUrlResult);
        console.log("Sending", newCharityObject);
        _axios_instance
          .post("/charities", newCharityObject)
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
    }
  };

  const asyncUploadImages = async (
    Images: File[],
  ): Promise<ImageURLObject[] | false> => {
    const retrievedImages: ImageURLObject[] = [];
    // Create an array of promises for image uploads
    const uploadPromises = Images.map(async (image) => {
      try {
        // Attempt to upload the image
        const response = await _axios_instance.post("/images", image, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        // Return the URL of the uploaded image on success
        return { url: response.data.url };
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

  const asyncListingImageWrapper = async (): Promise<boolean> => {
    try {
      // Upload logoImage
      if (!logoImage) return true;
      console.log(logoImage);
      const logoImagesObjectArray = await asyncUploadImages([logoImage]);

      if (logoImagesObjectArray) {
        const newURL = logoImagesObjectArray[0].url;
        setNewCharityObject((prevState) => ({
          ...prevState,
          imageUrl: newURL,
        }));
        setImageUploadSuccess((prevState) => {
          prevState[0] = true;
          return [...prevState];
        });
        return true;
      } else {
        console.error("No images uploaded for logoImage.");
        return false;
      }
    } catch (error) {
      console.error("Error uploading logo image:", error);
      return false;
    }
  };

  const asyncListingImageWrapperPartners = async (): Promise<boolean> => {
    try {
      if (partnerImages.length === 0) return true;

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
        .map((obj) => obj.image as File);

      const partnerImagesObjectArray =
        await asyncUploadImages(partnerImagesArray);
      if (partnerImagesObjectArray && partnerImagesObjectArray.length > 0) {
        const newOrganizations = [...newCharityObject.organizations];
        for (let i = 0; i < newCharityObject.organizations.length; i++) {
          newOrganizations[i].logoUrl = partnerImagesObjectArray[i].url;
        }
        setNewCharityObject((prevState) => ({
          ...prevState,
          organizations: newOrganizations,
        }));
        setImageUploadSuccess((prevState) => {
          prevState[1] = true;
          return [...prevState];
        });
        return true;
      } else {
        console.error("No images uploaded for partnerImages.");
        return false;
      }
    } catch (error) {
      console.error("Error uploading partner images:", error);
      return false;
    }
  };

  const updateNewCharityPayload = async (
    key: keyof CharityObject,
    value: string,
  ) => {
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
    return "";
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
        <Card sx={{ marginTop: "32px" }}>
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
                    onChange={updateCharityName}
                    value={newCharityObject.name}
                  />
                  <TextField
                    type="text"
                    multiline
                    label="Charity Description"
                    onChange={updateDescription}
                    value={newCharityObject.description}
                  />
                  <img src={logoImageString} alt={"isseu"} />
                  <Button
                    variant="contained"
                    component="label"
                    id="upload-logo-button"
                  >
                    Upload Picture
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={updateCharityImage}
                    />
                  </Button>
                  <TextField
                    type="date"
                    label="Charity Start Date"
                    onChange={updateStartDate}
                    value={startDate}
                  />

                  {dateError && (
                    <FormHelperText error>{dateError}</FormHelperText>
                  )}
                  <Paper sx={{ width: "100%", padding: "10px" }}>
                    {newCharityObject.organizations.map(
                      (organization, index) => (
                        <Box key={index} sx={{ margin: "10px" }}>
                          <Typography>{index}</Typography>
                          <TextField
                            type="text"
                            label="Organization Title"
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              updateOrganizationName(e, organization.name)
                            }
                            value={organization.name}
                            sx={{ margin: "10px" }}
                          />
                          <TextField
                            type="number"
                            label="Donated Number"
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              updateOrganizationDonated(e, organization.name)
                            }
                            value={organization.donated.toString()}
                            sx={{ margin: "10px" }}
                          />
                          <FormControlLabel
                            label="Charity Receiving?"
                            sx={{ margin: "10px" }}
                            control={
                              <Checkbox
                                checked={organization.receiving}
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                  updateOrganizationReceiving(
                                    e,
                                    organization.name,
                                  )
                                }
                              />
                            }
                          />
                          <Avatar
                            src={getImageFromOrgIndex(index)}
                            alt="Profile Picture"
                            sx={{ width: 150, height: 150, mt: 2, mb: 2 }}
                            id={"partner-image-" + index}
                          />
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
                              onChange={(event) => {
                                handleImageUpload(index, event).then();
                              }}
                            />
                          </Button>
                          <Button
                            onClick={() => {
                              removeOrganization(index);
                            }}
                          >
                            Remove
                          </Button>
                        </Box>
                      ),
                    )}
                    <Button
                      onClick={() => {
                        addOrganization();
                      }}
                    >
                      Add Organization
                    </Button>
                  </Paper>
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
