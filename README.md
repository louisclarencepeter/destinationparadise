# Destination Paradise

Destination Paradise is a website for a local travel company based in Zanzibar, Tanzania. Designed to showcase the beauty and unique travel experiences Zanzibar offers, this project is built with React and SASS, providing an interactive and user-friendly interface.

## Table of Contents
- [Installation](#installation)
- [Development](#development)
- [Build](#build)
- [Testing](#testing)
- [Scripts](#scripts)

## Installation

To get started with the project, clone the repository and install the dependencies:

```bash
git clone <repository-url>
cd destinationparadise
npm install
```

## Development

To start the development server, run:

```bash
npm start
```

This will start the Vite development server and open the project in your default web browser. The server will be running at `http://localhost:3002`.

## Build

To build the project for production, run:

```bash
npm run build
```

The build output will be in the `dist` directory.

## Testing

We use Jest for testing. To run the tests, use the following command:

```bash
npm test
```

### Adding Tests

To add a test, create a file with the `.test.js` extension in your project. For example, create a `sum.test.js` file with the following content:

```javascript
function sum(a, b) {
    return a + b;
}

test('adds 1 + 2 to equal 3', () => {
    expect(sum(1, 2)).toBe(3);
});
```

To run the test, simply execute `npm test` again.

### Setting Up Babel (if needed)

If you need to use modern JavaScript features in your tests, set up Babel by creating a `.babelrc` file in the root of your project with the following content:

```json
{
    "presets": ["@babel/preset-env", "@babel/preset-react"]
}
```

## Scripts

- `npm start`: Starts the development server.
- `npm run build`: Builds the project for production.
- `npm run lint`: Lints the source files.
- `npm run preview`: Previews the production build.
- `npm test`: Runs the test suite.

## Dependencies

Key dependencies used in this project include:

- React
- React DOM
- React Router DOM
- Axios
- Vite
- Jest (for testing)
- ESLint (for linting)
- FontAwesome

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for review.

## License

This project is licensed under the ISC License.