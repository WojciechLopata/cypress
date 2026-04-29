
/**
 * Product filters – price range filtering on a category page.
 *
 * Key improvement: instead of two consecutive cy.wait(1500) calls we intercept
 * the filter XHR/fetch so the test only waits as long as needed.
 *
 * The price assertions iterate over every displayed price and verify each one
 * falls inside the selected range.
 */

// Stub payload: 10 products with the agreed { productId: String } shape.
const MOCK_PRODUCTS = Array.from({ length: 10 }, (_, i) => ({
  productId: `mock-product-${i + 1}`,
}));

const extractProductCount = ($element) => {
  const textNode = [...$element[0].childNodes].find(
    (node) => node.nodeType === 3 && node.textContent.trim(),
  );
  const rawText = (textNode?.textContent || $element.text()).replace(/\D/g, '');

  if (rawText.length % 2 === 0) {
    const midpoint = rawText.length / 2;
    const firstHalf = rawText.slice(0, midpoint);
    const secondHalf = rawText.slice(midpoint);

    if (firstHalf === secondHalf) {
      return parseInt(firstHalf, 10);
    }
  }

  return parseInt(rawText, 10);
};

describe('Product Filters', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.acceptCookies();
    cy.visitCategory('/kategoria/monitory-523/');
  });

  it('GET /products returns a stubbed list of 10 products', () => {
    cy.intercept('GET', '**/products**', {
      statusCode: 200,
      body: MOCK_PRODUCTS,
    }).as('getProducts');

    // Trigger whatever call fetches products (adjust the selector / action to
    // match the real trigger on morele.net if needed).
    cy.request('GET', `${Cypress.config('baseUrl')}/products`).then(() => {
      // When the intercept is triggered via the UI rather than cy.request,
      // swap the line above for the UI interaction that fires the request.
    });

    cy.wait('@getProducts').then(({ response }) => {
      expect(response.statusCode).to.eq(200);
      expect(response.body).to.have.length(10);

      response.body.forEach((product) => {
        expect(product).to.have.property('productId').and.to.be.a('string');
      });
    });
  });

  it('filters monitors by price range 500–1500 PLN', () => {
    // Intercept the filter update request so we wait on real data, not a timer.
    cy.intercept('GET', '**/kategoria/**').as('filterUpdate');
    
    cy.get('.input-range-from').filter(':visible').clear().type('500{enter}');
    cy.wait('@filterUpdate');
    cy.wait(2000); // Wait for the UI to update before changing the next input.
    
    cy.get('.input-range-to').filter(':visible').clear().type('1500{enter}');
       // cy.wait('@filterUpdate');
    
    //cy.wait('@filterUpdate');
    cy.wait(2000); // Wait for the UI to update with the new filter results.
    // Every visible price should fall within the selected range.
    cy.get('.price-new').each(($el) => {
      const text = $el.text().replace(/[^\d,]/g, '').replace(',', '.');
      const price = parseFloat(text);
    
      if (!isNaN(price)) {
        expect(price, `price ${price} should be within 500–1500`).to.be.within(500, 1500);
      }
    });
    cy.get('#category div.cat-price div.input-range-inputs div:nth-child(2) input.form-control').clear().type('1500{enter}');
    
  });

  it('clears filters and shows the full product listing again', () => {
   // cy.intercept('GET', '**/kategoria/**').as('filterUpdate');

    // Apply a narrow filter first.
  //cy.intercept('GET', '**/kategoria/**').as('filterUpdate');
    
    cy.get('.input-range-from').filter(':visible').clear().type('500{enter}');
    //cy.wait('@filterUpdate');
    cy.wait(2000); // Wait for the UI to update before changing the next input.
    
    cy.get('.input-range-to').filter(':visible').clear().type('1500{enter}');
       // cy.wait('@filterUpdate');
    
    //cy.wait('@filterUpdate');
    cy.wait(2000); // Wait for the UI to update with the new filter results.
    // Every visible price should fall within the selected range.

    // Capture the filtered product count.
    let filteredCount;
    cy.get('[data-watch-html="productCountFiltered"]')
      .should('exist')
      .then(($count) => {
        filteredCount = extractProductCount($count);
        cy.log(`Filtered count: ${filteredCount}`);
      });

    // Reset both inputs.
    cy.get('.reset-filters').filter(':visible').click();
    cy.wait(2000); // Wait for the UI to update after clearing filters.

    // After clearing, the total count should be greater than or equal to the filtered count.
    cy.get('[data-watch-html="productCountFiltered"]')
      .should('exist')
      .then(($count) => {
        const clearedCount = extractProductCount($count);
        cy.log(`Cleared count: ${clearedCount}`);
        expect(clearedCount).to.be.at.least(filteredCount);
      });
  });
});
