import React from 'react'
import App from '../../src/App'
import * as cypress from "cypress";

describe('<App />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<App />)
  })
})