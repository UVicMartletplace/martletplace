import { BrowserRouter } from "react-router-dom";
import MyProfile from "../../src/pages/MyProfile";

describe("<Account />", () => {
  beforeEach(() => {
    cy.mount(
      <BrowserRouter>
        <MyProfile />
      </BrowserRouter>
    );
  });

  it("renders the Account page", () => {
    cy.get("h4").contains("Account");

    // Check if the page contains the necessary components
    cy.get("h5").contains("My Profile");
    cy.get("h5").contains("My Listings");
    cy.get("h5").contains("My Reviews");
  });

  it("navigates to the My Profile page", () => {
    cy.get("h5").contains("My Profile").click();

    // Check if the url contains the correct path
    cy.url().should("include", "/user");
  });

  it("navigates to the My Listings page", () => {
    cy.get("h5").contains("My Listings").click();

    // Check if the url contains the correct path
    cy.url().should("include", "/user/listings");
  });

  it("navigates to the My Reviews page", () => {
    cy.get("h5").contains("My Reviews").click();

    // Check if the url contains the correct path
    cy.url().should("include", "/user/reviews");
  });
});
