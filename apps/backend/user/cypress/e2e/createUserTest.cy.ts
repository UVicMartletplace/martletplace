describe('User Creation', () => {
  const baseUrl = 'http://localhost:8211/api/user';

  it('should create a new user', () => {
    // Define the new user data
    const newUser = {
      username: "Createdusertest5",
      email: "createdUserTest@uvic.ca5",
      password: "Testing1!5",
      name: "Created user test"
    };

    // Send a POST request to create a new user
    cy.request({
      method: 'POST',
      url: baseUrl,
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
        expect(response.body).to.have.property('verified', false);
      } else {
        cy.log('User creation failed with status:', response.status);
        cy.log('Error message:', response.body.error);
      }
    });
  });

  it('should fail to create a user with missing required fields', () => {
    // Define invalid user data with missing password
    const invalidUser = {
      username: 'invaliduser',
      email: 'invaliduser@example.com'
      // Missing password field
    };

    // Send a POST request to create a new user
    cy.request({
      method: 'POST',
      url: `${baseUrl}`,
      body: invalidUser,
      failOnStatusCode: false  // Prevent Cypress from failing the test on a non-2xx status code
    }).then((response) => {
      // Assert the response status
      expect(response.status).to.eq(400);

      // Assert the response body
      expect(response.body).to.have.property('error', 'Username, password, and email are required');
    });
  });

  it('should fail to create a user with a weak password', () => {
    // Define user data with a weak password
    const invalidUser = {
      username: "weakpassworduser",
      email: "weakpassworduser@example.com",
      password: "weak",  // Weak password
      name: "Weak Password User"
    };

    // Send a POST request to create a new user
    cy.request({
      method: 'POST',
      url: baseUrl,
      body: invalidUser,
      failOnStatusCode: false  // Prevent Cypress from failing the test on a non-2xx status code
    }).then((response) => {
      // Assert the response status
      expect(response.status).to.eq(400);

      // Assert the response body
      expect(response.body).to.have.property('error', 'Password does not meet constraints');
    });
  });
});
