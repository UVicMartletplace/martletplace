import { BrowserRouter } from "react-router-dom";
import Profile from "../../src/pages/Profile";

describe("Account Page", () => {
  beforeEach(() => {
    cy.mount(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
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
});
