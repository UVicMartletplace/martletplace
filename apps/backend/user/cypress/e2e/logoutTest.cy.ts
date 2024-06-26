describe('Logout Endpoint', () => {
    const baseUrl = 'http://localhost/api/user/logout';
    
    it('should log out a user successfully', () => {
      cy.request({
        method: 'POST',
        url: baseUrl,
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('message', 'Logged out');
      });
    });
  });
  