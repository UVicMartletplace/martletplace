describe('API Update Listing Tests', () => {
    it('should update an existing listing', () => {
      cy.request('PATCH', '/api/listing/1', {
        listing: {
          title: 'Updated Calculus Textbook',
          description: 'Used, but in good condition.',
          price: 45,
          location: {
            latitude: 34.23551,
            longitude: -104.54451
          },
          images: [
            {
              url: 'https://example.com/updated_image'
            }
          ]
        },
        status: 'AVAILABLE'
      })
      .should((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('title', 'Updated Calculus Textbook');
      });
    });
  
    it('should return a 404 for a non-existent listing', () => {
      cy.request({
        method: 'PATCH',
        url: '/api/listing/9999',
        body: {
          listing: {
            title: 'Non-existent Listing',
            description: 'This should fail.',
            price: 0,
            location: {
              latitude: 0,
              longitude: 0
            },
            images: []
          },
          status: 'AVAILABLE'
        },
        failOnStatusCode: false
      })
      .should((response) => {
        expect(response.status).to.eq(404);
      });
    });
  });
  