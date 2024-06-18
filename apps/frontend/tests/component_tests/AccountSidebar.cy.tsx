import { BrowserRouter } from "react-router-dom";
import MyProfile from "../../src/pages/MyProfile";
import TestProviders from "../utils/TestProviders";

describe("Account Page", () => {
  beforeEach(() => {
    cy.mount(
      <TestProviders>
        <BrowserRouter>
          <MyProfile />
        </BrowserRouter>
      </TestProviders>
    );
    cy.viewport(1280, 720);
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

  it("logs out the user", () => {
    cy.get("h5").contains("Logout").click();

    // Check if the url contains the correct path
    cy.url().should("include", "/user/login");
  });
});
