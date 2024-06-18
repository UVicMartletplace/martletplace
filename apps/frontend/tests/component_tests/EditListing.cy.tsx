import React from 'react'
import EditListing from '../../src/pages/EditListing'

describe('<EditListing />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<EditListing />)
  })
})