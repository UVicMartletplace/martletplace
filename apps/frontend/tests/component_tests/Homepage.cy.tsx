import Homepage from "../../src/pages/Homepage";
import { MemoryRouter } from "react-router-dom";

describe("<Homepage />", () => {
  const recomendationsObject = [
    {
      listingID: "A23F29039B23",
      sellerID: "A23F29039B23",
      sellerName: "Amy Santiago",
      title: "Used Calculus Textbook",
      description: "No wear and tear, drop-off available.",
      price: 50,
      dateCreated: "2024-05-23T15:30:00Z",
      imageUrl: "https://picsum.photos/200/300",
    },
    {
      listingID: "B34G67039C24",
      sellerID: "B34G67039C24",
      sellerName: "Jake Peralta",
      title: "Advanced Physics Textbook",
      description: "Slightly worn, no markings inside.",
      price: 60,
      dateCreated: "2024-04-15T14:30:00Z",
      imageUrl: "https://picsum.photos/200/301",
    },
  ];
  const listingObjects = {
    listings: [
      {
        listingID: "A23F29039B23",
        sellerID: "A23F29039B23",
        sellerName: "Amy Santiago",
        title: "Used Calculus Textbook",
        description: "No wear and tear, drop-off available.",
        price: 50,
        dateCreated: "2024-05-23T15:30:00Z",
        imageUrl: "https://picsum.photos/200/300",
      },
      {
        listingID: "B34G67039C24",
        sellerID: "B34G67039C24",
        sellerName: "Jake Peralta",
        title: "Advanced Physics Textbook",
        description: "Slightly worn, no markings inside.",
        price: 60,
        dateCreated: "2024-04-15T14:30:00Z",
        imageUrl: "https://picsum.photos/200/301",
      },
      {
        listingID: "C45H89049D25",
        sellerID: "C45H89049D25",
        sellerName: "Rosa Diaz",
        title: "Organic Chemistry Textbook",
        description: "Brand new, still in original packaging.",
        price: 70,
        dateCreated: "2024-03-20T13:30:00Z",
        imageUrl: "https://picsum.photos/200/302",
      },
      {
        listingID: "D56I90159E26",
        sellerID: "D56I90159E26",
        sellerName: "Terry Jeffords",
        title: "Microeconomics Textbook",
        description: "Like new, hardly used.",
        price: 65,
        dateCreated: "2024-02-10T12:30:00Z",
        imageUrl: "https://picsum.photos/200/303",
      },
      {
        listingID: "E67J01269F27",
        sellerID: "E67J01269F27",
        sellerName: "Gina Linetti",
        title: "Introduction to Psychology",
        description: "A few highlights, otherwise perfect.",
        price: 55,
        dateCreated: "2024-01-05T11:30:00Z",
        imageUrl: "https://picsum.photos/200/304",
      },
      {
        listingID: "F78K12379G28",
        sellerID: "F78K12379G28",
        sellerName: "Charles Boyle",
        title: "Anthropology 101 Textbook",
        description: "Some dog-eared pages, but very usable.",
        price: 45,
        dateCreated: "2023-12-15T10:30:00Z",
        imageUrl: "https://picsum.photos/200/305",
      },
    ],
    totalListings: 6,
  };

  const searchObject = {
    query: "",
    minPrice: null,
    maxPrice: null,
    status: "AVAILABLE",
    searchType: "LISTING",
    latitude: 0,
    longitude: 0,
    sort: "RELEVANCE",
    page: 1,
    limit: 6,
  };

  beforeEach(() => {
    cy.intercept("GET", "/api/search*", {
      statusCode: 200,
      body: listingObjects,
    }).as("searchListings");

    cy.intercept("GET", "/api/recomendations*", {
      statusCode: 200,
      body: recomendationsObject,
    }).as("recomendations");

    cy.mount(
      <MemoryRouter>
        <Homepage />
      </MemoryRouter>
    );
    cy.viewport(1800, 720);
  });

  it("renders the Welcome message when no search has been performed", () => {
    cy.contains("Welcome!").should("be.visible");
    cy.contains("Recommended for you").should("be.visible");
  });

  it("renders the Recomendations", () => {
    cy.wait("@recomendations");

    // Verify that listings are displayed
    cy.get(".listing-card").should("have.length", recomendationsObject.length);
  });

  it("renders the SearchBar component", () => {
    cy.contains("MartletPlace").should("be.visible");
    cy.get('input[placeholder="Search"]').should("be.visible");
    cy.contains("Search").should("be.visible");
  });

  it("allows searches to be performed", () => {
    cy.contains("Search").click();

    cy.wait("@searchListings");

    // Verify that listings are displayed
    cy.get(".listing-card").should(
      "have.length",
      listingObjects.listings.length
    );
  });

  // it("sorts listings by Price Ascending", () => {
  //   cy.get("button").contains("Search").click();
  //   cy.wait("@searchListings");
  //   cy.contains("Sort By").should("be.visible");
  // cy.contains("Relevance").click();
  // cy.contains("Price Ascending").should("be.visible");
  // cy.contains("Price Descending").should("be.visible");
  // cy.contains("Relevance").should("be.visible");
  // cy.contains("Listed Time Ascending").should("be.visible");
  // cy.contains("Listed Time Descending").should("be.visible");
  // cy.contains("Distance Ascending").should("be.visible");
  // cy.contains("Distance Descending").should("be.visible");
  // cy.contains("Price Ascending").click();
  // cy.contains("Price Ascending").should("be.visible");
  //});

  // it("Performs a search and displays listings", () => {
  //   cy.get('input[placeholder="Search"]').type("Calculus Textbook{enter}");

  //   cy.wait("@searchListings")
  //     .its("request.body")
  //     .should("deep.equal", searchObject);

  //   // Verify that listings are displayed
  //   cy.get(".listing-card").should(
  //     "have.length",
  //     listingObjects.listings.length
  //   );

  //   // Verify the contents of the first listing
  //   cy.get(".listing-card")
  //     .first()
  //     .within(() => {
  //       cy.get(".listing-title").should(
  //         "contain",
  //         listingObjects.listings[0].title
  //       );
  //       cy.get(".listing-price").should(
  //         "contain",
  //         `$${listingObjects.listings[0].price}`
  //       );
  //       cy.get(".listing-description").should(
  //         "contain",
  //         listingObjects.listings[0].description
  //       );
  //     });
  // });
});
