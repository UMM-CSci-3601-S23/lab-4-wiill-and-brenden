import {Todo} from 'src/app/todos/todo';

export class AddTodoPage {
  navigateTo() {
    return cy.visit('/todos/new');
  }

  getTitle() {
    return cy.get('.add-todo-title');
  }

  addTodoButton() {
    return cy.get('[data-test=confirmAddTodoButton]');
  }

  selectMatSelectValue(select: Cypress.Chainable, value: string) {
    // Find and click the drop down
    return select.click()
      // Select and click the desired value from the resulting menu
      .get(`mat-option[value="${value}"]`).click();
  }

  getFormField(fieldName: string) {
    return cy.get(`mat-form-field [formcontrolname=${fieldName}]`);
  }

  getSnackBar() {
    return cy.get('.mat-mdc-simple-snack-bar');
  }

  addTodo(newTodo: Todo) {
    this.getFormField('owner').type(newTodo.owner);
    cy.get('mat-select[formControlName=status]').click().get('mat-option').contains('complete').click();
    if (newTodo.body) {
      this.getFormField('body').type(newTodo.body, {force: true});
    }
    if (newTodo.category) {
      this.getFormField('category').type(newTodo.category, {force: true});
    }

    return this.addTodoButton().click({force: true});
  }
}
