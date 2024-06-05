import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import CreateAccount from "./pages/CreateAccount";
import Homepage from "./pages/Homepage";
import CreateListing from "./pages/CreateListing";
import EditListing from "./pages/EditListing";
import Account from "./pages/Account";
import ViewListing from "./pages/ViewListing";
import Messages from "./pages/Messages";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/homepage" element={<Homepage />} />
        <Route path="/create-listing" element={<CreateListing />} />
        <Route path="/edit-listing" element={<EditListing />} />
        <Route path="/account" element={<Account />} />
        <Route path="/view-listing" element={<ViewListing />} />
        <Route path="/messages" element={<Messages />} />
      </Routes>
    </Router>
  );
}

export default App;
