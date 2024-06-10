import { Component, ChangeEvent } from "react";
import ImageUpload from "./ImageUpload";
import { AxiosResponse, AxiosError } from "axios";
import {Box, Button, CircularProgress, Typography} from "@mui/material";
// Define the state interface
interface ImageInfo {
  id: number;
  url: string;
  // Add other properties as needed
}

// Define the state interface
interface MultiImageUploadState {
  currentFile?: File;
  preview?: string;
  progress: number;
  message: string;
  isError: boolean;
  imageInfos: ImageInfo[]; // Use the defined interface instead of any
}

// Define the props interface if needed (empty in this case)
interface MultiImageUploadProps {}

// Define the response structure
interface UploadResponse {
  message: string;
  // Add other fields as needed
}

export default class MultiImageUpload extends Component<MultiImageUploadProps, MultiImageUploadState> {
  constructor(props: MultiImageUploadProps) {
    super(props);
    this.state = {
      currentFile: undefined,
      preview: undefined,
      progress: 0,
      message: "",
      isError: false,
      imageInfos: []
    };
  }

  selectFileToUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      this.setState({
        currentFile: file,
        preview: URL.createObjectURL(file), // Creates a URL for image preview
        progress: 0,
        message: ""
      });
    }
  }

  upload = () => {
    this.setState({ progress: 0 });

    if (this.state.currentFile) {
      ImageUpload.upload(this.state.currentFile, (event) => {
        this.setState({
          progress: Math.round((100 * event.loaded) / 1000)
        });
      })
      .then((response: void | AxiosResponse<UploadResponse>) => {
        if (response && response.data) {
          this.setState({
            message: response.data.message
          });
        }
        return response;
      })
      .then((response: void | AxiosResponse<unknown>) => {
        if (response && response.data) {
          const imageInfos: ImageInfo[] = response.data as ImageInfo[];
          this.setState({
            imageInfos: imageInfos,
          });
        }
      })
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .catch((error: AxiosError) => {
        this.setState({
          progress: 0,
          message: "Image upload failed",
          currentFile: undefined,
          isError: true,
        });
        console.log(error);
      });
    }
  }

  componentDidMount() {
  ImageUpload.getFiles().then((response) => {
    if (response && response.data) {
      this.setState({
        imageInfos: response.data,
      });
    } else {
      // Handle the case where response or response.data is undefined
      console.error("Response or response.data is undefined.");
    }
  });
}

  render() {
    return (
      <Box>
          <label htmlFor="btn-upload">
            <input
              id="btn-upload"
              name="btn-upload"
              style={{display: 'none'}}
              type="file"
              accept="image/*"
              onChange={this.selectFileToUpload}/>
            <Button
              className="btn-choose"
              variant="outlined"
              component="span">
              Choose Image
            </Button>
          </label>
          <div className="file-name">
            {this.state.currentFile ? this.state.currentFile.name : null}
          </div>
          <Button
            className="btn-upload"
            color="primary"
            variant="contained"
            component="span"
            disabled={!this.state.currentFile}
            onClick={this.upload}>
            Upload
          </Button>

          {this.state.currentFile && (
            <Box className="my20" display="flex" alignItems="center">
              <Box width="100%" mr={1}>
                <CircularProgress  variant="determinate" value={this.state.progress}/>
              </Box>
              <Box minWidth={35}>
                <Typography variant="body2" color="textSecondary">{`${this.state.progress}%`}</Typography>
              </Box>
            </Box>)
          }

          {this.state.preview && (
            <div>
              <img style={{width: "100%", objectFit:"contain"}} src={this.state.preview} alt=""/>
            </div>
          )}

          {this.state.message && (
            <Typography variant="subtitle2" className={`upload-message ${this.state.isError ? "error" : ""}`}>
              {this.state.message}
            </Typography>
          )}

          <Typography variant="h6" className="list-header">
            List of Images
          </Typography>
          <ul className="list-group">
          </ul>
      </Box>
    );
  }
}
