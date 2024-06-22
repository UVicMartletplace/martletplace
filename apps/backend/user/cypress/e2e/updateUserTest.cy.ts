describe('Update User Endpoint', () => {
    const baseUrl = 'http://localhost/api/user';
  
    it('should update a user successfully', () => {
      cy.request({
        method: 'PATCH',
        url: `${baseUrl}/5`, // assuming listing with ID 1 exists
        body: {
            user: {
                username: "Patched User Test",
                email: "patchedUserTest@uvic.ca",
                name: "Patched user test",
                bio: "Hi! Im a patched user!",
                profile_pic_url: "https://api.dicebear.com/8.x/adventurer/svg?seed=Jasper"
            },
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.updated_user).to.have.property('user_id', 5);
        expect(response.body.updated_user).to.have.property('username', 'Patched User Test');
        expect(response.body.updated_user).to.have.property('email', 'patchedUserTest@uvic.ca');
        expect(response.body.updated_user).to.have.property('name', 'Patched user test');
        expect(response.body.updated_user).to.have.property('bio', 'Hi! Im a patched user!');
        expect(response.body.updated_user).to.have.property('profile_pic_url', 'https://api.dicebear.com/8.x/adventurer/svg?seed=Jasper');
        expect(response.body.updated_user).to.have.property('verified', true);
        expect(response.body.updated_user).to.have.property('created_at');
        expect(response.body.updated_user).to.have.property('modified_at');
      });
    });
  
    it('should fail to update a non-existent listing', () => {
      cy.request({
        method: 'PATCH',
        url: `${baseUrl}/9999`, // assuming listing with ID 9999 does not exist
        body: {
            user: {
                username: "Patched User Test",
                email: "patchedUserTest@uvic.ca",
                name: "Patched user test",
                bio: "Hi! Im a patched user!",
                profile_pic_url: "https://api.dicebear.com/8.x/adventurer/svg?seed=Jasper"
            },
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('error', 'Existing user not found');
      });
    });
  });