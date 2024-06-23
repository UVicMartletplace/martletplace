describe('Delete Review Endpoint', () => {
    const baseUrl = 'http://localhost:8213/api/review';
      
    it('should delete a review successfully', () => {
      cy.request({
        method: 'DELETE',
        url: `${baseUrl}/5`, // assuming review with ID 5 exists
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('message', 'Review deleted successfully');
      });
    });
  
    it('should fail to delete a non-existent review', () => {
      cy.request({
        method: 'DELETE',
        url: `${baseUrl}/9999`, // assuming review with ID 9999 does not exist
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(404);
        expect(response.body).to.have.property('error', 'Review not found');
      });
    });
  });
  