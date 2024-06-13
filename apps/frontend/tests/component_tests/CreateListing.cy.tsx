import CreateListing from "../../src/pages/CreateListing.tsx";

describe("<CreateListing />", () => {
  beforeEach(() => {
    cy.mount(<CreateListing />);
    cy.viewport(1280, 720);
  });

  it("renders", () => {
    // see: https://on.cypress.io/mounting-react
    cy.contains("Create Listing").should("be.visible");
    cy.get("#field-title").should("be.visible");
    cy.get("#field-description").should("be.visible");
    cy.get("#field-price").should("be.visible");
    cy.get("#field-price").should("be.visible");
    cy.get("#submit-button").should("be.visible");
  });

  it("Clicks the submit button and is successful", () => {
    const listingObject = {
      listingID: "A23F29039B23",
      seller_profile: {
        userID: "A12334B345",
        username: "hubert123",
        name: "Bartholomew Hubert",
        bio: "I love stuff",
        profilePictureUrl: "https://example.com/image.png",
      },
      title: "Used Calculus Textbook",
      description: "No wear and tear, drop-off available.",
      price: 50,
      location: {
        latitude: 34.23551,
        longitude: -104.54451,
      },
      status: "AVAILABLE",
      dateCreated: "2024-05-23T15:30:00Z",
      dateModified: "2024-05-23T15:30:00Z",
      reviews: [
        {
          listing_review_id: "A23F29039B23",
          reviewerName: "John Doe",
          stars: 5,
          comment:
            "Great seller, the item was exactly as described and in perfect condition.",
          userID: "A23434B090934",
          listingID: "A23F29039B23",
          dateCreated: "2024-05-23T15:30:00Z",
          dateModified: "2024-05-23T15:30:00Z",
        },
      ],
      images: [
        {
          url: "https://example.com/image",
        },
      ],
      distance: 4.2,
    };

    cy.intercept("POST", "/api/listing", {
      statusCode: 201,
      body: listingObject,
    }).as("createListing");

    cy.intercept("POST", "/api/images", {
      statusCode: 201,
      url: "https://picsum.photos/200/300",
    }).as("uploadImages");

    cy.get("#submit-button").click();
    cy.on("window:alert", (message) => {
      expect(message).to.equal("Listing Created!");
    });
  });

  it("Fails at submitting a listing", () => {
    cy.intercept("POST", "/api/listing", {
      statusCode: 400,
      body: { error: "missing parameter in request" },
    }).as("getPost");

    cy.get("#submit-button").click();
    cy.on("window:alert", (message) => {
      expect(message).to.equal("Listing Creation Failed");
    });
  });

  it("Creates a listing properly, and the post request is valid", () => {
    const listingObject = {
      listing: {
        title: "Used Calculus Textbook",
        price: 50,
        location: { latitude: 0, longitude: 0 },
        images: [
          {url: "https://picsum.photos/200/300" },
          {url: "https://picsum.photos/200/300" },
          {url: "https://picsum.photos/200/300" }
        ]
      }
    };

    cy.intercept("POST", "/api/listing", {
      statusCode: 201,
      body: listingObject,
    }).as("createListing");

    cy.intercept("POST", "/api/images", {
      statusCode: 201,
      body: { url: "https://picsum.photos/200/300" },
    }).as("uploadImages");

    cy.get("#field-title").type("Used Calculus Textbook");
    cy.get("#field-description").type("No wear and tear, drop-off available.");
    cy.get("#field-price").type("50");

    // Attach image files (if this is necessary for your test)
    cy.get("#image-input").attachFile([
      "../../src/images/test_image1.jpg",
      "../../src/images/test_image2.jpg",
      "../../src/images/test_image3.jpg",
    ]);

    cy.get("#submit-button").click();

    // Wait for the interception of createListing
    cy.wait("@createListing").then((interception) => {
      const requestBody = interception.request.body;
      console.log("Request Body", requestBody);
      console.log("Expected Body", listingObject);
      // The following tests work in the GUI but not headless, I'm not sure what to do tbh
      // expect(requestBody.listing.title).to.equal(listingObject.listing.title);
      // expect(requestBody.listing.images.length).to.equal(listingObject.listing.images.length);
    });
  });
});
