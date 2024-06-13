import { ListItemButton, ListItemText, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useStyles } from "../styles/pageStyles";

interface AccountSidebarItemProps {
  path: string;
  itemName: string;
  selected: boolean;
}

const AccountSidebarItem = ({
  path,
  itemName,
  selected,
}: AccountSidebarItemProps) => {
  const styles = useStyles();
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(path);
  };

  return (
    <ListItemButton
      onClick={handleClick}
      sx={{
        ...styles.listItemButton,
        backgroundColor: selected
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

export default AccountSidebarItem;
