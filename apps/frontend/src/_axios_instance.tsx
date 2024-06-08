import axios from "axios";

// Create an instance of axios with custom default configurations
const _axios_instance = axios.create({
  baseURL: "https://whateverthiswillbe.com/api/", // Your custom base URL
  timeout: 10000, // Optional: Set a timeout for requests in milliseconds
});

export default _axios_instance;
