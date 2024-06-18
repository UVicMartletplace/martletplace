import EditListing from '../../src/pages/EditListing'
import {MemoryRouter, Route, Routes} from "react-router-dom";

const listingObject = {
      listingID: "A23F29039B23",
      seller_profile: {
        userID: "A12334B345",
        username: "hubert123",
        name: "Bartholomew Hubert",
        bio: "I love stuff",
        profilePictureUrl: "https://example.com/image.png"
      },
      title: "Used Calculus Textbook",
      description: "No wear and tear, drop-off available.",
      price: 50,
      location: {
        latitude: 34.23551,
        longitude: -104.54451
      },
      status: "AVAILABLE",
      dateCreated: "2024-05-23T15:30:00Z",
      dateModified: "2024-05-23T15:30:00Z",
      reviews: [
        {
          listing_review_id: "A23F29039B23",
          reviewerName: "John Doe",
          stars: 5,
          comment: "Great seller, the item was exactly as described and in perfect condition.",
          userID: "A23434B090934",
          listingID: "A23F29039B23",
          dateCreated: "2024-05-23T15:30:00Z",
          dateModified: "2024-05-23T15:30:00Z"
        }
      ],
      images: [
        { url: "https://example.com/image" }
      ],
      distance: 4.2
    };


describe('<EditListing />', () => {
  beforeEach(() => {
    cy.mount(
      <MemoryRouter initialEntries={[`/listing/edit/1`]}>
        <Routes>
          <Route path="/listing/edit/:id" element={<EditListing />} />
        </Routes>
      </MemoryRouter>,
    );
    cy.viewport(1280, 720);
  });

  it('renders', () => {
    // see: https://on.cypress.io/mounting-react

    cy.intercept("GET", "/api/listing/1", {
      statusCode: 200,
      body: listingObject,
    }).as("getListing");

    cy.intercept("PATCH", "/api/listing/1", {
      statusCode: 200,
    }).as("patchListing");

    cy.contains("Edit Listing").should("be.visible");
  })
})