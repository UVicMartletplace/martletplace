import { BrowserRouter } from "react-router-dom";
import Profile from "../../src/pages/Profile";
import TestProviders from "../utils/TestProviders";

describe("Account Page", () => {
  beforeEach(() => {
    cy.mount(
      <TestProviders>
        <BrowserRouter>
          <Profile />
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

  it("logs out the user", () => {
    cy.get("h5").contains("Logout").click();

    // Check if the url contains the correct path
    cy.url().should("include", "/user/login");
  });
});
