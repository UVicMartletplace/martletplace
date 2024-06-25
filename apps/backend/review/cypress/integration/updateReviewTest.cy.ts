describe('Update Review Endpoint', () => {
      
    it('should update a review successfully', () => {
      cy.request({
        method: 'PATCH',
        url: '/api/review/1', // assuming review with ID 1 exists
        body: {
          stars: 4,
          comment: 'Updated comment: Great seller, but the item had a minor issue.',
          listingID: '1'
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });
  
    it('should fail to update a non-existent review', () => {
      cy.request({
        method: 'PATCH',
        url: '/api/review/9999', // assuming review with ID 9999 does not exist
        body: {
          listing_rating_id: '9999',
          stars: 4,
          comment: 'Updated comment: This review does not exist.',
          listingID: '9999'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(404);
        expect(response.body).to.have.property('error', 'Review not found');
      });
    });
  
    it('should fail to update a review with missing parameters', () => {
      cy.request({
        method: 'PATCH',
        url: '/api/review/1', // assuming review with ID 1 exists
        body: {
          stars: 4,
          comment: 'Updated comment: Missing listingID parameter.',
          // missing listingID
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('error', 'missing parameter in request');
      });
    });
  });
  