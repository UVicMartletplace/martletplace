import { BrowserRouter } from "react-router-dom";
import Login from "../../src/pages/Login";
import TestProviders from "../utils/TestProviders";

describe("<Login />", () => {
  beforeEach(() => {
    cy.mount(
      <TestProviders>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </TestProviders>
    );
  });

  it("renders the login form", () => {
    cy.get("form").should("be.visible");

    // Check if the form contains the necessary input fields
    cy.get('input[type="text"]').should("be.visible");
    cy.get('input[type="password"]').should("be.visible");
    cy.get('button[type="submit"]').should("be.visible");
  });

  const testEmail = "testEmail@uvic.ca";
  const testPassword = "testPassword";

  it("allows typing into the input fields", () => {
    // Type into the input fields
    cy.get('input[type="text"]')
      .type(testEmail)
      .should("have.value", testEmail);
    cy.get('input[type="password"]')
      .type(testPassword)
      .should("have.value", testPassword);
  });

  it("submits the form and navigates on successful login", () => {
    // Stubbing network request for login as successful
    cy.intercept("POST", "/api/user/login", (req) => {
      req.reply({
        statusCode: 200,
        body: { success: true },
      });
    }).as("loginRequest");

    // Type into the input fields
    cy.get('input[type="text"]').type(testEmail);
    cy.get('input[type="password"]').type(testPassword);

    // Ensure the button is not disabled
    cy.get('button[type="submit"]').should("not.be.disabled").click();

    // Wait for the mock request to complete and check its status
    cy.wait("@loginRequest").its("response.statusCode").should("eq", 200);

    // Check if navigation occurred as expected
    cy.location("pathname").should("eq", "/");
  });

  it("does not navigate on unsuccessful login", () => {
    // Stubbing network request for login as unsuccessful
    cy.intercept("POST", "/api/user/login", (req) => {
      req.reply({
        statusCode: 401, // Use an appropriate status code for failed login
        body: { success: false, message: "Invalid credentials" },
      });
    }).as("loginFailRequest");

    // Type into the input fields
    cy.get('input[type="text"]').type("wronguser");
    cy.get('input[type="password"]').type("wrongpassword");

    // Ensure the button is not disabled
    cy.get('button[type="submit"]').should("not.be.disabled").click();

    // Wait for the mock request to complete and check its status
    cy.wait("@loginFailRequest").its("response.statusCode").should("eq", 401);

    // Check if navigation has not occurred, implying the user is still on the login page
    // Uncomment below once backend is ready: ticket #140
    // cy.location("pathname").should("eq", "/user/login");

    // Check if the error message is displayed
    cy.contains(
      "Login unsuccessful. Invalid username and password combination"
    ).should("be.visible");
  });

  it("shows forget password link", () => {
    cy.contains("Forgot Password?")
      .should("be.visible")
      .and("have.attr", "href", "/user/resetpassword");
  });

  it("shows create account link", () => {
    cy.contains("New? Create an Account")
      .should("be.visible")
      .and("have.attr", "href", "/user/signup");
  });

  it("prevents submission when username is missing", () => {
    // Type into the input fields
    cy.get('input[type="password"]').type(testPassword);

    // Ensure the button is disabled
    cy.get('button[type="submit"]').should("be.disabled");
  });

  it("prevents submission when password is missing", () => {
    // Type into the input fields
    cy.get('input[type="text"]').type(testEmail);

    // Ensure the button is disabled
    cy.get('button[type="submit"]').should("be.disabled");
  });

  it("prevents submission when both fields are empty", () => {
    cy.get('button[type="submit"]').should("be.disabled");
  });
});
