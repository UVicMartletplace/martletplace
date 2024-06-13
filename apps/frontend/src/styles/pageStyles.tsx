import { colors } from "./colors";

export const useStyles = () => ({
  // Login and Create Account page styles
  loginAndCreateBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100vw",
    height: "30%",
  },
  form: {
    width: "300px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  button: {
    mt: 2,
    backgroundColor: colors.martletplaceNavyBlue,
    "&:hover": { backgroundColor: colors.martletplaceBlueHover },
    textTransform: "none",
    fontSize: "16px",
    padding: "10px 0",
    width: "60%",
  },
  link: {
    mt: 2,
    color: colors.martletplaceBlack,
    "&:hover": { color: colors.martletplaceBlueHover },
  },
  horizontalRule: {
    color: colors.martletplaceGrey
  },
  // Account page styles
  drawer: {
    width: "350px",
    flexShrink: 0,
    "& .MuiDrawer-paper": {
      width: "350px",
      boxSizing: "border-box",
    },
  },
  listItemButton: {
    height: "80px",
    "&:hover": {
      backgroundColor: colors.martletplaceGreyClicked,
    },
  },
  listItemText: {
    backgroundColor: colors.martletplaceGreyClicked,
  },
  accountBox: {
    flexGrow: 1,
    bgcolor: "background.default",
    p: 3,
    marginLeft: "350px",
  },
});
