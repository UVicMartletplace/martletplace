import {
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useStyles } from "../styles/pageStyles";
import AccountSidebarItem from "./AccountSidebarItem";
import useUser from "../hooks/useUser";

const AccountSidebar = ({ selectedItem }: { selectedItem: string }) => {
  const styles = useStyles();
  const navigate = useNavigate();
  const { user, logout } = useUser();

  const handleLogout = () => {
    logout();
    navigate("/user/login");
  };
  const { id } = useParams();

  return (
    <Box sx={{ display: "flex" }}>
      <Drawer variant="permanent" sx={styles.drawer}>
        <Divider />
        <List>
          <ListItem onClick={() => navigate(`/user/${id}`)}>
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              {user ? user.name : "Account"}
            </Typography>
          </ListItem>
          <Divider />
          <AccountSidebarItem
            path={`/user/${id}`}
            itemName="My Profile"
            selected={selectedItem === "My Profile"}
          />
          <Divider />
          <AccountSidebarItem
            path="/user/listings"
            itemName="My Listings"
            selected={selectedItem === "My Listings"}
          />
          <Divider />
          <AccountSidebarItem
            path="/user/reviews"
            itemName="My Reviews"
            selected={selectedItem === "My Reviews"}
          />
          <Divider />
          {/* Logout Button */}
          <ListItem onClick={handleLogout} sx={styles.listItemButton}>
            <Typography variant="h5" color="red">
              Logout
            </Typography>
          </ListItem>
        </List>
      </Drawer>
    </Box>
  );
};

export default AccountSidebar;
