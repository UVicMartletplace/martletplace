import {useState} from "react";
import axios from "axios";
import {Box, Button, Typography} from "@mui/material";

interface Image {
  url: string;
}

interface Location {
  latitude: number;
  longitude: number;
}

interface Listing {
  title: string;
  description: string;
  price: number;
  location: Location;
  images: Image[];
}

interface NewListingObject {
  listing: Listing;
}

const MultiFileUpload = (listingObject: NewListingObject, setListingObject: void) => {
  const [_images, setImages] = useState(<img/>);
  const [localImageUrls, setLocalImageUrls] = useState<string[]>();
  const [file, setFile] = useState<File | null>()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [caption, _setCaption] = useState("")

  const uploadImages = async (event: { preventDefault: () => void; }) => {
    event.preventDefault()

    const formData = new FormData();
    formData.append("image", file || "")
    formData.append("caption", caption)
    await axios.post("/api/posts", formData, { headers: {'Content-Type': 'multipart/form-data'}}).then(response => console.log(response))
  }

  const getFileNames = (fileList: FileList | null) => {
    let temp_file_list: string[] = []
    if (fileList) {
      for (let i = 0; i < fileList.length; i++) {
          const file = fileList[i] as File; // Cast to File
          const reader = new FileReader();
          reader.onload = () => {
              const imageDataURL = reader.result as string;
              console.log(file.name);
              setListingObject(prevState => ({
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
              setImages(<img src={imageDataURL} width="100%" />);
              temp_file_list.push(imageDataURL)
          };
          reader.readAsDataURL(file);
      }
      setLocalImageUrls(temp_file_list)
      }
  };


  return (
    <Box>
      <input
        multiple
        style={{ display: "none" }}
        id={"image-input"}
        name={"image-input"}
        type={"file"}
        accept={"image/*"}
        onChange={e => {setFile(e.target.files?.[0]); getFileNames(e.target.files)}}
      />
      <label htmlFor={"image-input"}>
        <span>
          <Button className="btn-choose" variant="outlined" component="span">
            Choose Image
          </Button>
        </span>
      </label>
      {localImageUrls ? localImageUrls.map((src, index) => (
                <img key={index} src={src} alt={`Image ${index + 1}`} width="100%" />
      )) : <Typography variant={"h4"}>None</Typography>}
      <Button variant="outlined" onClick={uploadImages}>
        Upload Images
      </Button>
    </Box>
  );
};

export default MultiFileUpload;
