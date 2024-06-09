import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import CreateAccount from "./pages/CreateAccount";
import Homepage from "./pages/Homepage";
import CreateListing from "./pages/CreateListing";
import EditListing from "./pages/EditListing";
import Account from "./pages/Account";
import ViewListing from "./pages/ViewListing";
import Messages from "./pages/Messages";
import axios from "axios";

function App() {
  axios.create();
  return (
    <Router>
      <Routes>
        {/* If not logged in redirect to login page */}
        <Route path="/" element={<Homepage />} />

        {/* If full URL is `/user/:id` then it would show another users profile,
        otherwise current users profile is shown. */}
        <Route path="/user" element={<Account />} />
        <Route path="/user/login" element={<Login />} />
        <Route path="/user/resetpassword" element={<ForgotPassword />} />
        <Route path="/user/signup" element={<CreateAccount />} />

        <Route path="/listing/new" element={<CreateListing />} />
        {/* TODO: change full url to `/listing/edit/:id` */}
        <Route path="/listing/edit/:id" element={<EditListing />} />
        {/* TODO: change full url to `/listing/view/:id` */}
        <Route path="/listing/view/:id" element={<ViewListing />} />
        {/* TODO: Give path a listing ID?*/}
        <Route path="/messages" element={<Messages />} />
      </Routes>
    </Router>
  );
}

export default App;
