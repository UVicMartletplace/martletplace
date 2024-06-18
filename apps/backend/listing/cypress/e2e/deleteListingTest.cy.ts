describe('API Delete Listing Tests', () => {
  beforeEach(() => {
    // Create a test listing before each test
    cy.request('POST', '/api/listing', {
      listing: {
        title: 'Test Listing',
        description: 'This is a test listing.',
        price: 100,
        location: {
          latitude: 34.23551,
          longitude: -104.54451
        },
        images: [
          {
            url: 'https://example.com/test_image'
          }
        ]
      }
    }).then((response) => {
      expect(response.status).to.eq(201);
      cy.wrap(response.body).as('createdListing');
    });
  });

  it('should delete an existing listing', function() {
    const listingId = this.createdListing.listingID;
    cy.request('DELETE', `/api/listing/${listingId}`)
    .should((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('message', 'Listing deleted successfully');
    });
  });

  it('should return a 404 for a non-existent listing', () => {
    cy.request({
      method: 'DELETE',
      url: '/api/listing/9999',
      failOnStatusCode: false
    })
    .should((response) => {
      expect(response.status).to.eq(404);
    });
  });
});
