import { TodoListPage } from '../support/todo-list.po';

const page = new TodoListPage();

describe('Todo list', () => {

  before(() => {
    cy.task('seed:database');
  });

  beforeEach(() => {
    page.navigateTo();
  });

  it('Should have the correct title', () => {
    page.getTodoTitle().should('have.text', 'Todos');
  });

  it('Should show 300 todos in both card and list view', () => {
    page.getTodoCards().should('have.length', 300);
    page.changeView('list');
    page.getTodoListItems().should('have.length', 300);
  });

  it('Should type something in the name filter and check that it returned correct elements', () => {
    // Filter for owner 'Lynn Ferguson'
    cy.get('[data-test=todoOwnerInput]').type('Blanche');

    // All of the user cards should have the name we are filtering by
    page.getTodoCards().each(e => {
      cy.wrap(e).find('.todo-card-owner').should('have.text', 'Blanche');
    });

    // (We check this two ways to show multiple ways to check this)
    page.getTodoCards().find('.todo-card-owner').each(el =>
      expect(el.text()).to.equal('Blanche')
    );
  });

  it('Should type something in the body filter and check that it returned correct elements', () => {
    // Filter for body'
    cy.get('[data-test=todoBodyInput]')
    .type('In sunt ex non tempor cillum commodo amet incididunt anim qui commodo quis. Cillum non labore ex sint esse.');

    page.getTodoCards().should('have.lengthOf.above', 0);

    // All of the todos should have the body we are filtering by;
  });

  it('Should type something partial in the body filter and check that it returned correct elements', () => {
    // Filter for companies that contain 'ti'
    cy.get('[data-test=todoBodyInput]').type('In');

    page.getTodoCards().should('have.lengthOf', 242);

  });

  it('Should type something in the category filter and check that it returned correct elements', () => {
    // Filter for users of age '27'
    cy.get('[data-test=todoCategoryInput]').type('Video Games');

    page.getTodoCards().should('have.lengthOf', 71);

    // Go through each of the cards that are being shown and get the names
    page.getTodoCards().find('.todo-card-owner')
      // We should see these users whose age is 27
      .should('contain.text', 'Barry')
      .should('contain.text', 'Blanche')
      .should('contain.text', 'Dawn')
      // We shouldn't see these users
      .should('not.contain.text', 'Connie Stewart')
      .should('not.contain.text', 'Lynn Ferguson');
  });

  it('Should change the view', () => {
    // Choose the view type "List"
    page.changeView('list');

    // We should not see any cards
    // There should be list items
    page.getTodoCards().should('not.exist');
    page.getTodoListItems().should('exist');

    // Choose the view type "Card"
    page.changeView('card');

    // There should be cards
    // We should not see any list items
    page.getTodoCards().should('exist');
    page.getTodoListItems().should('not.exist');
  });

  it('Should filter by category, switch the view, and check that it returned correct elements', () => {
    // Filter for todo category 'video games');
    cy.get('[data-test=todoCategoryInput]').type('Video Games');

    // Choose the view type "List"
    page.changeView('list');

    // Some of the todos should be listed
    page.getTodoListItems().should('have.lengthOf.above', 0);

    // All of the user list items that show should have the role we are looking for
    page.getTodoListItems().each(el => {
      cy.wrap(el).find('.todo-list-category').should('contain', 'video');
    });
  });

  it('Should click view profile on a todo and go to the right URL', () => {
    page.getTodoCards().first().then((card) => {
      const firstTodoOwner = card.find('.todo-card-owner').text();


      // When the view profile button on the first user card is clicked, the URL should have a valid mongo ID
      page.clickViewProfile(page.getTodoCards().first());

      // The URL should be '/users/' followed by a mongo ID
      cy.url().should('match', /\/todos\/[0-9a-fA-F]{24}$/);

      // On this profile page we were sent to, the owner and company should be correct
      cy.get('.todo-card-owner').first().should('have.text', firstTodoOwner);

    });
   });

  it('Should click add todo and go to the right URL', () => {
    // Click on the button for adding a new user
    page.addTodoButton().click();

    // The URL should end with '/users/new'
    cy.url().should(url => expect(url.endsWith('/todos/new')).to.be.true);

    // On the page we were sent to, We should see the right title
    cy.get('.add-todo-title').should('have.text', 'New Todo');
  });

});
