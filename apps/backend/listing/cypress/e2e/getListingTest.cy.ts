describe('Get Listing by ID Endpoint', () => {
  const baseUrl = 'http://localhost:8212/api/listing';

  it('should retrieve a listing successfully and calculate zero distance for same coordinates', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/1`, // assuming listing with ID 1 exists
      body: {
        user_location: {
          latitude: 48.4310,  // same as listing 1 latitude
          longitude: 123.5920 // same as listing 1 longitude
        }
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('listingID', 1);
      expect(response.body).to.have.property('title', ' Lee posh Lactic Acid 60% Anti ageing Pigmentation Removing Glow Peel ');
      expect(response.body).to.have.property('description', 'PROFESSIONAL GRADE Face Peel: this peel stimulates collagen production, reducing the appearance of wrinkles, fine lines, and hyper pigmentation in the skin by increasing cell regeneration Highly effective professional strength superficial solution Read direction for use on bottle of product & if any query call customer care');
      expect(response.body).to.have.property('price', 13);
      expect(response.body).to.have.property('status', 'AVAILABLE');
      expect(response.body).to.have.property('dateCreated');
      expect(response.body).to.have.property('dateModified');
      expect(response.body).to.have.property('reviews').to.be.an('array');
      expect(response.body).to.have.property('images').to.be.an('array');
      expect(response.body).to.have.property('distance', 0); // expect the distance to be zero
    });
  });

  it('should fail to retrieve a non-existent listing', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/9999`, // assuming listing with ID 9999 does not exist
      failOnStatusCode: false,
      body: {
        user_location: {
          latitude: 40.7128, // any valid latitude
          longitude: -74.0060 // any valid longitude
        }
      }
    }).then((response) => {
      expect(response.status).to.eq(404);
      expect(response.body).to.have.property('error', 'Listing not found');
    });
  });
});
