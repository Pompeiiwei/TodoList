# CS732 Assignment 01 - Extending the Todo App
**Note:** When running `npm install` to install the dependencies, you may need to run it with the additional tag `--legacy-peer-deps` so that dependencies resolve correctly:

```sh
npm install --legacy-peer-deps
```

The starter project given to you for this assignment is a near-identical copy of the model solution for Lab 04. It might pay to attempt, and fully understand, Lab 04, *before* attempting this assignment.

In this assignment, we will build on top of where Lab 04 left off, to add *authentication* using [Auth0](https://auth0.com/). Users will be able to create accounts, log in and log out, and maintain their own separate lists of to-do items. The frontend will appropriately hook into Auth0's authentication framework, while the backend will be appropriately protected by way of validating tokens supplied by the frontend.

The assignment is largely practical in nature, but will require you to research a topic not covered in the lectures - namely, [Auth0](https://auth0.com/). As you'll see below, the instructions may point you towards some resources but certainly are *not* step-by-step - you'll need to explore the documentation and online tutorials yourself to implement the solution.

## Submission instructions
The assignment is marked out of **40 marks**, and is worth **10%** of your overall grade for the course. It should be submitted as a single Zip file to Canvas on or before the due date. Ensure that all your source code, `package.json` and `package-lock.json` are included, but  **DO NOT upload your `.git` or `node_modules` folders!! Doing so will result in an automatic 50% penalty to your assignment grade.**


## Task One - Authentication (10 marks)
For this task, extend the application to add *authentication* using [Auth0](https://auth0.com/). Auth0 is an excellent platform which does a lot of the hard work for you, including managing Single Sign-On (SSO) environments, and the ability to use e.g. Google, Facebook, or Twitter accounts to log in.

Auth0 provides an [excellent tutorial](https://auth0.com/blog/complete-guide-to-react-user-authentication/) demonstrating how to integrate it with a React application, using the `@auth0/auth0-react` npm package. It is highly recommended that you start with this tutorial if you're unfamiliar with Auth0, or even if you have used it before in a non-React context.

**Note:** I had trouble getting the `github` URL given in the "Get the Starter Application" section to work. Use this command instead:

```
git clone -b starter https://github.com/auth0-blog/auth0-react-sample.git
```

The sample application uses concepts / packages such as *React Context* and *React Router* which have been covered in lectures, so should be fairly understandable. It does also use the [dotenv](https://www.npmjs.com/package/dotenv) package, which hasn't been covered in lectures, in order to load environment variables from a file rather than the command line - but you should be able to gauge how to use this properly based on following the tutorial.

Once this task is complete, your app should have the following functionality:

- When browsing to the root URL (e.g. <http://localhost:3000/>), *authenticated* users should see the list of to-do items. At this stage all users will still see the same to-do list (we'll change that in Task Two).

- If a user is *not* authenticated, they should instead be redirected to the Auth0 login page.

- After completing login / sign-up at the Auth0 page, Auth0 should redirect the user back to your application root URL, so they can see the to-do list.

- When viewing the to-do list, authenticated users should be able to see a "log out" button on the top-right corner of the page, in the app bar.

- Clicking the "log out" button should cause Auth0 to log the user out, then redirect back to the root URL (which should in turn automatically redirect back to the Auth0 login page as above, since the user is now unauthenticated).


## Task Two - Separate to-do lists (10 marks)
For this task, further extend the app so that each individual user maintains their own to-do list. To do this, you'll need to:

- Modify the database schema to add info to each to-do item about which users created which to-do items. **Note:** Don't do this based on an Auth0 Authorization header, as these will change each time a user authenticates, even if they're the same user. Do it based on some other info provide by Auth0 instead:

  - When following the tutorial linked below, your Express request object (usually `req`) will contain a `user` property when a user is authenticated. That user object has a `sub` property, which is a String that's guaranteed to be unique for a particular user.

  - If you would rather use a user's email instead, see "Determine the User Identity" at [this link](https://auth0.com/docs/architecture-scenarios/spa-api/api-implementation-nodejs). The "Rules section" the page mentions is located in the "Auth Pipeline" ➡ "Rules" section of your Auth0 dashboard.

- When making an API request to "GET all to-do items", the API should now return only the authenticated user's to-do items. If there is no authenticated user, a `401` error should be returned.

- When making an API request to GET a single to-do item by id, the API should only return that item if it belongs to the currently authenticated user. If it doesn't, a `401` error should be returned.

- When making an API request to POST (create) a new to-do item, this should only be allowed if the request is made by an authenticated user. If not, a `401` error should be returned.

- When making an API request to UPDATE a to-do item, this should only be allowed if the request is made by an authenticated user, and the to-do item to update belongs to that user. If not, a `401` error should be returned.

- When making an API request to DELETE a to-do item, this should only be allowed if the request is made by an authenticated user, and the to-do item to delete belongs to that user. If not, a `401` error should be returned.

The tutorial located [here](https://auth0.com/docs/quickstart/backend/nodejs) should be of great help to complete the tasks above.

Once your API is complete as above, you'll need to modify the locations in your frontend where your API is being called. If you're following the linked tutorials, the one mentioned in Task One will be of great assistance here.


## Task Three - Unit testing private API calls (10 marks)
Once your code for Task Two is complete, you'll notice that none of the backend unit tests pass! That's bad - we shouldn't leave our unit tests in a failing state. We need to update them to take into account the changes we've made to the backend.

Unit testing Express endpoints which rely on Auth0 authentication can be tricky, but luckily we can achieve this by mocking the libraries that Express uses to validate any supplied tokens.

The following online resources may be helpful - though you're welcome to complete this task any way you choose so long as it meets the requirements below:

- <https://carterbancroft.com/mocking-json-web-tokens-and-auth0/>
- <https://www.npmjs.com/package/mock-jwks>

1. To receive full marks for this section, all of the existing unit tests in [todos-routes.test.js](./backend/src/routes/api/__tests__/todos-routes.test.js) must again pass. And, they must still be testing what they say they're testing!

2. Next, write five additional unit tests within `todos-routes.test.js`, each one testing that a `401` error is returned, and the database not modified, when trying to access each of the five defined API routes, respectively.

3. Finally, write three additional new unit tests within `todos-routes.test.js`:

   - Test that a `401` is returned when trying to GET a todo item that doesn't belong to the currently authenticated user.

   - Test that a `401` is returned when trying to PUT (update) a todo item that doesn't belong to the currently authenticated user, and that the database isn't modified.

   - Test that a `401` is returned when trying to DELETE a todo item that doesn't belong to the currently authenticated user, and that the database isn't modified.

   Write these three unit tests as though the tester is authenticated as *one* user, but is trying to access todo items owned by *another* user. This differes from those in step 2), which should be written as though the user is *unauthenticated*.

When writing these unit tests, think about how you can encapsulate the functionality of simulating authenticated vs unauthenticated requets, to avoid having to copy / paste that code to each individual unit test.

## Task Four - Reflection (10 marks)
Finally, write a short report of *no more than **two** pages* containing some instructions for the markers, and some reflections on the assignment. Include this as a PDF file in your submission Zip.

Specifically, the report should answer the following:

- How must the marker setup their Auth0 Application and API to work with your solution?

- What files need to be changed in your solution (and where in those files), so that the marker can use their own Auth0 Application and API?

- What changes did you make to the frontend in order to implement Task One? (i.e. which files did you add / change, and why)?

- What changes did you make to the backend in order to implement Task Two?

- Comment on how easy / difficult it was to add Auth0 authentication to the webapp, and on the documentation you read. What was easily achievable? What was more difficult than anticipated? How effective was the documentation you read in aiding you? What changes, if any, would you recommend, to the documentation for new developers trying to use it?
