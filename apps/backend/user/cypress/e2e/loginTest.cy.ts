
describe('Login Endpoint', () => {
  const baseUrl = 'http://localhost:8211/api/user/login';

  it('should fail to log in with invalid email', () => {
    const invalidEmailCredentials = {
      email: "invalid@example.com",
      password: "Password5!"
    };
    
    cy.request({
      method: 'POST',
      url: baseUrl,
      body: invalidEmailCredentials,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body).to.have.property('error', 'Invalid email or password');
    });
  });

  it('should fail to log in with invalid password', () => {
    const invalidPasswordCredentials = {
      email: "user5@example.com",
      password: "WrongPassword!"
    };
    
    cy.request({
      method: 'POST',
      url: baseUrl,
      body: invalidPasswordCredentials,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body).to.have.property('error', 'Invalid email or password');
    });
  });
});
