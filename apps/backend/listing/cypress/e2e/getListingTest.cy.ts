describe('API Listing Tests', () => {
  it('should retrieve a listing by id', () => {
    cy.request('/api/listing/1')
      .should((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('listing_id', 1);
      });
  });

  it('should return a 404 for a non-existent listing', () => {
    cy.request({
      method: 'GET',
      url: '/api/listing/9999',
      failOnStatusCode: false
    })
    .should((response) => {
      expect(response.status).to.eq(404);
    });
  });
});
