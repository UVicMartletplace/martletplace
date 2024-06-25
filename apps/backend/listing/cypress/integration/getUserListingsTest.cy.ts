describe('Get Listings by User Endpoint', () => {  
    it('should retrieve all listings for the authenticated user successfully', () => {
      cy.request({
        method: 'GET',
        url: '/api/listings' // as auth not functioning, assumes id of 1.
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array').with.length.greaterThan(0);
  
        response.body.forEach(listing => {
          expect(listing).to.have.property('listingID');
          expect(listing).to.have.property('title');
          expect(listing).to.have.property('description');
          expect(listing).to.have.property('price');
          expect(listing).to.have.property('location');
          expect(listing).to.have.property('status');
          expect(listing).to.have.property('dateCreated');
          expect(listing).to.have.property('dateModified');
          expect(listing.images).to.be.an('array');
  
          listing.images.forEach(image => {
            expect(image).to.have.property('url');
          });
        });
      });
    });
  });
  