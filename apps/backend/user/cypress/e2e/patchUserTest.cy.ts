describe('Update User Endpoint', () => {
  const baseUrl = 'http://localhost:8211/api/user';
  
  it('should update a user successfully', () => {
    cy.request({
      method: 'PATCH',
      url: `${baseUrl}`,
      body: {
        username: "PatchedUserTest",
        password: "NewPassword1!",
        name: "Patched user test",
        bio: "Hi! Im a patched user!",
        profilePictureUrl: "https://api.dicebear.com/8.x/adventurer/svg?seed=Jasper",
        verified: true
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.user).to.have.property('id', 3);
      expect(response.body.user).to.have.property('username', 'PatchedUserTest');
      expect(response.body.user).to.have.property('email', 'user3@example.com');
      expect(response.body.user).to.have.property('name', 'Patched user test');
      expect(response.body.user).to.have.property('bio', 'Hi! Im a patched user!');
      expect(response.body.user).to.have.property('profileUrl', 'https://api.dicebear.com/8.x/adventurer/svg?seed=Jasper');
    });
  });

  it('should fail to update with a duplicated username', () => {
    cy.request({
      method: 'PATCH',
      url: `${baseUrl}`,
      body: {
        username: "user4",
        password: "NewPassword1!",
        name: "Patched user test",
        bio: "Hi! Im a patched user!",
        profilePictureUrl: "https://api.dicebear.com/8.x/adventurer/svg?seed=Jasper",
        verified: true
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body).to.have.property('error', 'Username already exists');
    });
  });
});
