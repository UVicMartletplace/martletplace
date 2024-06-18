describe('API Create Listing Tests', () => {
    it('should create a new listing', () => {
      cy.request('POST', '/api/listing', {
        listing: {
          title: 'New Calculus Textbook',
          description: 'Brand new, never used.',
          price: 60,
          location: {
            latitude: 34.23551,
            longitude: -104.54451
          },
          images: [
            {
              url: 'https://example.com/new_image'
            }
          ]
        }
      })
      .should((response) => {
        expect(response.status).to.eq(201);
        expect(response.body).to.have.property('title', 'New Calculus Textbook');
      });
    });
  
    it('should return a 400 for missing listing data', () => {
      cy.request({
        method: 'POST',
        url: '/api/listing',
        body: {},
        failOnStatusCode: false
      })
      .should((response) => {
        expect(response.status).to.eq(400);
      });
    });
  });
  