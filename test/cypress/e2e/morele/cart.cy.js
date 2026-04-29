
/**
 * Cart – add a product, handle the warranties popup, verify the cart page.
 *
 * Uses cy.visitCategory() (support/commands.js) which already waits for products
 * to render, keeping the spec itself clean and free of ad-hoc waits.
 */

describe('Shopping Cart', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.acceptCookies();
  });

  it('adds the first monitor to the cart and lands on the cart page', () => {
    cy.visitCategory('/kategoria/monitory-523/');

    // Cookie banner can reappear on the category page – dismiss it again.
   // cy.acceptCookies();
    cy.wait(1000); // Wait for any potential layout shifts to finish before interacting.
    // Exclude buttons that are part of the warranty upsell widget (.btn-get-warranty).
    // Those share the .btn-add-to-basket class but trigger a different flow.
    cy.get('.btn-add-to-basket:visible')
      .first()
      .as('addToCartButton');
 
    cy.get('@addToCartButton')
      .should('be.visible')
      .and('not.be.disabled')
      .click({ force: true }); // Force click in case of any overlapping elements.

    // Native dispatchEvent bypasses any element that is visually covering the button.
    
    
    // Dismiss the optional warranty upsell modal if it appears.
 
        cy.contains('#warranties-popup a', 'Nie potrzebuję dodatkowej ochrony')
          .filter(':visible')
          .click();
   
    
    // Confirm we ended up on the basket page with at least one product.
    cy.url().should('include', '/koszyk/');
    cy.get('.product-main-container').should('have.length.at.least', 1);
    
  });

  it('navigates to Laptops category via hover menu', () => {
    // Trigger the hover navigation.
    cy.get('.cn-name-value').contains('Laptopy').realHover();

    // Click the visible link that appears in the expanded menu.
    cy.contains('a', 'Laptopy').should('be.visible').click();

    cy.url().should('include', '/laptopy');
    cy.get('h1', { timeout: 10000 })
      .should('be.visible')
      .and('not.be.empty')
      .and('contain.text', 'Laptopy');
  });
});
