import { BrowserRouter } from "react-router-dom";
import TestProviders from "../utils/TestProviders";
import ForgotPassword from "../../src/pages/ForgotPassword";

describe("<ForgotPassword />", () => {
  it("renders the forgot password page", () => {
    cy.mount(
      <TestProviders>
        <BrowserRouter>
          <ForgotPassword />
        </BrowserRouter>
      </TestProviders>
    );
    cy.contains("Send Password Reset Email").should("be.visible");
    cy.get("#email").should("be.visible");
  });

  it("allows typing into the email input field", () => {
    cy.mount(
      <TestProviders>
        <BrowserRouter>
          <ForgotPassword />
        </BrowserRouter>
      </TestProviders>
    );
    const testEmail = "test@uvic.ca";
    cy.get("#email").type(testEmail).should("have.value", testEmail);
  });

  it("should correctly send API request to reset password", () => {
    const testEmail = "test@uvic.ca";

    cy.intercept("POST", "/api/user/reset-password", (req) => {
      req.reply({
        statusCode: 200,
        body: { email: testEmail },
      });
    }).as("resetPasswordRequest");

    cy.mount(
      <TestProviders>
        <BrowserRouter>
          <ForgotPassword />
        </BrowserRouter>
      </TestProviders>
    );
    cy.get("#email").type(testEmail);
    cy.get("#reset-password-button").click();

    cy.wait("@resetPasswordRequest").then((interception) => {
      // Log request and expected bodies for debugging
      cy.log("Request Body", interception.request.body);
      cy.log("Expected Body");

      if (interception.response) {
        expect(interception.response.body).to.deep.equal({ email: testEmail });
      }
    });
  });

  it("should display an error message if the email is invalid", () => {
    const testEmail = "bdebh";
    cy.mount(
      <TestProviders>
        <BrowserRouter>
          <ForgotPassword />
        </BrowserRouter>
      </TestProviders>
    );
    cy.get("#email").type(testEmail);
    cy.get("#reset-password-button").click();
    cy.contains("Please enter a valid UVic email.").should("be.visible");
  });
});
