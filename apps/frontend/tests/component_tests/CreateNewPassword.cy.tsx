import { BrowserRouter } from "react-router-dom";
import TestProviders from "../utils/TestProviders";
import CreateNewPassword from "../../src/pages/CreateNewPassword";

describe("<CreateNewPassword />", () => {
  it("renders the create new password page", () => {
    cy.mount(
      <TestProviders>
        <BrowserRouter>
          <CreateNewPassword />
        </BrowserRouter>
      </TestProviders>
    );
    cy.contains("Create New Password").should("be.visible");
    cy.get("#password").should("be.visible");
    cy.get("#confirm-password").should("be.visible");
  });

  it("allows typing into the input fields", () => {
    cy.mount(
      <TestProviders>
        <BrowserRouter>
          <CreateNewPassword />
        </BrowserRouter>
      </TestProviders>
    );
    const testPassword = "testPassword";
    cy.get("#password").type(testPassword).should("have.value", testPassword);
    cy.get("#confirm-password")
      .type(testPassword)
      .should("have.value", testPassword);
  });

  it("should display error if passwords does not meet requirements", () => {
    cy.mount(
      <TestProviders>
        <BrowserRouter>
          <CreateNewPassword />
        </BrowserRouter>
      </TestProviders>
    );
    const testPassword = "testPassword";
    cy.get("#password").type(testPassword);
    cy.get("#confirm-password").type("notMatchingPassword");
    cy.get("#reset-password-button").click();
    cy.contains("Password does not meet the requirements.").should(
      "be.visible"
    );
  });

  it("should display error if passwords do not match", () => {
    cy.mount(
      <TestProviders>
        <BrowserRouter>
          <CreateNewPassword />
        </BrowserRouter>
      </TestProviders>
    );
    const testPassword = "testPassword!@#123123123";
    cy.get("#password").type(testPassword);
    cy.get("#confirm-password").type("testPassword!@#123!!");
    cy.get("#reset-password-button").click();
    cy.contains("Passwords do not match.").should("be.visible");
  });
});
