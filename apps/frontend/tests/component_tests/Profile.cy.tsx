import { MemoryRouter, Route, Routes } from "react-router-dom";
import Profile from "../../src/pages/Profile";
import TestProviders from "../utils/TestProviders";

describe("<Profile />", () => {
  beforeEach(() => {
    cy.mount(
      <TestProviders>
        <MemoryRouter initialEntries={[`/user/1`]}>
          <Routes>
            <Route path="/user/:id" element={<Profile />} />
          </Routes>
        </MemoryRouter>
      </TestProviders>
    );

    cy.viewport(1280, 720);
  });

  it("renders the profile page", () => {
    cy.get("h4").should("contain.text", "My Profile");

    // Check if the form contains the necessary input fields
    cy.get("#username").should("be.visible");
    cy.get("#name").should("be.visible");
    cy.get("#bio").should("be.visible");
    cy.get("#ClearHistory_button").should("be.visible");
  });

  const testUsername = "theboywholived";
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

  it("saves updated profile information", () => {
    const updatedProfile = {
      username: testUsername,
      name: updatedName,
      bio: updatedBio,
      profilePictureUrl: updatedImageURL,
      password: "",
    };

    // Type into the input fields
    cy.get("#name").clear().type(updatedName).should("have.value", updatedName);
    cy.get("#bio").clear().type(updatedBio).should("have.value", updatedBio);
    cy.get("#username")
      .clear()
      .type(testUsername)
      .should("have.value", testUsername);

    cy.intercept("PATCH", "/api/user", (req) => {
      req.reply({
        statusCode: 200,
        body: { user: updatedProfile },
      });
    }).as("saveProfileRequest");

    // Click the save button
    cy.get("#save_button").click();

    // Wait for the mock request to complete and check its status
    cy.wait("@saveProfileRequest").then((interception) => {
      // Log request and expected bodies for debugging
      cy.log("Request Body", interception.request.body);
      cy.log("Expected Body", updatedProfile);

      if (interception.response) {
        expect(interception.response.body.user).to.deep.equal(updatedProfile);
      }
    });

    // Assert that the profile information is updated correctly
    cy.get("#name").should("have.value", updatedName);
    cy.get("#bio").should("have.value", updatedBio);
  });

  it("fails to save updated profile information", () => {
    const updatedProfile = {
      username: testUsername,
      name: updatedName,
      bio: updatedBio,
      profilePictureUrl: updatedImageURL,
      password: "",
    };

    // Type into the input fields
    cy.get("#name").clear().type(updatedName).should("have.value", updatedName);
    cy.get("#bio").clear().type(updatedBio).should("have.value", updatedBio);
    cy.get("#username")
      .clear()
      .type(testUsername)
      .should("have.value", testUsername);

    cy.intercept("PATCH", "/user", (req) => {
      req.reply((res) => {
        // Log request body for debugging
        cy.log("Request Body", req.body);
        // Validate the request body
        expect(req.body).to.deep.equal(updatedProfile);
        res.send({ statusCode: 400, body: { message: "Bad Request" } });
      });
    }).as("saveProfileRequest");

    // Click the save button
    cy.get("#save_button").click();

    // Assert that the profile information remains as the updated values (failed to save does not revert the inputs)
    cy.get("#name").should("have.value", updatedName);
    cy.get("#bio").should("have.value", updatedBio);
    cy.get("#username").should("have.value", testUsername);
  });

  it("cancels the changes and reverts to original profile information", () => {
    // Initialize the profile with test data
    cy.window().then((win) => {
      const user = {
        name: testName,
        username: testUsername,
        bio: testBio,
        profileUrl: testImageURL,
      };
      win.dispatchEvent(new CustomEvent("setUser", { detail: user }));
    });

    // Type into the input fields
    cy.get("#name").clear().type(updatedName).should("have.value", updatedName);
    cy.get("#bio").clear().type(updatedBio).should("have.value", updatedBio);

    // Click the cancel button
    cy.get("#cancel_button").click();

    // Assert that the profile information is reverted correctly
    cy.get("#name").should("have.value", "");
    cy.get("#bio").should("have.value", "");
  });

  it("disables buttons when no profile information has been updated", () => {
    // Check that save and cancel buttons are disabled
    cy.get("#save_button").invoke("attr", "disabled").should("exist");
    cy.get("#cancel_button").invoke("attr", "disabled").should("exist");
  });

  // Check error for handling invalid username format
  it("displays an error message for invalid username format", () => {
    // Type an invalid username
    cy.get("#username")
      .type("invalid-username2389012839082103820198190830981903")
      .should(
        "have.value",
        "invalid-username2389012839082103820198190830981903"
      );

    // Click the save button
    cy.get("#save_button").click();

    // Check if the error message is displayed
    cy.get("p").should(
      "contain.text",
      "Username must be between 1 and 20 characters and only contain letters or numbers."
    );
  });
});
