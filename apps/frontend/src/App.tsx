import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import CreateAccount from "./pages/CreateAccount";
import Homepage from "./pages/Homepage";
import CreateListing from "./pages/CreateListing";
import EditListing from "./pages/EditListing";
import ViewListing from "./pages/ViewListing";
import Messages from "./pages/Messages";
import MyReviews from "./pages/MyReviews";
import MyListings from "./pages/MyListings";
import MyProfile from "./pages/MyProfile";
import SearchBar from "./components/searchBar.tsx";

function App() {
  return (
    <Router>
      <SearchBar />
      <Routes>
        {/* If full URL is `/user/:id` then it would show another users profile,
        otherwise current users profile is shown. */}
        <Route path="/user" element={<MyProfile />} />
        <Route path="/user/reviews" element={<MyReviews />} />
        <Route path="/user/listings" element={<MyListings />} />

        <Route path="/user/login" element={<Login />} />
        <Route path="/user/resetpassword" element={<ForgotPassword />} />
        <Route path="/user/signup" element={<CreateAccount />} />

        <Route path="/listing/new" element={<CreateListing />} />
        <Route path="/listing/edit/:id" element={<EditListing />} />
        <Route path="/listing/view/:id" element={<ViewListing />} />
        {/* TODO: Give path a listing ID?*/}
        <Route path="/messages" element={<Messages />} />
        {/* If not logged in redirect to login page */}
        <Route path="/:query" element={<Homepage />} />
        <Route path="/" element={<Homepage />} />
      </Routes>
    </Router>
  );
}

export default App;
