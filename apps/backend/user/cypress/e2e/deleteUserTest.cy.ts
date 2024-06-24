describe('Delete User Endpoint', () => {
  const baseUrl = 'http://localhost:8211/api/user';
  
  it('should delete a user successfully', () => {
    cy.request({
      method: 'DELETE',
      url: `${baseUrl}`,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('message', 'User deleted successfully');
    });
  });

  it('should fail to delete a non-existent user', () => {
    cy.request({
      method: 'DELETE',
      url: `${baseUrl}`, // this will run after the first test, so the user will be deleted
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(404);
      expect(response.body).to.have.property('error', 'User not found');
    });
  });
});
