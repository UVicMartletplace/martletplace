import ViewListing from "../../src/pages/ViewListing.tsx";
import {MemoryRouter, Route, Routes} from "react-router-dom";
import Messages from "../../src/pages/Messages.tsx";




describe('<ViewListing/>', () => {
  beforeEach(() => {
    const listingObject = {
      title: "Genuine Unicorn Tears - Guaranteed to Add Sparkle to Your Life!",
      description: "Are you tired of mundane tears? Try our premium unicorn tears sourced straight from the enchanted forest of Eldoria! Each tear is carefully harvested under the light of a full moon and comes with a certificate of authenticity. Sprinkle them on your morning cereal for an extra magical start to your day!",
      price: 20000,
      seller_profile: {"name": "Merlin the Wizard"},
      dateCreated: "1980-05-24T15:30:00Z",
      distance: 420.1,
      images: [
          {url: "https://picsum.photos/200/300"},
          {url: "https://picsum.photos/200/400"},
          {url: "https://picsum.photos/200/300"},
          {url: "https://picsum.photos/200/230"},
          {url: "https://picsum.photos/200/100"}
      ]
    };
    // Mock axios response
    cy.intercept('GET', '/api/listing/1', {
      statusCode: 200,
      body: listingObject,
    }).as("getListing");
    // Mount the component
    cy.mount(
      <MemoryRouter initialEntries={[`/listing/view/1`]}>
        <Routes>
          <Route path="/listing/view/:id" element={<ViewListing />} />
          <Route path="/messages" element={<Messages />} />
        </Routes>
      </MemoryRouter>
    );

  })
  it("should render the listing details correctly", () => {

    // Assertions to verify the rendered content
    cy.contains("Genuine Unicorn Tears - Guaranteed to Add Sparkle to Your Life!").should("be.visible");
    cy.contains("Are you tired of mundane tears? Try our premium unicorn tears sourced straight from the enchanted forest of Eldoria!").should("be.visible");
    cy.contains("Price: $20,000.00").should("be.visible");
    cy.contains("Sold by: Merlin the Wizard").should("be.visible");
    cy.contains("Posted on: Sat May 24 1980").should("be.visible");
    cy.contains("Message Seller").should("be.visible");
    cy.get("img").should("have.length", 5);
  });


  it("should increment the image and change the visibility", () => {
    // Mount the component
    cy.get("img").should("have.length", 5);
    for (let x = 1; x<5; x++){

      cy.get("#carousel_index").should("have.text", x.toString())
      cy.get("#carousel_right").click()
      cy.get("img").eq(x).should("be.visible")
    }

    for (let x = 5; x>1; x--){
      cy.get("#carousel_index").should("have.text", x.toString())
      cy.get("img").eq(x-1).should("be.visible")
      cy.get("#carousel_left").click()

    }
  })

  it("should navigate to messages", () => {
    cy.get("#message_button").click();
    cy.contains("Messages").should("be.visible");
  })
});