import { ListItemButton, ListItemText, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useStyles } from "../styles/pageStyles";

interface AccountSidebarItemsProps {
  path: string;
  itemName: string;
  selectedItem: string;
  setSelectedItem: (itemName: string) => void;
}

const AccountSidebarItems = ({
  path,
  itemName,
  selectedItem,
  setSelectedItem,
}: AccountSidebarItemsProps) => {
  const styles = useStyles();
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(path);
    setSelectedItem(itemName);
  };

  return (
    <ListItemButton
      onClick={handleClick}
      sx={{
        ...styles.listItemButton,
        backgroundColor:
          selectedItem === itemName
            ? styles.listItemText.backgroundColor
            : "transparent",
      }}
    >
      <ListItemText
        primary={<Typography variant="h5">{itemName}</Typography>}
      />
    </ListItemButton>
  );
};

export default AccountSidebarItems;
