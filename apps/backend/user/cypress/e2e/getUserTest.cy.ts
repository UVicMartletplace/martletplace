describe('Get Listing by ID Endpoint', () => {
    const baseUrl = 'http://localhost/api/user';
  
    it('should retrieve a user successfully', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/2`, // assuming listing with ID 1 exists
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('user_id', 2);
        expect(response.body).to.have.property('username', 'unverified');
        expect(response.body).to.have.property('email', 'unverified@uvic.ca');
        expect(response.body).to.have.property('name', 'Unverified User');
        expect(response.body).to.have.property('bio', 'Hi! Im an unverified user!');
        expect(response.body).to.have.property('profile_pic_url', 'https://api.dicebear.com/8.x/adventurer/svg?seed=Kiki');
        expect(response.body).to.have.property('verified', false);
        expect(response.body).to.have.property('created_at');
        expect(response.body).to.have.property('modified_at');
      });
    });
  
    it('should fail to retrieve a non-existent user listing', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/9999`, // assuming listing with ID 9999 does not exist
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(404);
        expect(response.body).to.have.property('error', 'User not found');
      });
    });
  });