import { BrowserRouter } from "react-router-dom";
import CreateAccount from "../../src/pages/CreateAccount";
import TestProviders from "../utils/TestProviders";

describe("<CreateAccount />", () => {
  const testEmail = "test@uvic.ca";
  const testName = "Default User";
  const testUsername = "testuser";
  const testPassword = "Test1234@";
  const invalidEmail = "test@gmail.com";

  beforeEach(() => {
    cy.mount(
      <TestProviders>
        <BrowserRouter>
          <CreateAccount />
        </BrowserRouter>
      </TestProviders>
    );
  });

  it("renders the create account form", () => {
    cy.get("form").should("be.visible");

    // Check if the form contains the necessary input fields
    cy.get('input[type="email"]').should("be.visible");
    cy.get("input[name=fullName]").should("be.visible");
    cy.get("input[name=username]").should("be.visible");
    cy.get('input[type="password"]').should("be.visible");
    cy.get('button[type="submit"]').should("be.visible");
  });

  it("allows typing into the input fields", () => {
    // Type into the input fields
    cy.get('input[type="email"]')
      .type(testEmail)
      .should("have.value", testEmail);
    cy.get("input[name=fullName]")
      .type(testName)
      .should("have.value", testName);
    cy.get("input[name=username]")
      .type(testUsername)
      .should("have.value", testUsername);
    cy.get('input[type="password"]')
      .type(testPassword)
      .should("have.value", testPassword);
  });

  it("submits the form and navigates on successful account creation", () => {
    // Stubbing network request for successful account creation
    cy.intercept("POST", "/api/user", {
      statusCode: 201,
      body: { success: true },
    }).as("createAccountRequest");

    // Type into the input fields
    cy.get('input[type="email"]').type(testEmail);
    cy.get("input[name=fullName]").type(testName);
    cy.get("input[name=username]").type(testUsername);
    cy.get('input[type="password"]').type(testPassword);

    // Ensure the button is not disabled
    cy.get('button[type="submit"]').should("not.be.disabled").click();

    // Wait for the mock request to complete and check its status
    cy.wait("@createAccountRequest")
      .its("response.statusCode")
      .should("eq", 201);
  });

  it("does not navigate on unsuccessful account creation", () => {
    // Stubbing network request for create account as unsuccessful
    cy.intercept("POST", "/api/user", {
      statusCode: 401,
      body: { success: false, message: "Invalid credentials" },
    }).as("createAccountFailRequest");

    // Type into the input fields
    cy.get('input[type="email"]').type(testEmail);
    cy.get("input[name=fullName]").type(testName);
    cy.get("input[name=username]").type(testUsername);
    cy.get('input[type="password"]').type(testPassword);

    // Ensure the button is not disabled
    cy.get('button[type="submit"]').should("not.be.disabled").click();

    // Wait for the mock request to complete and check its status
    cy.wait("@createAccountFailRequest")
      .its("response.statusCode")
      .should("eq", 401);

    // Check if navigation has not occurred, implying the user is still on the login page
    // Uncomment below once backend is ready: ticket #141
    // cy.location("pathname").should("eq", "/user/signup");

    // Check for window alert
    cy.on("window:alert", (str) => {
      expect(str).to.equal("Failed to create account. Please try again.");
    });
  });

  it("shows create account link", () => {
    cy.contains("Already have an account? Login")
      .should("be.visible")
      .and("have.attr", "href", "/user/login");
  });

  it("prevents submission when email is missing", () => {
    // Type into the input fields
    cy.get("input[name=fullName]").type(testName);
    cy.get("input[name=username]").type(testUsername);
    cy.get('input[type="password"]').type(testPassword);

    // Ensure the button is disabled
    cy.get('button[type="submit"]').should("be.disabled");
  });

  it("prevents submission when name is missing", () => {
    // Type into the input fields
    cy.get('input[type="email"]').type(testEmail);
    cy.get("input[name=username]").type(testUsername);
    cy.get('input[type="password"]').type(testPassword);

    // Ensure the button is disabled
    cy.get('button[type="submit"]').should("be.disabled");
  });

  it("prevents submission when username is missing", () => {
    // Type into the input fields
    cy.get('input[type="email"]').type(testEmail);
    cy.get("input[name=fullName]").type(testName);
    cy.get('input[type="password"]').type(testPassword);

    // Ensure the button is disabled
    cy.get('button[type="submit"]').should("be.disabled");
  });

  it("prevents submission when username is invalid format", () => {
    // Type into the input fields
    cy.get('input[type="email"]').type(testEmail);
    cy.get("input[name=fullName]").type(testName);
    cy.get("input[name=username]").type("testuser@");
    cy.get('input[type="password"]').type(testPassword);

    // Ensure the button is not disabled
    cy.get('button[type="submit"]').should("not.be.disabled").click();

    // Check if the error message is displayed
    cy.contains(
      "Username must be between 1 and 20 characters and only contain letters or numbers."
    ).should("be.visible");
  });

  it("prevents submission when password is missing", () => {
    // Type into the input fields
    cy.get('input[type="email"]').type(testEmail);
    cy.get("input[name=fullName]").type(testName);
    cy.get("input[name=username]").type(testUsername);

    // Ensure the button is disabled
    cy.get('button[type="submit"]').should("be.disabled");
  });

  it("prevents submission when email is invalid", () => {
    // Type into the input fields
    cy.get('input[type="email"]').type(invalidEmail);
    cy.get("input[name=fullName]").type(testName);
    cy.get("input[name=username]").type(testUsername);
    cy.get('input[type="password"]').type("testpassword");

    // Ensure the button is not disabled
    cy.get('button[type="submit"]').should("not.be.disabled").click();

    // Check if the error message is displayed
    cy.contains("Please enter a valid UVic email.").should("be.visible");
  });

  it("prevents submission when all fields are empty", () => {
    // Ensure the button is disabled
    cy.get('button[type="submit"]').should("be.disabled");
  });
});
