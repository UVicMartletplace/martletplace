describe('Create Listing Endpoint', () => {
  const baseUrl = 'http://localhost:8212/api/listing';

  it('should create a new listing successfully', () => {
    cy.request({
      method: 'POST',
      url: baseUrl,
      body: {
        listing: {
          title: 'Sample Listing',
          description: 'This is a sample listing description',
          price: 100,
          location: {
            latitude: 48.4284,
            longitude: -123.3656
          },
          images: [
            { url: 'https://example.com/image1.png' },
            { url: 'https://example.com/image2.png' }
          ]
        }
      }
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property('listing');
      expect(response.body.listing).to.have.property('title', 'Sample Listing');
      expect(response.body.listing).to.have.property('description', 'This is a sample listing description');
      expect(response.body.listing).to.have.property('price', 100);
      expect(response.body.listing.location).to.have.property('latitude', 48.4284);
      expect(response.body.listing.location).to.have.property('longitude', -123.3656);
      expect(response.body.listing.images).to.be.an('array').with.length(2);
    });
  });

  it('should fail to create a new listing with missing parameters', () => {
    cy.request({
      method: 'POST',
      url: baseUrl,
      body: {
        listing: {
          title: 'Sample Listing',
          description: 'This is a sample listing description',
          price: 100,
          location: {} // missing latitude and longitude
        }
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body).to.have.property('error', 'missing parameter in request');
    });
  });
});
