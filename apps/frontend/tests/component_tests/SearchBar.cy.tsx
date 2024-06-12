import { MemoryRouter, Routes, Route } from "react-router-dom";
import Homepage from "../../src/pages/Homepage";
import Messages from "../../src/pages/Messages";
import Account from "../../src/pages/Account";

describe("<SearchBar />", () => {
  beforeEach(() => {
    cy.mount(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/messages" element={<Messages />} />\
          <Route path="/user" element={<Account />} />
        </Routes>
      </MemoryRouter>
    );
    cy.viewport(1280, 720);
  });
  it("renders the search bar and buttons correctly", () => {
    cy.contains("MartletPlace").should("be.visible");
    cy.get('input[placeholder="Search"]').should("be.visible");
    cy.get("button").contains("Search").should("be.visible");
    cy.get("button").contains("Account").should("be.visible");
    cy.get('button img[alt="Filter Icon"]').should("be.visible");
    cy.get('button img[alt="Message Icon"]').should("be.visible");
  });

  it("should toggle filters visibility on filter button click", () => {
    cy.get('button img[alt="Filter Icon"]').click();
    cy.contains("Filters").should("be.visible");
    cy.get('button img[alt="Filter Icon"]').click();
    cy.contains("Filters").should("not.exist");
  });

  it("should update search input value on typing", () => {
    cy.get('input[placeholder="Search"]').type("Test Search");
    cy.get('input[placeholder="Search"]').should("have.value", "Test Search");
  });

  it("should open menu on hamburger button click and navigate", () => {
    cy.viewport(700, 720); // Adjust viewport to make hamburger menu visible
    cy.get("button").contains("=").click();
    cy.contains("My Profile").should("be.visible");
    cy.contains("My Listing").should("be.visible");
    cy.contains("Messaging").should("be.visible");
  });
});
