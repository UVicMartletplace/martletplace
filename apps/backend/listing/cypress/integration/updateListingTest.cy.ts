describe('Update Listing Endpoint', () => {

  it('should update a listing successfully', () => {
    cy.request({
      method: 'PATCH',
      url: '/api/listing/1', // assuming listing with ID 1 exists
      body: {
        listing: {
          title: 'Updated Listing One',
          description: 'Updated description for listing one',
          price: 150,
          location: {
            latitude: 40.7128,
            longitude: -74.0060
          },
          images: [
            { url: 'https://example.com/image1.png' },
            { url: 'https://example.com/image2.png' }
          ]
        },
        status: 'AVAILABLE'
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('listingID', 1);
      expect(response.body).to.have.property('title', 'Updated Listing One');
      expect(response.body).to.have.property('description', 'Updated description for listing one');
      expect(response.body).to.have.property('price', 150);
      expect(response.body.location).to.have.property('latitude', 40.7128);
      expect(response.body.location).to.have.property('longitude', -74.0060);
      expect(response.body).to.have.property('status', 'AVAILABLE');
      expect(response.body).to.have.property('dateModified');
      expect(response.body).to.have.property('images').to.be.an('array').with.length(2);
    });
  });

  it('should fail to update a non-existent listing', () => {
    cy.request({
      method: 'PATCH',
      url: '/api/listing/9999', // assuming listing with ID 9999 does not exist
      body: {
        listing: {
          title: 'Updated Listing Non-existent',
          description: 'Updated description for non-existent listing',
          price: 150,
          location: {
            latitude: 40.7128,
            longitude: -74.0060
          },
          images: [
            { url: 'https://example.com/image1.png' },
            { url: 'https://example.com/image2.png' }
          ]
        },
        status: 'AVAILABLE'
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(404);
      expect(response.body).to.have.property('error', 'Listing not found');
    });
  });
});
