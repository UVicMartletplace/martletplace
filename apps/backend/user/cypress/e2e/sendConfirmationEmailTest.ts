describe('Send Confirmation Email Endpoint', () => {
  const baseUrl = 'http://localhost/api/user/send-confirmation-email';
  
  it('should send a confirmation email successfully', () => {
    const email = 'test@example.com';

    cy.request({
      method: 'POST',
      url: baseUrl,
      body: {
        email: email,
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('message', 'Verification email sent');
    });
  });

  it('should fail to send confirmation email without an email address', () => {
    cy.request({
      method: 'POST',
      url: baseUrl,
      body: {},
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body).to.have.property('error', 'Email is required');
    });
  });
});
