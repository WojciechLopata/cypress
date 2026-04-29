
/**
 * Search – keyword search returns relevant results.
 *
 * cy.intercept() is used to gate on the actual network response instead of
 * arbitrary cy.wait(ms) calls, which makes tests faster and more reliable.
 */

describe('Product Search', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.acceptCookies();
  });

  it('shows results containing the search term', () => {
    const searchTerm = 'RTX 4080';

    // Gate on the search results page loading.
    cy.intercept('GET', '**/wyszukiwarka/**').as('searchResults');

    cy.get('.form-control').first().type(`${searchTerm}{enter}`);

    cy.wait('@searchResults');
    cy.url().should('include', 'wyszukiwarka');

    // At least the first result should mention the GPU series.
    cy.get('.cat-product-name')
      .first()
      .should('be.visible')
      .and('contain.text', 'RTX');
  });

  it('displays multiple results for a broad search term', () => {
    cy.intercept('GET', '**/wyszukiwarka/**').as('searchResults');

    cy.get('.form-control').first().type('laptop{enter}');

    cy.wait('@searchResults');
    cy.get('.cat-product-name').should('have.length.at.least', 5);
  });

  it('reflects the search term in the page URL', () => {
    const term = 'klawiatura mechaniczna';

    cy.intercept('GET', '**/wyszukiwarka/**').as('searchResults');
    cy.get('.form-control').first().type(`${term}{enter}`);

    cy.wait('@searchResults');
    cy.url().should('include', encodeURIComponent(term).toLowerCase().replace(/%20/g, '+'));
  });
});
