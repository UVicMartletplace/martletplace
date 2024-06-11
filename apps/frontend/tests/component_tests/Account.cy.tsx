import { BrowserRouter } from "react-router-dom";
import Account from "../../src/pages/Account";

describe("<Account />", () => {
  beforeEach(() => {
    cy.mount(
      <BrowserRouter>
        <Account />
      </BrowserRouter>
    );
  });

  it("renders the Account page", () => {
    cy.get("h4").contains("Account");

    // Check if the page contains the necessary components
    cy.get("h5").contains("Your Profile");
    cy.get("h5").contains("Your Listings");
    cy.get("h5").contains("Your Reviews");
  });

  it("navigates to the Your Profile page", () => {
    cy.get("h5").contains("Your Profile").click();
    cy.get("h1").contains("YourProfile");
  });

  it("navigates to the Your Listings page", () => {
    cy.get("h5").contains("Your Listings").click();
    cy.get("h1").contains("YourListings");
  });

  it("navigates to the Your Reviews page", () => {
    cy.get("h5").contains("Your Reviews").click();
    cy.get("h1").contains("YourReviews");
  });
});
