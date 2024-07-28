import { colors } from "./colors";

export const vars = Object.freeze({
  messagesSendBoxHeight: "4rem",
});

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
  HomePageBox: {
    flexDirection: "column",
    alignItems: "top",
    justifyContent: "top",
    margin: "0px",
    padding: "0px 10px",
  },
  form: {
    width: "300px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  button: {
    mt: 1,
    backgroundColor: colors.martletplaceNavyBlue,
    "&:hover": { backgroundColor: colors.martletplaceBlueHover },
    textTransform: "none",
    fontSize: "16px",
    padding: "10px 0",
    width: "100%",
  },
  buttonOutline: {
    mt: 1,
    outline: "1px solid #001647",
    backgroundColor: "white",
    color: colors.martletplaceNavyBlue,
    "&:hover": { backgroundColor: "#808080" },
    textTransform: "none",
    fontSize: "16px",
    padding: "10px 0",
    width: "100%",
  },
  yellowButton: {
    backgroundColor: colors.martletplaceYellow,
    "&:hover": { backgroundColor: "orange" },
  },
  whiteButton: {
    backgroundColor: "white",
    outline: "1px solid #808080",
    "&:hover": {
      backgroundColor: colors.martletplaceGrey,
      outline: "1px solid grey",
    },
  },
  homepageButton: {
    color: colors.martletplaceBlack,
    fontSize: "1.2em",
    backgroundColor: "transparent",
    boxShadow: "none",
    textTransform: "none",
    outline: "none",
    "&:hover": {
      boxShadow: "none",
      textTransform: "none",
      outline: "none",
      backgroundColor: "transparent",
    },
    "&:focus": {
      backgroundColor: "transparent",
      boxShadow: "none",
      outline: "none",
      transform: "none",
    },
    "&:active": {
      backgroundColor: "transparent",
      boxShadow: "none",
      outline: "none",
      transform: "none",
    },
    padding: "0",
  },
  link: {
    mt: 2,
    color: colors.martletplaceBlack,
    "&:hover": { color: colors.martletplaceBlueHover },
  },
  searchBar: {
    borderColor: colors.martletplaceGrey,
    paddingLeft: "0px",
  },
  searchGrid: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100vw",
    height: "30%",
  },

  // Account page styles
  drawer: {
    width: "350px",
    flexShrink: 0,
    position: "relative",
    zIndex: 5,
    "& .MuiDrawer-paper": {
      width: "350px",
      boxSizing: "border-box",
      marginTop: "90px",
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

  // Profile page styles
  uploadPfp: {
    mt: 2,
    backgroundColor: colors.martletplaceNavyBlue,
    "&:hover": { backgroundColor: colors.martletplaceBlueHover },
    textTransform: "none",
    fontSize: "16px",
    padding: "10px 0",
    width: "200px",
    height: "50px",
    alignProperty: "center",
  },

  saveButton: {
    mt: 2,
    backgroundColor: colors.martletplaceNavyBlue,
    "&:hover": { backgroundColor: colors.martletplaceBlueHover },
    textTransform: "none",
    fontSize: "16px",
    padding: "10px 0",
    width: "45%",
    marginRight: "10px",
    marginLeft: "15px",
    marginBottom: "30px",
  },

  cancelButton: {
    mt: 2,
    backgroundColor: colors.martletplaceRed,
    "&:hover": { backgroundColor: colors.martletplaceRedClicked },
    textTransform: "none",
    fontSize: "16px",
    padding: "10px 0",
    width: "45%",
    marginBottom: "30px",
  },
  CreateListingButton: {
    backgroundColor: colors.martletplaceYellow,
    color: colors.martletplaceWhite,
    cursor: "pointer",
    "&:hover": { backgroundColor: colors.martletplaceYellowHover },
    fontSize: "16px",
    height: "80px",
  },
  logOutButton: {
    cursor: "pointer",
    backgroundColor: colors.martletplaceNavyBlue,
    color: colors.martletplaceWhite,
    "&:hover": { backgroundColor: colors.martletplaceBlueHover },
    fontSize: "16px",
    height: "80px",
  },

  // Charity page styles
  charityCard: {
    margin: "20px",
    padding: "20px",
    backgroundColor: "#f9f9f9",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
  orgLogo: {
    margin: "5px",
  },
  sectionTitle: {
    marginTop: "20px",
    marginBottom: "10px",
    fontWeight: "bold",
  },

  // Messages page styles
  messagesConvSidebar: {
    overflowY: "auto",
    width: "20rem",
    height: "100%",
    "@media (max-width: 740px)": {
      width: "100%",
      maxHeight: "300px",
      "&::-webkit-scrollbar": {
        width: "4px",
      },
      "&::-webkit-scrollbar-thumb": {
        backgroundColor: colors.martletplaceGrey,
        borderRadius: "2px",
      },
      "&::-webkit-scrollbar-track": {
        backgroundColor: "white",
      },
    },
  },
  messagesMessagesBox: {
    height: "100%",
    overflowY: "scroll",

    display: "flex",
    border: "none",
    borderColor: colors.martletplaceGrey,
    flexDirection: "column-reverse" as const,
    alignItems: "center",
    gap: "1rem",
    "&::-webkit-scrollbar": {
      width: "4px",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: colors.martletplaceGrey,
      borderRadius: "2px",
    },
    "&::-webkit-scrollbar-track": {
      backgroundColor: "white",
    },
    "& :first-of-type": {
      marginBottom: "0.25rem",
    },
  },
  messagesSendBox: {
    height: vars.messagesSendBoxHeight,
    color: colors.martletplaceGrey,
  },
  messagesSendButton: {},
  messageFromUser: {
    alignSelf: "flex-end",
    backgroundColor: colors.martletplaceSkyBlue,
    padding: "10px",
    maxWidth: "80vw",
    borderRadius: "10px",
    textAlign: "right",
    borderBottomRightRadius: "2px",
    marginInline: "1rem",
    color: "white",
  },
  messageFromOther: {
    alignSelf: "flex-start",
    backgroundColor: colors.martletplaceGrey,
    color: colors.martletplaceWhite,
    padding: "10px",
    maxWidth: "80vw",
    borderRadius: "10px",
    textAlign: "left",
    borderBottomLeftRadius: "2px",
    marginInline: "1rem",
  },
  messagesConvBox: {
    display: "flex",
    flexDirection: "row" as const,
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px",
    border: "none",
    borderBottom: "1px solid lightgrey",
    backgroundColor: "#dcdcdc",
  },
  messagesConvImg: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
  },
  messagesConvPreviewText: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  messagesHideThreadButton: {
    position: "absolute",
    top: "0.5rem",
    left: "0.5rem",
    backgroundColor: colors.martletplaceNavyBlue,
    color: colors.martletplaceWhite,
    "&:hover": {
      backgroundColor: colors.martletplaceBlueHover,
    },
  },
});
