describe('Confirm Email Endpoint', () => {
  const baseUrl = 'http://localhost/api/user/confirm-email';
  
  it('should confirm the email successfully', () => {
    const userId = 2;

    cy.request({
      method: 'POST',
      url: baseUrl,
      headers: {
        Authorization: `Bearer dummy-token`,
      },
      body: {
        userId: userId
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('message', 'Email verified');
    });
  });
});
