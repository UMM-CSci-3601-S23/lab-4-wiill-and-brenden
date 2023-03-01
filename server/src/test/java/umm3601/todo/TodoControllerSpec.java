package umm3601.todo;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.argThat;
import static com.mongodb.client.model.Filters.eq;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;

import com.mongodb.MongoClientSettings;
import com.mongodb.ServerAddress;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;

import org.bson.Document;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.mockito.ArgumentMatcher;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import io.javalin.validation.BodyValidator;
import io.javalin.validation.ValidationException;
import io.javalin.validation.Validator;
import io.javalin.http.BadRequestResponse;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;
import io.javalin.http.NotFoundResponse;
import io.javalin.json.JavalinJackson;

/**
 * Tests the logic of the TodoController
 *
 * @throws IOException
 */
// The tests here include a ton of "magic numbers" (numeric constants).
// It wasn't clear to me that giving all of them names would actually
// help things. The fact that it wasn't obvious what to call some
// of them says a lot. Maybe what this ultimately means is that
// these tests can/should be restructured so the constants (there are
// also a lot of "magic strings" that Checkstyle doesn't actually
// flag as a problem) make more sense.
@SuppressWarnings({ "MagicNumber" })
public class TodoControllerSpec {

  // An instance of the controller we're testing that is prepared in
  // `setupEach()`, and then exercised in the various tests below.
  private TodoController todoController;

  // A Mongo object ID that is initialized in `setupEach()` and used
  // in a few of the tests. It isn't used all that often, though,
  // which suggests that maybe we should extract the tests that
  // care about it into their own spec file?
  private ObjectId samsId;

  // The client and database that will be used
  // for all the tests in this spec file.
  private static MongoClient mongoClient;
  private static MongoDatabase db;

  // Used to translate between JSON and POJOs.
  private static JavalinJackson javalinJackson = new JavalinJackson();

  @Mock
  private Context ctx;

  @Captor
  private ArgumentCaptor<ArrayList<Todo>> todoArrayListCaptor;

  @Captor
  private ArgumentCaptor<Todo> todoCaptor;

  @Captor
  private ArgumentCaptor<Map<String, String>> mapCaptor;

  /**
   * Sets up (the connection to the) DB once; that connection and DB will
   * then be (re)used for all the tests, and closed in the `teardown()`
   * method. It's somewhat expensive to establish a connection to the
   * database, and there are usually limits to how many connections
   * a database will support at once. Limiting ourselves to a single
   * connection that will be shared across all the tests in this spec
   * file helps both speed things up and reduce the load on the DB
   * engine.
   */
  @BeforeAll
  public static void setupAll() {
    String mongoAddr = System.getenv().getOrDefault("MONGO_ADDR", "localhost");

    mongoClient = MongoClients.create(
        MongoClientSettings.builder()
            .applyToClusterSettings(builder -> builder.hosts(Arrays.asList(new ServerAddress(mongoAddr))))
            .build()
    );
    db = mongoClient.getDatabase("test");
  }

  @AfterAll
  public static void teardown() {
    db.drop();
    mongoClient.close();
  }

  @BeforeEach
  public void setupEach() throws IOException {
    // Reset our mock context and argument captor (declared with Mockito annotations @Mock and @Captor)
    MockitoAnnotations.openMocks(this);

    // Setup database
    MongoCollection<Document> todoDocuments = db.getCollection("todos");
    todoDocuments.drop();
    List<Document> testTodos = new ArrayList<>();
    testTodos.add(
        new Document()
            .append("owner", "Chris")
            .append("category", "Homework")
            .append("body", "Sociology reading")
            .append("status", "complete"));
    testTodos.add(
        new Document()
           .append("owner", "Joe")
           .append("category", "Sports")
           .append("body", "Tennis Project")
           .append("status", "incomplete"));
    testTodos.add(
        new Document()
           .append("owner", "Poe")
           .append("category", "video games")
           .append("body", "This is a body")
           .append("status", "incomplete"));

    samsId = new ObjectId();
    Document sam = new Document()
        .append("_id", samsId)
        .append("owner", "Sam")
        .append("category", "Games")
        .append("body", "Play Video Games")
        .append("status", "complete")
;

    todoDocuments.insertMany(testTodos);
    todoDocuments.insertOne(sam);

    todoController = new TodoController(db);
  }

  @Test
  public void canGetAllTodos() throws IOException {
    // When something asks the (mocked) context for the queryParamMap,
    // it will return an empty map (since there are no query params in this case where we want all todos)
    when(ctx.queryParamMap()).thenReturn(Collections.emptyMap());

    // Now, go ahead and ask the todoController to getTodos
    // (which will, indeed, ask the context for its queryParamMap)
    todoController.getTodos(ctx);

    // We are going to capture an argument to a function, and the type of that argument will be
    // of type ArrayList<Todo> (we said so earlier using a Mockito annotation like this):
    // @Captor
    // private ArgumentCaptor<ArrayList<Todo>> todoArrayListCaptor;
    // We only want to declare that captor once and let the annotation
    // help us accomplish reassignment of the value for the captor
    // We reset the values of our annotated declarations using the command
    // `MockitoAnnotations.openMocks(this);` in our @BeforeEach

    // Specifically, we want to pay attention to the ArrayList<Todo> that is passed as input
    // when ctx.json is called --- what is the argument that was passed? We capture it and can refer to it later
    verify(ctx).json(todoArrayListCaptor.capture());
    verify(ctx).status(HttpStatus.OK);

    // Check that the database collection holds the same number of documents as the size of the captured List<Todo>
    assertEquals(db.getCollection("todos").countDocuments(), todoArrayListCaptor.getValue().size());
  }


  /**
   * Test that if the todo sends a request with an illegal value in
   * the age field (i.e., something that can't be parsed to a number)
   * we get a reasonable error code back.
   */

  @Test
  public void getTodosByStatus() throws JsonMappingException, JsonProcessingException {
    // When the controller calls `ctx.queryParamMap`, return the expected map for an
    // "?age=37" query.
    when(ctx.queryParamMap()).thenReturn(Map.of(TodoController.STATUS_KEY, List.of("complete")));
    // When the controller calls `ctx.queryParamAsClass() to get the value associated with
    // the "age" key, return an appropriate Validator. TBH, I never did figure out what the
    // third argument to the Validator constructor was for, but `null` seems OK. I'm also not sure
    // what the first argument is; it appears that you can set it to anything that isn't
    // null and it's happy.
    Validator<String> validator = new Validator<String>("status", "complete", null);
    when(ctx.queryParamAsClass(TodoController.STATUS_KEY, String.class)).thenReturn(validator);

    // Call the method under test.
    todoController.getTodos(ctx);

    // Verify that `getTodos` called `ctx.status(200)` at some point.
    verify(ctx).status(HttpStatus.OK);

    // Verify that `ctx.json()` is called with a `List` of `Todo`s.
    // Each of those `Todo`s should have age 37.
    verify(ctx).json(argThat(new ArgumentMatcher<List<Todo>>() {
      public boolean matches(List<Todo> todos) {
        for (Todo todo : todos) {
          assertEquals("complete", todo.status);
        }
        return true;
      }
    }));
  }

  /**
   * Test that if the todo sends a request with an illegal value in
   * the age field (i.e., too big of a number)
   * we get a reasonable error code back.
   */


/**
   * Test that if the todo sends a request with an illegal value in
   * the age field (i.e., too small of a number)
   * we get a reasonable error code back.
   */


   @Test
 public void canGetTodosWithBody() throws IOException {
 Map<String, List<String>> queryParams = new HashMap<>();
 queryParams.put(TodoController.CONTAINS_PARAMETER, Arrays.asList(new String[] {"Sociology reading"}));
 when(ctx.queryParamMap()).thenReturn(queryParams);
 when(ctx.queryParam(TodoController.CONTAINS_PARAMETER)).thenReturn("Sociology reading");

 todoController.getTodos(ctx);

 verify(ctx).json(todoArrayListCaptor.capture());
 verify(ctx).status(HttpStatus.OK);

 // Confirm that all the todos passed to `json` work for OHMNET.
 for (Todo todo : todoArrayListCaptor.getValue()) {
 assertEquals("Sociology reading", todo.body);
 }
 }



  @Test
  public void getTodoWithExistentId() throws IOException {
    String id = samsId.toHexString();
    when(ctx.pathParam("id")).thenReturn(id);

    todoController.getTodo(ctx);

    verify(ctx).json(todoCaptor.capture());
    verify(ctx).status(HttpStatus.OK);
    assertEquals("Sam", todoCaptor.getValue().owner);
    assertEquals(samsId.toHexString(), todoCaptor.getValue()._id);
  }

  @Test
  public void getTodoWithBadId() throws IOException {
    when(ctx.pathParam("id")).thenReturn("bad");

    Throwable exception = assertThrows(BadRequestResponse.class, () -> {
      todoController.getTodo(ctx);
    });

    assertEquals("The requested todo id wasn't a legal Mongo Object ID.", exception.getMessage());
  }

  @Test
  public void getTodoWithNonexistentId() throws IOException {
    String id = "588935f5c668650dc77df581";
    when(ctx.pathParam("id")).thenReturn(id);

    Throwable exception = assertThrows(NotFoundResponse.class, () -> {
      todoController.getTodo(ctx);
    });

    assertEquals("The requested todo was not found", exception.getMessage());
  }

  @Test
  public void addTodo() throws IOException {
    String testNewTodo = "{"
        + "\"owner\": \"Test Todo\","
        + "\"category\": \"testers\","
        + "\"body\": \"this is for testing\","
        + "\"status\": \"incomplete\""
        + "}";
    when(ctx.bodyValidator(Todo.class))
      .then(value -> new BodyValidator<Todo>(testNewTodo, Todo.class, javalinJackson));

    todoController.addNewTodo(ctx);
    verify(ctx).json(mapCaptor.capture());

    // Our status should be 201, i.e., our new todo was successfully created.
    verify(ctx).status(HttpStatus.CREATED);

    //Verify that the todo was added to the database with the correct ID
    Document addedTodo = db.getCollection("todos")
      .find(eq("_id", new ObjectId(mapCaptor.getValue().get("id")))).first();

    // Successfully adding the todo should return the newly generated, non-empty MongoDB ID for that todo.
    assertNotEquals("", addedTodo.get("_id"));
    assertEquals("Test Todo", addedTodo.get("owner"));
    assertEquals("testers", addedTodo.get(TodoController.CATEGORY_KEY));
    assertEquals("this is for testing", addedTodo.get(TodoController.BODY_KEY));
    assertEquals("incomplete", addedTodo.get(TodoController.STATUS_KEY));

  }


  @Test
  public void addNullStatusTodo() throws IOException {
    String testNewTodo = "{"
        + "\"owner\": \"Test Todo\","
        + "\"category\": \"25\","
        + "\"body\": \"testers\","

        + "}";
    when(ctx.bodyValidator(Todo.class))
      .then(value -> new BodyValidator<Todo>(testNewTodo, Todo.class, javalinJackson));

    assertThrows(ValidationException.class, () -> {
      todoController.addNewTodo(ctx);
    });
  }
  @Test
  public void addNullCategoryTodo() throws IOException {
    String testNewTodo = "{"
        + "\"owner\": \"Test Todo\","
        + "\"body\": \"testers\","
        + "\"status\": \"complete\","
        + "}";
    when(ctx.bodyValidator(Todo.class))
      .then(value -> new BodyValidator<Todo>(testNewTodo, Todo.class, javalinJackson));

    assertThrows(ValidationException.class, () -> {
      todoController.addNewTodo(ctx);
    });
  }

  @Test
  public void addNullBodyTodo() throws IOException {
    String testNewTodo = "{"
       + "\"owner\": \"Test Todo\","
       + "\"category\": \"testers\","
       + "\"status\": \"incomplete\""
       + "}";
    when(ctx.bodyValidator(Todo.class))
      .then(value -> new BodyValidator<Todo>(testNewTodo, Todo.class, javalinJackson));

    assertThrows(ValidationException.class, () -> {
      todoController.addNewTodo(ctx);
    });
  }


  @Test
  public void deleteFoundTodo() throws IOException {
    String testID = samsId.toHexString();
    when(ctx.pathParam("id")).thenReturn(testID);

    // Todo exists before deletion
    assertEquals(1, db.getCollection("todos").countDocuments(eq("_id", new ObjectId(testID))));

    todoController.deleteTodo(ctx);

    verify(ctx).status(HttpStatus.OK);

    // Todo is no longer in the database
    assertEquals(0, db.getCollection("todos").countDocuments(eq("_id", new ObjectId(testID))));
  }

  @Test
  public void tryToDeleteNotFoundTodo() throws IOException {
    String testID = samsId.toHexString();
    when(ctx.pathParam("id")).thenReturn(testID);

    todoController.deleteTodo(ctx);
    // Todo is no longer in the database
    assertEquals(0, db.getCollection("todos").countDocuments(eq("_id", new ObjectId(testID))));

    assertThrows(NotFoundResponse.class, () -> {
      todoController.deleteTodo(ctx);
    });

    verify(ctx).status(HttpStatus.NOT_FOUND);

    // Todo is still not in the database
    assertEquals(0, db.getCollection("todos").countDocuments(eq("_id", new ObjectId(testID))));
  }

}
