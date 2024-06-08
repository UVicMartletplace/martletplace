import ViewListing from "../../src/pages/ViewListing.tsx";
import {MemoryRouter, Route, Routes} from "react-router-dom";


describe('<ViewListing/>', () => {
  it('should render the listing details correctly', () => {
    const listingObject = {
      "title": "Sample Title",
      "description": "Sample Description",
      "price": 100,
      "seller_profile": {"name": "Jane Doe"},
      "dateCreated": "2024-05-24T15:30:00Z",
      "images": [
          {"url": "https://picsum.photos/200/300"},
          {"url": "https://picsum.photos/200/400"},
          {"url": "https://picsum.photos/200/300"},
          {"url": "https://picsum.photos/200/230"},
          {"url": "https://picsum.photos/200/100"}
      ]
    };

    // Mock axios response
    cy.intercept('GET', '/api/listing/1', {
      statusCode: 200,
      body: listingObject,
    }).as("getListing");

    // Mount the component
    cy.mount(
        <MemoryRouter initialEntries={[`/listing/view/1`]}>
          <Routes>
            <Route path="/listing/view/:id" element={<ViewListing />} />
          </Routes>
      </MemoryRouter>
    );

    // Assertions to verify the rendered content
    cy.contains('Sample Title').should('be.visible');
    cy.contains('Sample Description').should('be.visible');
    cy.contains('Price: $100.00').should('be.visible');
    cy.contains('Sold by: Jane Doe').should('be.visible');
    cy.contains('Posted on: Fri May 24 2024').should('be.visible');
    cy.contains('Message Seller').should('be.visible');
    cy.get('img').should('have.length', 5);
  });
});