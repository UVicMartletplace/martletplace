import Filters from "../../src/components/filters";
import { mount } from "cypress/react";

describe("<Filters />", () => {
  let onFilterChangeStub: any;
  const mountFilters = () => {
    mount(<Filters onFilterChange={onFilterChangeStub} />);
  };

  beforeEach(() => {
    onFilterChangeStub = cy.stub().as("onFilterChangeStub");
    mountFilters();
  });

  it("renders the filter fields and buttons correctly", () => {
    cy.contains("Filters").should("be.visible");
    cy.get('input[placeholder="Min"]').should("be.visible");
    cy.get('input[placeholder="Max"]').should("be.visible");
    cy.get("#status-select").should("have.value", "");
    cy.get("#type-select").should("have.value", "");
    cy.contains("Update Location").should("be.visible");
    cy.contains("Apply Filters").should("be.visible");
    cy.contains("Clear Filter").should("be.visible");
  });

  it("should update min and max price on input", () => {
    cy.get('input[placeholder="Min"]').type("100").should("have.value", "100");
    cy.get('input[placeholder="Max"]').type("500").should("have.value", "500");
  });

  it("should update status and type on selection", () => {
    cy.get("#status-select").click();
    cy.contains("Available").click();
    cy.contains("Available").should("be.visible");

    cy.get("#type-select").click();
    cy.contains("User").click();
    cy.contains("User").should("be.visible");
  });

  it("should call onFilterChange with correct filters on Apply Filters click", () => {
    cy.get('input[placeholder="Min"]').type("100");
    cy.get('input[placeholder="Max"]').type("500");
    cy.get("#status-select").click();
    cy.contains("Available").click();
    cy.get("#type-select").click();
    cy.contains("User").click();

    cy.contains("Apply Filters").click();
    cy.get("@onFilterChangeStub").should("have.been.calledWith", {
      minPrice: 100,
      maxPrice: 500,
      status: "AVAILABLE",
      searchType: "USER",
    });
  });

  it("should reset all filters on Clear Filter click", () => {
    cy.get('input[placeholder="Min"]').type("100");
    cy.get('input[placeholder="Max"]').type("500");
    cy.get("#status-select").click();
    cy.contains("Available").click();
    cy.get("#type-select").click();
    cy.contains("User").click();

    cy.contains("Clear Filter").click();
    cy.get('input[placeholder="Min"]').should("have.value", "");
    cy.get('input[placeholder="Max"]').should("have.value", "");
    cy.get("#status-select").should("have.value", "");
    cy.get("#type-select").should("have.value", "");

    cy.get("@onFilterChangeStub").should("have.been.calledWith", {
      minPrice: 0,
      maxPrice: 100000,
      status: "",
      searchType: "",
    });
  });

  it("should handle non-numeric values gracefully in price fields", () => {
    cy.get('input[placeholder="Min"]').type("abc").should("have.value", "");
    cy.get('input[placeholder="Max"]').type("xyz").should("have.value", "");
  });

  it("should handle edge case where min price is greater than max price", () => {
    cy.get('input[placeholder="Min"]').type("500");
    cy.get('input[placeholder="Max"]').type("100");
    cy.contains("Apply Filters").click();
    cy.get("@onFilterChangeStub").should("have.been.calledWith", {
      minPrice: 500,
      maxPrice: 100,
      status: "",
      searchType: "LISTING",
    });
  });

  it("should adjust layout correctly for different screen sizes", () => {
    cy.viewport(850, 720);
    cy.get('input[placeholder="Min"]').should("be.visible");
    cy.get('input[placeholder="Max"]').should("be.visible");
    cy.get("#status-select").should("be.visible");
    cy.get("#type-select").should("be.visible");
    cy.contains("Update Location").should("be.visible");
    cy.contains("Apply Filters").should("be.visible");
    cy.contains("Clear Filter").should("be.visible");

    cy.viewport(600, 720);
    cy.get('input[placeholder="Min"]').should("be.visible");
    cy.get('input[placeholder="Max"]').should("be.visible");
    cy.get("#status-select").should("be.visible");
    cy.get("#type-select").should("be.visible");
    cy.contains("Update Location").should("be.visible");
    cy.contains("Apply Filters").should("be.visible");
    cy.contains("Clear Filter").should("be.visible");
  });
});
