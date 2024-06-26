import { BrowserRouter } from "react-router-dom";
import MyListings from "../../src/pages/MyListings";
import TestProviders from "../utils/TestProviders";

describe("<MyListings />", () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.mount(
      <TestProviders>
        <BrowserRouter>
          <MyListings />
        </BrowserRouter>
      </TestProviders>
    );
  });

  it("renders the My Listings page", () => {
    cy.get("h4").should("contain.text", "My Listings");
  });

  it("gets the listings for a user", () => {
    const expectedListingsObject = {
      listingID: "1",
      title: "Test Listing",
      description: "A test listing",
      price: 50,
      location: "Test Location",
      status: "AVAILABLE",
      dateCreated: "2021-11-01T00:00:00.000Z",
      dateModified: "2021-11-01T00:00:00.000Z",
      images: [{ url: "https://picsum.photos/200/300" }],
    };

    // Stubbing network request for getting profile information
    cy.intercept("GET", "/api/listings", {
      statusCode: 200,
      body: expectedListingsObject,
    }).as("listingsRequest");

    // Wait for the mock request to complete and check its status
    cy.wait("@listingsRequest").then((interception) => {
      // Log request and expected bodies for debugging
      cy.log("Request Body", interception.request.body);
      cy.log("Expected Body", expectedListingsObject);

      if (interception.response) {
        expect(interception.response.body).to.deep.equal(
          expectedListingsObject
        );
      }
    });
  });

  it("lets users edit listings", () => {
    const expectedListingsObject = [
      {
        listingID: "2",
        title: "Test Listing 2",
        description: "Another test listing",
        price: 100,
        location: "Test Location 2",
        status: "AVAILABLE",
        dateCreated: "2021-11-01T00:00:00.000Z",
        dateModified: "2021-11-01T00:00:00.000Z",
        images: [{ url: "https://picsum.photos/200/300" }],
      },
    ];

    // Stubbing network request for getting profile information
    cy.intercept("GET", "/api/listings", {
      statusCode: 200,
      body: expectedListingsObject,
    }).as("listingsRequest");

    // Wait for the mock request to complete and check its status
    cy.wait("@listingsRequest").then((interception) => {
      // Log request and expected bodies for debugging
      cy.log("Request Body", interception.request.body);
      cy.log("Expected Body", expectedListingsObject);

      if (interception.response) {
        expect(interception.response.body).to.deep.equal(
          expectedListingsObject
        );
      }
    });

    // Click the edit button
    cy.get("button").contains("Edit").click();
    cy.url().should("include", "/listing/edit/");
  });
});
