import axios, {AxiosInstance, AxiosResponse, AxiosProgressEvent} from "axios";

interface UploadResponse {
  // TODO check out the returns from AWS
  success: boolean;
  message: string;
  data: object;
}

export default new class ImageUpload {
  imageUploadPath: string;
  imageUploadAPI: AxiosInstance;
  constructor() {
    this.imageUploadPath = ""
    this.imageUploadAPI = axios.create({
      baseURL: "BaseURLForAmazon",
    });

  }
  upload(file: string | Blob, onUploadProgress: (progressEvent: AxiosProgressEvent) => void): Promise<void | AxiosResponse<UploadResponse>> {
    const formData = new FormData();
    formData.append("file", file);

    return this.imageUploadAPI.post(this.imageUploadPath, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress,
    }).catch((error) => {
      alert("Failed to upload " + error);
      return Promise.reject(error);
    });
  }

  getFiles(){
    return this.imageUploadAPI.get("/endpointToGetFiles").catch((error) => console.log("Error getting files from AWS" + error));
  }
}