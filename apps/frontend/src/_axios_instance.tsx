import axios from "axios";

// Create an instance of axios with custom default configurations
const _axios_instance = axios.create({
  baseURL: "http://localhost/api/", // Your custom base URL
});

export default _axios_instance;
