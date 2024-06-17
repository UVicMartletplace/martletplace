import React, { SetStateAction, useState } from "react";
import { Box } from "@mui/material";

interface Props {
  passedImages: string[];
  setPassedImages: React.Dispatch<SetStateAction<string[]>>;
  multipleUpload?: boolean;
  htmlForButton: React.ReactNode;
  imageBinary: string[];
  setImageBinaries: React.Dispatch<SetStateAction<string[]>>;
}

// Note the single upload has not been properly tested
const MultiFileUpload = (props: Props) => {
  // I don't know why this can't be removed, but if it does, then the images don't show
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_images, setImages] = useState(<img alt={""} />);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_file, setFile] = useState<File | null>();

  // Gets the file strings from the uploaded FileList
  const getFileNames = (fileList: FileList | null) => {
    // Clears the passed images value, so that only the currently uploaded images are added
    props.setPassedImages([]);
    props.setImageBinaries([]);
    if (fileList) {
      // Iterates through the FileList and gets all the base64 strings from the uploads
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i] as File;
        const reader = new FileReader();
        reader.onload = () => {
          const imageDataURL = reader.result as string;
          props.setPassedImages((prevItems) => [
            ...(prevItems || []),
            imageDataURL,
          ]);
          const data = imageDataURL.split(",")[1];
          props.setImageBinaries((prevItems) => [
            ...(prevItems || []),
            atob(data),
          ]);

          setImages(
            <img src={imageDataURL} width="100%" alt={"Listing Image " + i} />,
          );
        };
        reader.readAsDataURL(file);
      }
    }
  };

  return (
    <Box>
      <input
        style={{ display: "none" }}
        id={"image-input"}
        name={"image-input"}
        type={"file"}
        accept={"image/*"}
        multiple={props.multipleUpload}
        onChange={(e) => {
          setFile(e.target.files?.[0]);
          getFileNames(e.target.files);
        }}
      />
      <label
        htmlFor={"image-input"}
        style={{ textAlign: "inherit", display: "inherit" }}
      >
        {props.htmlForButton}
      </label>
    </Box>
  );
};

export default MultiFileUpload;
