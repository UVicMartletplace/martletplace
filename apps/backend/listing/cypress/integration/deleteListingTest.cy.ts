describe('Delete Listing Endpoint', () => {

  it('should delete a listing successfully', () => {
    cy.request({
      method: 'DELETE',
      url: '/api/listing/3', // assuming listing with ID 3 exists
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('message', 'Listing deleted successfully');
    });
  });

  it('should fail to delete a non-existent listing', () => {
    cy.request({
      method: 'DELETE',
      url: '/api/listing/9999', // assuming listing with ID 9999 does not exist
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(404);
      expect(response.body).to.have.property('error', 'Listing not found');
    });
  });
});
