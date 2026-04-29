// =============================================================
// Custom Cypress commands for morele.net tests
// =============================================================

/**
 * Accept the cookie-consent banner.
 * Safe to call even if the banner is not present (e.g. already accepted).
 */
Cypress.Commands.add('acceptCookies', () => {
  const directSelectors = [
    '#onetrust-accept-btn-handler',
    'button[aria-label*="Akcept"]',
    'button[id*="accept"]',
    'button[class*="accept"]',
    'button[class*="cookie"]',
    'a[class*="cookie"]',
  ];

  const consentText = /(akcept|zaakcept|zgadzam|accept|allow all)/i;

  const findConsentElement = ($body) => {
    for (const selector of directSelectors) {
      const match = $body.find(selector).filter(':visible').first();
      if (match.length) {
        return match;
      }
    }

    const textCandidates = $body
      .find('button, a, [role="button"], input[type="button"], input[type="submit"]')
      .filter(':visible')
      .filter((_, element) => {
        const text = Cypress.$(element).text().trim();
        const value = Cypress.$(element).val();
        return consentText.test(text || String(value || ''));
      })
      .first();

    return textCandidates;
  };

  const tryAccept = (retriesLeft = 8) => {
    cy.get('body').then(($body) => {
      const consentElement = findConsentElement($body);

      if (consentElement && consentElement.length) {
        cy.wrap(consentElement).click({ force: true });
        return;
      }

      if (retriesLeft > 0) {
        cy.wait(500, { log: false }).then(() => tryAccept(retriesLeft - 1));
      }
    });
  };

  // Banner often appears after async scripts load, so probe for a few seconds.
  tryAccept();
});

/**
 * Log in via the UI and cache the session so subsequent tests skip the login flow.
 * Credentials fall back to cypress.config.js env values.
 *
 * Usage:
 *   cy.login()                               // use env defaults
 *   cy.login('other@email.com', 'pass123')   // explicit credentials
 */
Cypress.Commands.add('login', (email, password) => {
  return cy.env(['testEmail', 'testPassword']).then((envVars) => {
    const resolvedEmail = email || envVars.testEmail;
    const resolvedPassword = password || envVars.testPassword;

    if (!resolvedEmail || !resolvedPassword) {
      throw new Error(
        [
          'Missing login credentials for `cy.login()`.',
          'Set them in `cypress.config.js` under `env.testEmail` and `env.testPassword`,',
          'or call `cy.login("your-email@example.com", "your-password")` directly.',
        ].join(' '),
      );
    }

    cy.session(
      [resolvedEmail],
      () => {
        cy.visit('/');
        cy.acceptCookies();
        cy.contains('Zaloguj się').click();
        cy.url().should('include', '/login');
        cy.get('input[name="_username"]').type(resolvedEmail);
        cy.get('input[name="_password"]').type(resolvedPassword, { log: false });
        cy.get('input[name="_remember_me"]').check();
        cy.get('button[type="submit"]').filter(':visible').click();
        cy.url().should('equal', `${Cypress.config('baseUrl')}/`);
      },
      {
        validate() {
          // Re-use session only when the user control element is present.
          cy.visit('/');
          cy.get('.h-user-control').should('contain.text', 'Witaj');
        },
      },
    );
  });
});

/**
 * Visit a category page and wait for it to fully render.
 *
 * @param {string} path – relative path, e.g. '/kategoria/monitory-523/'
 */
Cypress.Commands.add('visitCategory', (path) => {
  cy.intercept('GET', `**${path}**`).as('categoryPage');
  cy.visit(path);
  cy.wait('@categoryPage');
  cy.get('.cat-product', { timeout: 15000 }).should('have.length.at.least', 1);
});