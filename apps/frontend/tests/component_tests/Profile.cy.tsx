import { MemoryRouter, Route, Routes } from "react-router-dom";
import MyProfile from "../../src/pages/Profile";

describe("<MyProfile />", () => {
  beforeEach(() => {
    cy.mount(
      <MemoryRouter initialEntries={[`/user/1`]}>
        <Routes>
          <Route path="/user/:id" element={<MyProfile />} />
        </Routes>
      </MemoryRouter>
    );

    cy.viewport(1280, 720);
  });

  it("renders the profile page", () => {
    cy.get("h2").should("contain.text", "My Profile");

    // Check if the form contains the necessary input fields
    cy.get("#username").should("be.visible");
    cy.get("#email").should("be.visible");
    cy.get("#name").should("be.visible");
    cy.get("#bio").should("be.visible");
  });

  const testUsername = "theboywholived";
  const testPassword = "expelliarmus";
  const testEmail = "hpotter@hogwarts.ld";
  const testName = "Harry James Potter";
  const testBio = "Dumbledore's Army Forever!";
  const testImageURL = "https://example.com/image.png";

  const updatedName = "Hermione Granger";
  const updatedBio = "Brightest witch of her age";
  const updatedImageURL = "https://example.com/hermione.png";

  it("allows typing into the input fields", () => {
    // Type into the input fields
    cy.get("#name").type(testName).should("have.value", testName);
    cy.get("#bio").type(testBio).should("have.value", testBio);
  });

  it("gets the profile information for a user", () => {
    // Stubbing network request for getting profile information
    cy.intercept("GET", "/api/user/1", {
      statusCode: 200,
      body: {
        username: testUsername,
        name: testName,
        password: testPassword,
        email: testEmail,
        bio: testBio,
        profilePictureUrl: testImageURL,
      },
    }).as("profileRequest");

    // Wait for the mock request to complete and check its status
    cy.wait("@profileRequest").its("response.statusCode").should("eq", 200);

    // Check if the profile information is displayed correctly
    cy.get("#username").should("have.value", testUsername);
    cy.get("#email").should("have.value", testEmail);
    cy.get("#name").should("have.value", testName);
    cy.get("#bio").should("have.value", testBio);
  });

  it("saves updated profile information", () => {
    // Stubbing network request for getting profile information
    cy.intercept("GET", "/api/user/1", {
      statusCode: 200,
      body: {
        username: testUsername,
        name: testName,
        password: testPassword,
        email: testEmail,
        bio: testBio,
        profilePictureUrl: testImageURL,
      },
    }).as("profileRequest");

    // Wait for the mock request to complete and check its status
    cy.wait("@profileRequest").its("response.statusCode").should("eq", 200);

    // Type into the input fields
    cy.get("#name").clear().type(updatedName).should("have.value", updatedName);
    cy.get("#bio").clear().type(updatedBio).should("have.value", updatedBio);

    cy.intercept("POST", "/api/images", {
      statusCode: 201,
      url: updatedImageURL,
    }).as("uploadImages");

    // Stubbing network request for saving profile information
    cy.intercept("PATCH", "/api/user", {
      statusCode: 200,
      body: {
        username: testUsername,
        name: updatedName,
        password: testPassword,
        email: testEmail,
        bio: updatedBio,
        profilePictureUrl: updatedImageURL,
      },
    }).as("saveProfileRequest");

    // Click the save button
    cy.get("#save_button").click();

    // Wait for the mock request to complete and check its status
    cy.wait("@saveProfileRequest").its("response.statusCode").should("eq", 200);

    // Assert that the profile information is updated correctly
    cy.get("#name").should("have.value", updatedName);
    cy.get("#bio").should("have.value", updatedBio);
  });

  it("fails to save updated profile information", () => {
    // Stubbing network request for getting profile information
    cy.intercept("GET", "/api/user/1", {
      statusCode: 200,
      body: {
        username: testUsername,
        name: testName,
        password: testPassword,
        email: testEmail,
        bio: testBio,
        profilePictureUrl: testImageURL,
      },
    }).as("profileRequest");

    // Wait for the mock request to complete and check its status
    cy.wait("@profileRequest").its("response.statusCode").should("eq", 200);

    // Type into the input fields
    cy.get("#name").clear().type(updatedName).should("have.value", updatedName);
    cy.get("#bio").clear().type(updatedBio).should("have.value", updatedBio);

    cy.intercept("POST", "/api/images", {
      statusCode: 201,
      url: updatedImageURL,
    }).as("uploadImages");

    // Stubbing network request for saving profile information
    cy.intercept("PATCH", "/api/user", {
      statusCode: 400,
      body: { message: "Bad Request" },
    }).as("saveProfileRequest");

    // Click the save button
    cy.get("#save_button").click();

    // Wait for the mock request to complete and check its status
    cy.wait("@saveProfileRequest").its("response.statusCode").should("eq", 400);

    // Assert that the profile information is not updated
    cy.get("#name").should("have.value", updatedName);
    cy.get("#bio").should("have.value", updatedBio);
  });

  it("cancels the changes and reverts to original profile information", () => {
    // Stubbing network request for getting profile information
    cy.intercept("GET", "/api/user/1", {
      statusCode: 200,
      body: {
        username: testUsername,
        name: testName,
        password: testPassword,
        email: testEmail,
        bio: testBio,
        profilePictureUrl: testImageURL,
      },
    }).as("profileRequest");

    // Wait for the mock request to complete and check its status
    cy.wait("@profileRequest").its("response.statusCode").should("eq", 200);

    // Type into the input fields
    cy.get("#name").clear().type(updatedName).should("have.value", updatedName);
    cy.get("#bio").clear().type(updatedBio).should("have.value", updatedBio);

    // Click the cancel button
    cy.get("#cancel_button").click();

    // Assert that the profile information is reverted correctly
    cy.get("#name").should("have.value", testName);
    cy.get("#bio").should("have.value", testBio);
  });

  it("disables buttons when no profile information has been updated", () => {
    // Stubbing network request for getting profile information
    cy.intercept("GET", "/api/user/1", {
      statusCode: 200,
      body: {
        username: testUsername,
        name: testName,
        password: testPassword,
        email: testEmail,
        bio: testBio,
        profilePictureUrl: testImageURL,
      },
    }).as("profileRequest");

    // Wait for the mock request to complete and check its status
    cy.wait("@profileRequest").its("response.statusCode").should("eq", 200);

    // Check that save and cancel buttons are disabled
    cy.get("#save_button").invoke("attr", "disabled").should("exist");
    cy.get("#cancel_button").invoke("attr", "disabled").should("exist");
  });
});
