describe('Get Review by ID Endpoint', () => {
    const baseUrl = 'http://localhost:8213/api/reviews';
      
    it('should retrieve a review successfully', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/1`, // assuming review with ID 1 exists
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('listing_review_id', '1');
        expect(response.body).to.have.property('reviewerName', 'User');
        expect(response.body).to.have.property('stars', 5);
        expect(response.body).to.have.property('comment', 'Great seller, the item was exactly as described and in perfect condition.');
        expect(response.body).to.have.property('userID', '1');
        expect(response.body).to.have.property('listingID', '1');
        expect(response.body).to.have.property('dateCreated');
        expect(response.body).to.have.property('dateModified');
      });
    });
  
    it('should fail to retrieve a non-existent review', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/9999`, // assuming review with ID 9999 does not exist
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(404);
        expect(response.body).to.have.property('error', 'Review not found');
      });
    });
  });
  