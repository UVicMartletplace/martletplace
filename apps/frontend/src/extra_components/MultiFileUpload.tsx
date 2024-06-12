import React, { ReactElement, SetStateAction, useState } from "react";
import { Box } from "@mui/material";

interface Props {
  passedImages: string[];
  setPassedImages: React.Dispatch<SetStateAction<string[]>>;
  multipleUpload?: boolean;
  htmlForButton: ReactElement<any, any>;
}

const MultiFileUpload = (props: Props) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_images, setImages] = useState(<img />);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_file, setFile] = useState<File | null>();

  const getFileNames = (fileList: FileList | null) => {
    props.setPassedImages([]);
    if (fileList) {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i] as File;
        //console.log("Our files", file);
        const reader = new FileReader();
        reader.onload = () => {
          const imageDataURL = reader.result as string;
          //console.log(imageDataURL);
          props.setPassedImages((prevItems) => [
            ...(prevItems || []),
            imageDataURL,
          ]);
          setImages(<img src={imageDataURL} width="100%" />);
        };
        reader.readAsDataURL(file);
      }
    }
    console.log("Passed images", props.passedImages);
  };

  return (
    <Box>
      {props.multipleUpload ? (
        <input
          style={{ display: "none" }}
          id={"image-input"}
          name={"image-input"}
          type={"file"}
          accept={"image/*"}
          multiple
          onChange={(e) => {
            setFile(e.target.files?.[0]);
            getFileNames(e.target.files);
          }}
        />
      ) : (
        <input
          style={{ display: "none" }}
          id={"image-input"}
          name={"image-input"}
          type={"file"}
          accept={"image/*"}
          onChange={(e) => {
            setFile(e.target.files?.[0]);
            getFileNames(e.target.files);
          }}
        />
      )}
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
