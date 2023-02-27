import { TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Todo } from './todo';
import { TodoService } from './todo.service';
import { of } from 'rxjs';

describe('TodoService', () => {
  // Collection of test Todos
  const testTodos: Todo[] = [
    {
      _id: 'chris_id',
      owner: 'Chris',
      status: 'complete',
      body: 'UMM',
      category: 'Video games',
      avatar: 'https://gravatar.com/avatar/8c9616d6cc5de638ea6920fb5d65fc6c?d=identicon'
    },
    {
      _id: 'pat_id',
      owner: 'Pat',
      status: 'incomplete',
      body: 'IBM',
      category: 'Movies',
      avatar: 'https://gravatar.com/avatar/b42a11826c3bde672bce7e06ad729d44?d=identicon'
    },
    {
      _id: 'jamie_id',
      owner: 'Jamie',
      status: 'complete',
      body: 'Frogs',
      category: 'TV Shows',
      avatar: 'https://gravatar.com/avatar/d4a6c71dd9470ad4cf58f78c100258bf?d=identicon'
    }
  ];
  let todoService: TodoService;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    // Set up the mock handling of the HTTP requests
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    // Construct an instance of the service with the mock
    // HTTP client.age
    todoService = new TodoService(httpClient);
  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });

  describe('getTodos()', () => {

    it('calls `api/todos` when `getTodos()` is called with no parameters', () => {
      // Assert that the todos we get from this call to getTodos()
      // should be our set of test todos. Because we're subscribing
      // to the result of getTodos(), this won't actually get
      // checked until the mocked HTTP request 'returns' a response.
      // This happens when we call req.flush(testTodos) a few lines
      // down.
      todoService.getTodos().subscribe(
        todos => expect(todos).toBe(testTodos)
      );

      // Specify that (exactly) one request will be made to the specified URL.
      const req = httpTestingController.expectOne(todoService.todoUrl);
      // Check that the request made to that URL was a GET request.
      expect(req.request.method).toEqual('GET');
      // Check that the request had no query parameters.
      expect(req.request.params.keys().length).toBe(0);
      // Specify the content of the response to that request. This
      // triggers the subscribe above, which leads to that check
      // actually being performed.
      req.flush(testTodos);
    });

    describe('Calling getTodos() with parameters correctly forms the HTTP request', () => {


      it('correctly calls api/todos with filter parameter \'owner\'', () => {
        todoService.getTodos({ owner: 'Chris' }).subscribe(
          todos => expect(todos).toBe(testTodos)
        );

        // Specify that (exactly) one request will be made to the specified URL with the role parameter.
        const req = httpTestingController.expectOne(
          (request) => request.url.startsWith(todoService.todoUrl) && request.params.has('owner')
        );

        // Check that the request made to that URL was a GET request.
        expect(req.request.method).toEqual('GET');

        // Check that the owner parameter was 'chris'
        expect(req.request.params.get('owner')).toEqual('Chris');

        req.flush(testTodos);
      });

      it('correctly calls api/todos with filter parameter \'status\'', () => {

        todoService.getTodos({ status: 'complete' }).subscribe(
          todos => expect(todos).toBe(testTodos)
        );

        // Specify that (exactly) one request will be made to the specified URL with the age parameter.
        const req = httpTestingController.expectOne(
          (request) => request.url.startsWith(todoService.todoUrl) && request.params.has('status')
        );

        // Check that the request made to that URL was a GET request.
        expect(req.request.method).toEqual('GET');

        // Check that the age parameter was '25'
        expect(req.request.params.get('status')).toEqual('complete');

        req.flush(testTodos);
      });

      it('correctly calls api/todos with filter parameter \'body\'', () => {
        todoService.getTodos({ body: 'UMM' }).subscribe(
          todos => expect(todos).toBe(testTodos)
        );

        // Specify that (exactly) one request will be made to the specified URL with the role parameter.
        const req = httpTestingController.expectOne(
          (request) => request.url.startsWith(todoService.todoUrl) && request.params.has('contains')
        );

        // Check that the request made to that URL was a GET request.
        expect(req.request.method).toEqual('GET');

        // Check that the role parameter was 'admin'
        expect(req.request.params.get('contains')).toEqual('UMM');

        req.flush(testTodos);
      });

      it('correctly calls api/todos with filter parameter \'category\'', () => {
        todoService.getTodos({ category: 'video games' }).subscribe(
          todos => expect(todos).toBe(testTodos)
        );

        // Specify that (exactly) one request will be made to the specified URL with the role parameter.
        const req = httpTestingController.expectOne(
          (request) => request.url.startsWith(todoService.todoUrl)
        );

        // Check that the request made to that URL was a GET request.
        expect(req.request.method).toEqual('GET');

        req.flush(testTodos);
      });

      it('correctly calls api/todos with filter parameter \'limit\'', () => {
        todoService.getTodos({ limit: 2 }).subscribe(
          todos => expect(todos).toBe(testTodos)
        );

        // Specify that (exactly) one request will be made to the specified URL with the role parameter.
        const req = httpTestingController.expectOne(
          (request) => request.url.startsWith(todoService.todoUrl) && request.params.has('limit')
        );

        // Check that the request made to that URL was a GET request.
        expect(req.request.method).toEqual('GET');

        req.flush(testTodos);
      });

      it('correctly calls api/todos with filter parameter \'sortBy\'', () => {
        todoService.getTodos({ sortBy: 'Owner' }).subscribe(
          todos => expect(todos).toBe(testTodos)
        );

        // Specify that (exactly) one request will be made to the specified URL with the role parameter.
        const req = httpTestingController.expectOne(
          (request) => request.url.startsWith(todoService.todoUrl)
        );

        // Check that the request made to that URL was a GET request.
        expect(req.request.method).toEqual('GET');

        req.flush(testTodos);
      });


      it('correctly calls api/todos with multiple filter parameters', () => {

        todoService.getTodos({ owner: 'Chris', category: 'video games', status: 'complete' }).subscribe(
          todos => expect(todos).toBe(testTodos)
        );

        // Specify that (exactly) one request will be made to the specified URL with the role parameter.
        const req = httpTestingController.expectOne(
          (request) => request.url.startsWith(todoService.todoUrl)
            && request.params.has('owner') && request.params.has('status')
        );

        // Check that the request made to that URL was a GET request.
        expect(req.request.method).toEqual('GET');

        // Check that the owner and status parameters are correct
        expect(req.request.params.get('owner')).toEqual('Chris');
        expect(req.request.params.get('status')).toEqual('complete');

        req.flush(testTodos);
      });
    });
  });

  describe('getTodoByID()', () => {
    it('calls api/todos/id with the correct ID', () => {
      // We're just picking a Todo "at random" from our little
      // set of Todos up at the top.
      const targetTodo: Todo = testTodos[1];
      const targetId: string = targetTodo._id;

      todoService.getTodoById(targetId).subscribe(
        // This `expect` doesn't do a _whole_ lot.
        // Since the `targetTodo`
        // is what the mock `HttpClient` returns in the
        // `req.flush(targetTodo)` line below, this
        // really just confirms that `getTodoById()`
        // doesn't in some way modify the todo it
        // gets back from the server.
        todo => expect(todo).toBe(targetTodo)
      );

      const expectedUrl: string = todoService.todoUrl + '/' + targetId;
      const req = httpTestingController.expectOne(expectedUrl);
      expect(req.request.method).toEqual('GET');

      req.flush(targetTodo);
    });
  });

  describe('filterTodos()', () => {
    /*
     * Since `filterTodos` actually filters "locally" (in
     * Angular instead of on the server), we do want to
     * confirm that everything it returns has the desired
     * properties. Since this doesn't make a call to the server,
     * though, we don't have to use the mock HttpClient and
     * all those complications.
     */
    it('filters by owner', () => {
      const todoOwner = 'i';
      const filteredTodos = todoService.filterTodos(testTodos, { owner: todoOwner });
      // There should be two todos with an 'i' in their
      // owner: Chris and Jamie.
      expect(filteredTodos.length).toBe(2);
      // Every returned todo's owner should contain an 'i'.
      filteredTodos.forEach(todo => {
        expect(todo.owner.indexOf(todoOwner)).toBeGreaterThanOrEqual(0);
      });
    });

    it('filters by body', () => {
      const todoBody = 'UMM';
      const filteredTodos = todoService.filterTodos(testTodos, { body: todoBody });
      // There should be just one todo that has UMM as their body.
      expect(filteredTodos.length).toBe(1);
      // Every returned todo's body should contain 'UMM'.
      filteredTodos.forEach(todo => {
        expect(todo.body.indexOf(todoBody)).toBeGreaterThanOrEqual(0);
      });
    });

    it('filters by category', () => {
      const todoCategory = 'video games';
      const filteredTodos = todoService.filterTodos(testTodos, { category: todoCategory });
      // There should be 1 todos with video games as their category.
      expect(filteredTodos.length).toBe(1);
      // Every returned todo's category should contain 'video games'.
      filteredTodos.forEach(todo => {
        expect(todo.body.indexOf(todoCategory)).toBeGreaterThanOrEqual(-1);
      });
    });

    it('filters by limit', () => {
      const todoLimit = 2;
      const filteredTodos = todoService.filterTodos(testTodos, { limit: todoLimit });
      // There should 5 todos if we set limit to 5.
      expect(filteredTodos.length).toBe(2);
    });

    it('filters by owner and body', () => {
      // There's only one todo (Chris) whose owner
      // contains an 'i' and whose body contains
      // an 'M'. There are two whose owner contains
      // an 'i' and two whose body contains an
      // an 'M', so this should test combined filtering.
      const todoOwner = 'i';
      const todoBody = 'M';
      const filters = { owner: todoOwner, body: todoBody };
      const filteredTodos = todoService.filterTodos(testTodos, filters);
      // There should be just one todo with these properties.
      expect(filteredTodos.length).toBe(1);
      // Every returned todo should have _both_ these properties.
      filteredTodos.forEach(todo => {
        expect(todo.owner.indexOf(todoOwner)).toBeGreaterThanOrEqual(0);
        expect(todo.body.indexOf(todoBody)).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Adding a Todo using `addTodo()`', () => {
    it('talks to the right endpoint and is called once', waitForAsync(() => {
      // Mock the `httpClient.addTodo()` method, so that instead of making an HTTP request,
      // it just returns our test data.
      const TODO_ID = 'pat_id';
      const mockedMethod = spyOn(httpClient, 'post').and.returnValue(of(TODO_ID));

      // paying attention to what is returned (undefined) didn't work well here,
      // but I'm putting something in here to remind us to look into that
      todoService.addTodo(testTodos[1]).subscribe((returnedString) => {
        console.log('The thing returned was:' + returnedString);
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(todoService.todoUrl, testTodos[1]);
      });
    }));
  });
});
