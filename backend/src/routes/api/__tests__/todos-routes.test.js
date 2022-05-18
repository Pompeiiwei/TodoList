import routes from '../todos-routes';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import express from 'express';
import axios from 'axios';
import connectToDatabase from '../../../db/db-connect';
import { Todo } from '../../../db/todos-schema';
import dayjs from 'dayjs';
import createJWKSMock  from 'mock-jwks';
// TODO Remember to install "nock"
let mongod, app, server;

// jest.setTimeout(100000);
const TEST_PORT = 6666;
let TEST_TOKEN = "";
const TEST_SUB = 'test|112775905052107745438';
let ANOTHER_TOKEN ="";

let jwks;

// Some dummy data to test with
const overdueTodo = {
  _id: new mongoose.mongo.ObjectId('000000000000000000000002'),
  title: 'OverdueTitle',
  description: 'OverdueDesc',
  isComplete: false,
  dueDate: dayjs().subtract(1, 'day').format(),
  sub: TEST_SUB,
};

const upcomingTodo = {
  _id: new mongoose.mongo.ObjectId('000000000000000000000003'),
  title: 'UpcomingTitle',
  description: 'UpcomingDesc',
  isComplete: false,
  dueDate: dayjs().add(1, 'day').format(),
  sub: TEST_SUB,
};

const completeTodo = {
  _id: new mongoose.mongo.ObjectId('000000000000000000000004'),
  title: 'CompleteTitle',
  description: 'CompleteDesc',
  isComplete: true,
  dueDate: dayjs().format(),
  sub: TEST_SUB,
};

const dummyTodos = [overdueTodo, upcomingTodo, completeTodo];

// Start database and server before any tests run
beforeAll(async (done) => {
  mongod = new MongoMemoryServer();

  jwks = createJWKSMock(
    `https://liekkas.us.auth0.com/`
  );

  TEST_TOKEN = await jwks.token({
    aud: "https://liekkas.us.auth0.com/api/v2/",
    iss: `https://liekkas.us.auth0.com/`,
    sub: TEST_SUB,
  })

  ANOTHER_TOKEN = await jwks.token({
        aud: "https://liekkas.us.auth0.com/api/v2/",
        iss: `https://liekkas.us.auth0.com/`,
        sub: 'anotherTest|123345456654',
  });

  jwks.start(); 

  await mongod.getUri().then((cs) => connectToDatabase(cs));

  app = express();
  app.use(express.json());
  app.use('/api/todos', routes);
  server = app.listen(TEST_PORT, done);
});

// Populate database with dummy data before each test
beforeEach(async () => {
  await Todo.insertMany(dummyTodos);
});

// Clear database after each test
afterEach(async () => {
  await Todo.deleteMany({});
});

// Stop db and server before we finish
afterAll((done) => {
  server.close(async () => {
    jwks.stop();
    await mongoose.disconnect();
    await mongod.stop();
    done();
  });
});

it('retrieves all todos successfully', async () => {
  const response = await axios.get(`http://localhost:${TEST_PORT}/api/todos`
      , {
        headers: { Authorization: `Bearer ${TEST_TOKEN}` },
      }
  );
  expect(response.status).toBe(200);
  const responseTodos = response.data;
  expect(responseTodos.length).toBe(3);

  for (let i = 0; i < responseTodos.length; i++) {
    const responseTodo = responseTodos[i];
    const expectedTodo = dummyTodos[i];

    expect(responseTodo._id.toString()).toEqual(expectedTodo._id.toString());
    expect(responseTodo.title).toEqual(expectedTodo.title);
    expect(responseTodo.description).toEqual(expectedTodo.description);
    expect(responseTodo.isComplete).toEqual(expectedTodo.isComplete);
    expect(dayjs(responseTodo.dueDate)).toEqual(dayjs(expectedTodo.dueDate));
  }
});

it('retrieves a single todo successfully', async () => {
  const response = await axios.get(
      `http://localhost:${TEST_PORT}/api/todos/000000000000000000000003`,
      {
        headers: { Authorization: `Bearer ${TEST_TOKEN}` },
      }
  );
  expect(response.status).toBe(200);

  const responseTodo = response.data;
  expect(responseTodo._id.toString()).toEqual(upcomingTodo._id.toString());
  expect(responseTodo.title).toEqual(upcomingTodo.title);
  expect(responseTodo.description).toEqual(upcomingTodo.description);
  expect(responseTodo.isComplete).toEqual(upcomingTodo.isComplete);
  expect(dayjs(responseTodo.dueDate)).toEqual(dayjs(upcomingTodo.dueDate));
});

it('returns a 404 when attempting to retrieve a nonexistant todo (valid id)', async () => {
  try {
    await axios.get(
        `http://localhost:${TEST_PORT}/api/todos/000000000000000000000001`,
        {
          headers: { Authorization: `Bearer ${TEST_TOKEN}` },
        }
    );
    fail('Should have thrown an exception.');
  } catch (err) {
    const { response } = err;
    expect(response).toBeDefined();
    expect(response.status).toBe(404);
  }
});

it('returns a 400 when attempting to retrieve a nonexistant todo (invalid id)', async () => {
  try {
    await axios.get(`http://localhost:${TEST_PORT}/api/todos/blah`, {
      headers: { Authorization: `Bearer ${TEST_TOKEN}` },
    });
    fail('Should have thrown an exception.');
  } catch (err) {
    const { response } = err;
    expect(response).toBeDefined();
    expect(response.status).toBe(400);
    expect(response.data).toBe('Invalid ID');
  }
});

it('Creates a new todo', async () => {
  const newTodo = {
    title: 'NewTodo',
    description: 'NewDesc',
    isComplete: false,
    dueDate: dayjs('2100-01-01').format(),
  };

  const response = await axios.post(
      `http://localhost:${TEST_PORT}/api/todos`,
      newTodo,
      {
        headers: { Authorization: `Bearer ${TEST_TOKEN}` },
      }
  );

  // Check response is as expected
  expect(response.status).toBe(201);
  expect(response.data).toBeDefined();
  const rTodo = response.data;
  expect(rTodo.title).toBe('NewTodo');
  expect(rTodo.description).toBe('NewDesc');
  expect(rTodo.isComplete).toBe(false);
  expect(dayjs(rTodo.dueDate)).toEqual(dayjs('2100-01-01'));
  expect(rTodo._id).toBeDefined();
  expect(response.headers.location).toBe(`/api/todos/${rTodo._id}`);

  // Check that the todo was actually added to the database
  const dbTodo = await Todo.findById(rTodo._id);
  expect(dbTodo.title).toBe('NewTodo');
  expect(dbTodo.description).toBe('NewDesc');
  expect(dbTodo.isComplete).toBe(false);
  expect(dayjs(dbTodo.dueDate)).toEqual(dayjs('2100-01-01'));
});

it('Gives a 400 when trying to create a todo with no title', async () => {
  try {
    const newTodo = {
      description: 'NewDesc',
      isComplete: false,
      dueDate: dayjs('2100-01-01').format(),
    };

    await axios.post(`http://localhost:${TEST_PORT}/api/todos`, newTodo, {
      headers: { Authorization: `Bearer ${TEST_TOKEN}` },
    });
    fail('Should have thrown an exception.');
  } catch (err) {
    // Ensure response is as expected
    const { response } = err;
    expect(response).toBeDefined();
    expect(response.status).toBe(400);

    // Ensure DB wasn't modified
    expect(await Todo.countDocuments()).toBe(3);
  }
});

it('updates a todo successfully', async () => {
  const toUpdate = {
    _id: new mongoose.mongo.ObjectId('000000000000000000000004'),
    title: 'UPDCompleteTitle',
    description: 'UPDCompleteDesc',
    isComplete: false,
    dueDate: dayjs('2100-01-01').format(),
    sub: TEST_SUB,
  };

  const response = await axios.put(
      `http://localhost:${TEST_PORT}/api/todos/000000000000000000000004`,
      toUpdate,
      {
        headers: { Authorization: `Bearer ${TEST_TOKEN}` },
      }
  );

  // Check response
  expect(response.status).toBe(204);

  // Ensure DB was updated
  const dbTodo = await Todo.findById('000000000000000000000004');
  expect(dbTodo.title).toBe('UPDCompleteTitle');
  expect(dbTodo.description).toBe('UPDCompleteDesc');
  expect(dbTodo.isComplete).toBe(false);
  expect(dayjs(dbTodo.dueDate)).toEqual(dayjs('2100-01-01'));
});

it('Uses the path ID instead of the body ID when updating', async () => {
  const toUpdate = {
    _id: new mongoose.mongo.ObjectId('000000000000000000000003'),
    title: 'UPDCompleteTitle',
    description: 'UPDCompleteDesc',
    isComplete: false,
    dueDate: dayjs('2100-01-01').format(),
    sub: TEST_SUB,
  };

  const response = await axios.put(
      `http://localhost:${TEST_PORT}/api/todos/000000000000000000000004`,
      toUpdate,
      {
        headers: { Authorization: `Bearer ${TEST_TOKEN}` },
      }
  );

  // Check response
  expect(response.status).toBe(204);

  // Ensure correct DB entry was updated
  let dbTodo = await Todo.findById('000000000000000000000004');
  expect(dbTodo.title).toBe('UPDCompleteTitle');
  expect(dbTodo.description).toBe('UPDCompleteDesc');
  expect(dbTodo.isComplete).toBe(false);
  expect(dayjs(dbTodo.dueDate)).toEqual(dayjs('2100-01-01'));

  // Ensure incorrect DB entry was not updated
  dbTodo = await Todo.findById('000000000000000000000003');
  expect(dbTodo.title).toBe('UpcomingTitle');
  expect(dbTodo.description).toBe('UpcomingDesc');
  expect(dbTodo.isComplete).toBe(false);
  expect(dayjs(dbTodo.dueDate)).toEqual(dayjs(upcomingTodo.dueDate));
});

it('Gives a 404 when updating a nonexistant todo', async () => {
  try {
    const toUpdate = {
      _id: new mongoose.mongo.ObjectId('000000000000000000000010'),
      title: 'UPDCompleteTitle',
      description: 'UPDCompleteDesc',
      isComplete: false,
      dueDate: dayjs('2100-01-01').format(),
      sub: TEST_SUB,
    };

    await axios.put(
        `http://localhost:${TEST_PORT}/api/todos/000000000000000000000010`,
        toUpdate,
        {
          headers: { Authorization: `Bearer ${TEST_TOKEN}` },
        }
    );
    fail('Should have returned a 404');
  } catch (err) {
    const { response } = err;
    expect(response).toBeDefined();
    expect(response.status).toBe(404);

    // Make sure something wasn't added to the db
    expect(await Todo.countDocuments()).toBe(3);
  }
});

it('Deletes a todo', async () => {
  const response = await axios.delete(
      `http://localhost:${TEST_PORT}/api/todos/000000000000000000000003`,
      {
        headers: { Authorization: `Bearer ${TEST_TOKEN}` },
      }
  );
  expect(response.status).toBe(204);

  // Check db item was deleted
  expect(await Todo.findById('000000000000000000000003')).toBeNull();
});

it("Doesn't delete anything when it shouldn't", async () => {
  const response = await axios.delete(
      `http://localhost:${TEST_PORT}/api/todos/000000000000000000000010`,
      {
        headers: { Authorization: `Bearer ${TEST_TOKEN}` },
      }
  );
  expect(response.status).toBe(204);

  // Make sure something wasn't deleted from the db
  expect(await Todo.countDocuments()).toBe(3);
});

/* ------------------------------- Task Three ------------------------------- */
// step 2:  unauthenticated user call API
it('3.2.1: returns a 401 when retrieve all todos(unauthenticated user)', async () => {
  // TODO this is one situation (fake token)
  try {
    await axios.get(`http://localhost:${TEST_PORT}/api/todos`,{
      headers: { Authorization: `Bearer 123123123123123` }
    });
    fail('Should have returned a 401');
  } catch (err) {
    const { response } = err;
    expect(response).toBeDefined();
    expect(response.status).toBe(401);

    // Make sure DB wasn't modified
    expect(await Todo.countDocuments()).toBe(3);
  }

  //TODO this is another situation (without token)
      try {
        await axios.get(`http://localhost:${TEST_PORT}/api/todos`);
        fail('Should have returned a 401');
      } catch (err) {
        const { response } = err;
        expect(response).toBeDefined();
        expect(response.status).toBe(401);

        // Make sure DB wasn't modified
        expect(await Todo.countDocuments()).toBe(3);
      }
}

);
it('3.2.2: returns a 401 when retrieves a single todo(unauthenticated user)', async () => {
  //TODO situation 1
  try {
    await axios.get(
        `http://localhost:${TEST_PORT}/api/todos/000000000000000000000003`,{
          headers: { Authorization: `Bearer 123123123123123` }
        }
    );
    fail('Should have returned a 401');
  } catch (err) {
    const { response } = err;
    expect(response).toBeDefined();
    expect(response.status).toBe(401);

    // Make sure DB wasn't modified
    expect(await Todo.countDocuments()).toBe(3);
  }

  //TODO situation 2
  try {
    await axios.get(
        `http://localhost:${TEST_PORT}/api/todos/000000000000000000000003`
    );
    fail('Should have returned a 401');
  } catch (err) {
    const { response } = err;
    expect(response).toBeDefined();
    expect(response.status).toBe(401);

    // Make sure DB wasn't modified
    expect(await Todo.countDocuments()).toBe(3);
  }
});
it('3.2.3: returns a 401 when creates a new todo(unauthenticated user)', async () => {
  //TODO situation 1
  try {
    const newTodo = {
      title: 'NewTodo',
      description: 'NewDesc',
      isComplete: false,
      dueDate: dayjs('2100-01-01').format(),
    };

    await axios.post(`http://localhost:${TEST_PORT}/api/todos`, newTodo,{
      headers: { Authorization: `Bearer 123123123123123` }
    });
    fail('Should have returned a 401');
  } catch (err) {
    const { response } = err;
    expect(response).toBeDefined();
    expect(response.status).toBe(401);

    // Make sure something wasn't added to the db
    expect(await Todo.countDocuments()).toBe(3);
  }
  //TODO situation 2
  try {
    const newTodo = {
      title: 'NewTodo',
      description: 'NewDesc',
      isComplete: false,
      dueDate: dayjs('2100-01-01').format(),
    };

    await axios.post(`http://localhost:${TEST_PORT}/api/todos`, newTodo);
    fail('Should have returned a 401');
  } catch (err) {
    const { response } = err;
    expect(response).toBeDefined();
    expect(response.status).toBe(401);

    // Make sure something wasn't added to the db
    expect(await Todo.countDocuments()).toBe(3);
  }

});
it('3.2.4: returns a 401 when updates a todo(unauthenticated user)', async () => {
  //TODO situation 1
  try {
    const toUpdate = {
      _id: new mongoose.mongo.ObjectId('000000000000000000000004'),
      title: 'UPDCompleteTitle',
      description: 'UPDCompleteDesc',
      isComplete: false,
      dueDate: dayjs('2100-01-01').format(),
      sub: TEST_SUB,
    };

    await axios.put(
        `http://localhost:${TEST_PORT}/api/todos/000000000000000000000004`,
        toUpdate,{
          headers: { Authorization: `Bearer 123123123123123` }
        }
    );
    fail('Should have returned a 401');
  } catch (err) {
    const { response } = err;
    expect(response).toBeDefined();
    expect(response.status).toBe(401);

    // Make sure something wasn't added to the db
    expect(await Todo.countDocuments()).toBe(3);
  }

  //TODO situation 2
  try {
    const toUpdate = {
      _id: new mongoose.mongo.ObjectId('000000000000000000000004'),
      title: 'UPDCompleteTitle',
      description: 'UPDCompleteDesc',
      isComplete: false,
      dueDate: dayjs('2100-01-01').format(),
      sub: TEST_SUB,
    };

    await axios.put(
        `http://localhost:${TEST_PORT}/api/todos/000000000000000000000004`,
        toUpdate
    );
    fail('Should have returned a 401');
  } catch (err) {
    const { response } = err;
    expect(response).toBeDefined();
    expect(response.status).toBe(401);

    // Make sure something wasn't added to the db
    expect(await Todo.countDocuments()).toBe(3);
  }
});
it('3.2.5: returns a 401 when deletes a todo(unauthenticated user)', async () => {
  //TODO situation 1
  try {
    await axios.delete(
        `http://localhost:${TEST_PORT}/api/todos/000000000000000000000003`,{
          headers: { Authorization: `Bearer 123123123123123` }
        }
    );
    fail('Should have returned a 401');
  } catch (err) {
    const { response } = err;
    expect(response).toBeDefined();
    expect(response.status).toBe(401);

    // Check db item wasn't deleted
    expect(await Todo.findById('000000000000000000000003')).toBeDefined();
  }
  //TODO situation 2
  try {
    await axios.delete(
        `http://localhost:${TEST_PORT}/api/todos/000000000000000000000003`
    );
    fail('Should have returned a 401');
  } catch (err) {
    const { response } = err;
    expect(response).toBeDefined();
    expect(response.status).toBe(401);

    // Check db item wasn't deleted
    expect(await Todo.findById('000000000000000000000003')).toBeDefined();
  }
});

// step 3: an authenticated user operate another user's todos
it('3.3.1: returns a 401 when retrieves a single todo(belong to another user)', async () => {
  try {
    await axios.get(
        `http://localhost:${TEST_PORT}/api/todos/000000000000000000000003`,
        {
          headers: { authorization: `Bearer ${ANOTHER_TOKEN}` },
        }
    );
    fail('Should have returned a 401');
  } catch (err) {
    const { response } = err;
    expect(response).toBeDefined();
    expect(response.status).toBe(401);

    // Make sure DB wasn't modified
    expect(await Todo.countDocuments()).toBe(3);
  }
});
it('3.3.2: returns a 401 when updates a todo(belong to another user)', async () => {
  try {
    const toUpdate = {
      _id: new mongoose.mongo.ObjectId('000000000000000000000004'),
      title: 'UPDCompleteTitle',
      description: 'UPDCompleteDesc',
      isComplete: false,
      dueDate: dayjs('2100-01-01').format(),
      sub: TEST_SUB,
    };

    await axios.put(
        `http://localhost:${TEST_PORT}/api/todos/000000000000000000000004`,
        toUpdate,
        {
          headers: { authorization: `Bearer ${ANOTHER_TOKEN}` },
        }
    );
    fail('Should have returned a 401');
  } catch (err) {
    const { response } = err;
    expect(response).toBeDefined();
    expect(response.status).toBe(401);

    // Make sure something wasn't added to the db
    expect(await Todo.countDocuments()).toBe(3);
  }
});
it('3.3.3: returns a 401 when deletes a todo(belong to another user)', async () => {
  try {
    await axios.delete(
        `http://localhost:${TEST_PORT}/api/todos/000000000000000000000003`,
        {
          headers: { authorization: `Bearer ${ANOTHER_TOKEN}` },
        }
    );
    fail('Should have returned a 401');
  } catch (err) {
    const { response } = err;
    expect(response).toBeDefined();
    expect(response.status).toBe(401);

    // Check db item wasn't deleted
    expect(await Todo.findById('000000000000000000000003')).toBeDefined();
  }
});


