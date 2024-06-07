import { BrowserRouter } from "react-router-dom";
import CreateAccount from "../../src/pages/CreateAccount";

describe("<CreateAccount />", () => {
  beforeEach(() => {
    cy.mount(
      <BrowserRouter>
        <CreateAccount />
      </BrowserRouter>
    );
  });

  it("renders the create account form", () => {
    cy.get("form").should("be.visible");

    // Check if the form contains the necessary input fields
    cy.get('input[type="email"]').should("be.visible");
    cy.get('input[type="text"]').should("be.visible");
    cy.get('input[type="password"]').should("be.visible");
    cy.get('button[type="submit"]').should("be.visible");
  });

  it("allows typing into the input fields", () => {
    // Test data
    const testEmail = "test@uvic.ca";
    const testUsername = "testuser";
    const testPassword = "testpassword";

    // Type into the input fields
    cy.get('input[type="email"]')
      .type(testEmail)
      .should("have.value", testEmail);
    cy.get('input[type="text"]')
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
    cy.get('input[type="email"]').type("test@uvic.ca");
    cy.get('input[type="text"]').type("testuser");
    cy.get('input[type="password"]').type("Test123@");

    // Ensure the button is not disabled
    cy.get('button[type="submit"]').should("not.be.disabled").click();

    // Wait for the mock request to complete and check its status
    cy.wait("@createAccountRequest")
      .its("response.statusCode")
      .should("eq", 201);

    // Check if navigation occurred as expected
    cy.location("pathname").should("eq", "/");
  });

  it("does not navigate on unsuccessful account creation", () => {
    // Stubbing network request for create account as unsuccessful
    cy.intercept("POST", "/api/user", {
      statusCode: 401,
      body: { success: false, message: "Invalid credentials" },
    }).as("createAccountFailRequest");

    // Type into the input fields
    cy.get('input[type="email"]').type("test@uvic.ca");
    cy.get('input[type="text"]').type("testuser");
    cy.get('input[type="password"]').type("Test123@");

    // Ensure the button is not disabled
    cy.get('button[type="submit"]').should("not.be.disabled").click();

    // Wait for the mock request to complete and check its status
    cy.wait("@createAccountFailRequest")
      .its("response.statusCode")
      .should("eq", 401);

    // Check if navigation has not occurred, implying the user is still on the login page
    // Uncomment below once backend is ready: ticket #141
    // cy.location("pathname").should("eq", "/user/signup");

    // Optionally check for the presence of an error message
    cy.contains("An unexpected error occurred").should("be.visible");
  });

  it("shows create account link", () => {
    cy.contains("Already have an account? Login")
      .should("be.visible")
      .and("have.attr", "href", "/user/login");
  });

  it("prevents submission when username is missing", () => {
    cy.get('input[type="email"]').type("test@uvic.ca");
    cy.get('input[type="password"]').type("testpassword");
    cy.get('button[type="submit"]').should("be.disabled");
  });

  it("prevents submission when password is missing", () => {
    cy.get('input[type="email"]').type("test@uvic.ca");
    cy.get('input[type="text"]').type("testuser");
    cy.get('button[type="submit"]').should("be.disabled");
  });

  it("prevents submission when email is missing", () => {
    cy.get('input[type="text"]').type("testuser");
    cy.get('input[type="password"]').type("testpassword");
    cy.get('button[type="submit"]').should("be.disabled");
  });

  it("prevents submission when email is invalid", () => {
    cy.get('input[type="email"]').type("test@gmail.com");
    cy.get('input[type="text"]').type("testuser");
    cy.get('input[type="password"]').type("testpassword");

    cy.get('button[type="submit"]').should("not.be.disabled").click();

    cy.contains("Email must be a valid UVic email address.").should(
      "be.visible"
    );
  });

  it("prevents submission when all fields are empty", () => {
    cy.get('button[type="submit"]').should("be.disabled");
  });
});
