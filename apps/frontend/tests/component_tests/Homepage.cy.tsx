import { mount } from "cypress/react";
import Homepage from "../../src/pages/Homepage";
import { BrowserRouter as Router } from "react-router-dom";

describe("<Homepage />", () => {
  beforeEach(() => {
    mount(
      <Router>
        <Homepage />
      </Router>
    );
    cy.viewport(1280, 720);
  });

  it("renders the Welcome message when no search has been performed", () => {
    cy.contains("Welcome!").should("be.visible");
    cy.contains("Recommended for you").should("be.visible");
  });

  it("renders the SearchBar component", () => {
    cy.contains("MartletPlace").should("be.visible");
    cy.get('input[placeholder="Search"]').should("be.visible");
    cy.get("button").contains("Search").should("be.visible");
  });

  it("sorts listings by relevance", () => {
    cy.contains("Search").click();
    cy.contains("Sort By").click();
    cy.contains("Price Ascending").should("be.visible");
    cy.contains("Price Descending").should("be.visible");
    cy.contains("Relevance").should("be.visible");
    cy.contains("Listed Time Ascending").should("be.visible");
    cy.contains("Listed Time Descending").should("be.visible");
    cy.contains("Distance Ascending").should("be.visible");
    cy.contains("Distance Descending").should("be.visible");
    cy.contains("Relevance").click();
    cy.contains("Relevance").should("be.visible");
  });
});
