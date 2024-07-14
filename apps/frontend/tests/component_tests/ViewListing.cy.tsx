import ViewListing from "../../src/pages/ViewListing.tsx";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import TestProviders from "../utils/TestProviders.tsx";
import Messages from "../../src/pages/messages/Messages.tsx";

describe("<ViewListing/>", () => {
  const listingObject = {
    title: "Genuine Unicorn Tears - Guaranteed to Add Sparkle to Your Life!",
    description:
      "Are you tired of mundane tears? Try our premium unicorn tears sourced straight from the enchanted forest of Eldoria! Each tear is carefully harvested under the light of a full moon and comes with a certificate of authenticity. Sprinkle them on your morning cereal for an extra magical start to your day!",
    price: 20000,
    seller_profile: { name: "Merlin the Wizard", userID: "A13097430" },
    dateCreated: "1980-05-24T15:30:00Z",
    distance: 420.1,
    images: [
      { url: "https://picsum.photos/200/300" },
      { url: "https://picsum.photos/200/400" },
      { url: "https://picsum.photos/200/300" },
      { url: "https://picsum.photos/200/230" },
      { url: "https://picsum.photos/200/100" },
    ],
    status: "AVAILABLE",
    reviews: [
      {
        listing_review_id: "1",
        reviewerName: "John Doe",
        stars: 5,
        comment: "This is the best product I have ever bought!",
        userID: "1",
        listingID: "1",
        dateCreated: "2024-05-23T15:30:00Z",
        dateModified: "2024-05-23T15:30:00Z",
      },
    ],
    charityId: "1",
  };

  const charityObject = {
    name: "Save the whales",
    description: "string",
    startDate: "2024-07-14T18:03:42.302Z",
    endDate: "2024-07-14T18:03:42.302Z",
    imageUrl: "string",
    organizations: [
      {
        name: "string",
        logoUrl: "string",
        donated: 0,
        receiving: true,
      },
    ],
  };

  const pageJSX = (
    <TestProviders>
      <MemoryRouter initialEntries={[`/listing/view/1`]}>
        <Routes>
          <Route path="/listing/view/:id" element={<ViewListing />} />
          <Route path="/messages" element={<Messages />} />
        </Routes>
      </MemoryRouter>
    </TestProviders>
  );

  const newReviewObject = {
    listing_review_id: "2",
    stars: 5,
    comment: "This is a great product!",
    listingID: "1",
    reviewerName: "Anonymous", // Add this field if it exists
  };

  beforeEach(() => {
    cy.viewport(1280, 720);
  });

  it("should render the listing details correctly", () => {
    cy.intercept("GET", "/api/listing/1", {
      statusCode: 200,
      body: listingObject,
    }).as("getListing");

    cy.intercept("GET", "/api/charities/current", {
      statusCode: 200,
      body: charityObject,
    }).as("getListing");

    cy.mount(pageJSX);
    cy.wait("@getListing");
    cy.pause();

    cy.contains(
      "Genuine Unicorn Tears - Guaranteed to Add Sparkle to Your Life!",
    ).should("be.visible");
    cy.contains(
      "Are you tired of mundane tears? Try our premium unicorn tears sourced straight from the enchanted forest of Eldoria!",
    ).should("be.visible");
    cy.contains("Price: $20,000.00").should("be.visible");
    cy.contains("Sold by: Merlin the Wizard").should("be.visible");
    cy.contains("Posted on: Sat May 24 1980").should("be.visible");
    cy.contains("Message Seller").should("be.visible");
    cy.get("#carousel_img_box > img").should("have.length", 5);
  });

  it("should increment the image and change the visibility", () => {
    cy.intercept("GET", "/api/listing/1", {
      statusCode: 200,
      body: listingObject,
    }).as("getListing");

    cy.mount(pageJSX);
    cy.wait("@getListing");

    cy.get("#carousel_img_box > img").should("have.length", 5);
    for (let x = 1; x < 5; x++) {
      cy.get("#carousel_index").should("have.text", x.toString());
      cy.get("#carousel_right").click();
      cy.get("#carousel_img_box > img").eq(x).should("be.visible");
    }

    for (let x = 5; x > 1; x--) {
      cy.get("#carousel_index").should("have.text", x.toString());
      cy.get("#carousel_img_box > img")
        .eq(x - 1)
        .should("be.visible");
      cy.get("#carousel_left").click();
    }
  });

  it("should fail gracefully if the listing cannot be retrieved", () => {
    cy.mount(pageJSX);
    cy.contains("Hang with us").should("be.visible");
  });

  it("should show reviews", () => {
    cy.intercept("GET", "/api/listing/1", {
      statusCode: 200,
      body: listingObject,
    }).as("getListing");

    cy.mount(pageJSX);
    cy.wait("@getListing");

    cy.contains("John Doe").should("be.visible");
    cy.contains("This is the best product I have ever bought!").should(
      "be.visible",
    );
  });

  it("should allow you to post a review", () => {
    cy.intercept("GET", "/api/listing/1", {
      statusCode: 200,
      body: listingObject,
    }).as("getListing");

    cy.mount(pageJSX);
    cy.wait("@getListing");

    cy.intercept("POST", "/api/review", {
      statusCode: 200,
      body: newReviewObject,
    }).as("postReview");

    cy.get("#review_text").type("This is a great product!");
    cy.get("#stars").click();
    cy.get("button").contains("Post").click();

    cy.wait("@postReview").then((interception) => {
      cy.log("Request Body", interception.request.body);
      cy.log("Expected Body", newReviewObject);

      if (interception.response) {
        expect(interception.response.body).to.deep.equal(newReviewObject);
      }
    });
  });

  it("should fail gracefully if reviews cannot be posted", () => {
    cy.intercept("GET", "/api/listing/1", {
      statusCode: 200,
      body: listingObject,
    }).as("getListing");

    cy.intercept("POST", "/api/review", {
      statusCode: 404,
      body: { newReviewObject },
    }).as("postReview");

    cy.mount(pageJSX);
    cy.wait("@getListing");

    cy.wait(1000);

    cy.get("#review_text").type("This is a great product!");
    cy.get("#stars").click();
    cy.get("button").contains("Post").click();

    cy.wait("@postReview");

    cy.on("window:alert", (text) => {
      expect(text).to.contains("Error posting review, please try again later");
    });
  });

  it("should show an error if review is not correct format", () => {
    cy.intercept("GET", "/api/listing/1", {
      statusCode: 200,
      body: listingObject,
    }).as("getListing");

    cy.mount(pageJSX);
    cy.wait("@getListing");

    cy.get("#review_text").type("This is a great product!");

    cy.get("button").contains("Post").click();
    cy.contains("Please provide a star rating").should("be.visible");
  });

  it("should not allow you to delete another person's review", () => {
    // Mock axios response
    cy.intercept("GET", "/api/listing/1", {
      statusCode: 200,
      body: listingObject,
    }).as("getListing");

    cy.mount(
      <TestProviders>
        <MemoryRouter initialEntries={[`/listing/view/1`]}>
          <Routes>
            <Route path="/listing/view/:id" element={<ViewListing />} />
            <Route path="/messages" element={<Messages />} />
          </Routes>
        </MemoryRouter>
      </TestProviders>,
    );

    cy.wait("@getListing");

    cy.get("#review_text").type("This is a great product!");
    cy.get("#stars").click();
    cy.get("button").contains("Post").click();

    // Wait for the review to be added to the DOM
    cy.contains("This is a great product!").should("be.visible");

    cy.wait(1000); // Waits for 1000 milliseconds (1 second)

    // Ensure the delete button is not present
    cy.get("#delete_review").should("not.exist");
  });
});
