describe('Create Reviews Endpoint', () => {
  const baseUrl = 'http://localhost:8213/api/reviews';

  it('should create a new review successfully', () => {
    cy.request({
      method: 'POST',
      url: baseUrl,
      body: {
        listing_rating_id: '1',
        stars: 5,
        comment: 'Great seller, the item was exactly as described and in perfect condition.',
        listingID: '1'
      }
    }).then((response) => {
      expect(response.status).to.eq(201);
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

  it('should fail to create a new review with missing parameters', () => {
    cy.request({
      method: 'POST',
      url: baseUrl,
      body: {
        listing_rating_id: '1',
        stars: 5,
        comment: 'Great seller, the item was exactly as described and in perfect condition.'
        // missing listingID
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body).to.have.property('error', 'missing parameter in request');
    });
  });
});
