
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

  it('should fail to log in with invalid totp code', () => {
    const newUser = {
      username: "Createdusertest6",
      email: "createdUserTest@uvic.ca6",
      password: "Testing1!6",
      name: "MFA test user"
    };

    // Send a POST request to create a new user with totp token
    cy.request({
      method: 'POST',
      url: 'http://localhost:8211/api/user/',
      body: newUser,
      failOnStatusCode: false  // Prevent Cypress from failing the test on a non-2xx status code
    }).then((response) => {
      // Assert the response status
      if (response.status === 201) {
        expect(response.status).to.eq(201);

        // Assert the response body
        expect(response.body).to.have.property('username', newUser.username);
        expect(response.body).to.have.property('email', newUser.email);
        expect(response.body).to.have.property('name', newUser.name);
        expect(response.body).to.have.property('totp_secret');
      } else {
        cy.log('User creation failed with status:', response.status);
        cy.log('Error message:', response.body.error);
      }
    });

    const invalidtotpCredentials = {
      email: "createdUserTest@uvic.ca6",
      password: "Testing1!6",
      totp_code: "1010101"
    };
    
    cy.request({
      method: 'POST',
      url: baseUrl,
      body: invalidtotpCredentials,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body).to.have.property('error', 'Invalid token, authentication failed');
    });
  });
});

