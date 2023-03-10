import { Component, OnInit} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Todo, TodoStatus} from '../todo';
import { TodoService } from '../todo.service';
@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss']
})
export class TodoListComponent implements OnInit {
  public serverFilteredTodos: Todo[];
  public filteredTodos: Todo[];
  public limit: number;

  public todoID: string;
  public todoBody: string;
  public todoStatus: TodoStatus;
  public todoOwner: string;
  public todoCategory: string;
  public viewType: 'card' | 'list' = 'card';
  public sortBy: 'owner' | 'category';

  constructor(private todoService: TodoService, private snackBar: MatSnackBar){

  }

  getTodosFromServer() {
    this.todoService.getTodos({
      status: this.todoStatus,
      sortBy: this.sortBy
    }).subscribe(returnedTodos => {
      this.serverFilteredTodos = returnedTodos;
      this.updateFilter();
    }, err => {
      console.error('We couldn\'t get the list of todos; the server might be down :(');
      this.snackBar.open(
        'Problem contacting server – try again',
        'OK',
        { duration: 3000 });
    });
  }

  public updateFilter() {
    this.filteredTodos = this.todoService.filterTodos(
      this.serverFilteredTodos, { status: this.todoStatus, body: this.todoBody,
        owner: this.todoOwner, category: this.todoCategory, limit: this.limit}
    );
  }

  ngOnInit(): void {
    this.getTodosFromServer();
  }
}
