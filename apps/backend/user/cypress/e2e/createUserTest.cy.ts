describe('User Creation', () => {
    const baseUrl = 'http://localhost:8211/api/user';

    it('should create a new user', () => {
      // Define the new user data
      const newUser = {
        user: {
          username: "Created user test5",
          email: "createdUserTest@uvic.ca5",
          password: "Testing1!5",
          name: "Created user test",
          bio: "Hi! Im a verified user!",
          profile_pic_url: "https://api.dicebear.com/8.x/adventurer/svg?seed=Jasper"
        }
      };
  
      // Send a POST request to create a new user
      cy.request('POST', baseUrl, newUser)
        .then((response) => {
          // Assert the response status
          expect(response.status).to.eq(201);
          
          // Assert the response body
          expect(response.body).to.have.property('username', newUser.user.username);
          // expect(response.body).to.have.property('email', newUser.email);
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
        body: {
          user: { ...invalidUser}
        },
        failOnStatusCode: false  // Prevent Cypress from failing the test on a non-2xx status code
      }).then((response) => {
        // Assert the response status
        expect(response.status).to.eq(400);
        
        // Assert the response body
        expect(response.body).to.have.property('error', 'Username, password, and email are required');
      });
    });
  });