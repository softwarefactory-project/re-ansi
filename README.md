# re-ansi

Ansi code to HTML

## Install

Add to your `package.json`:

```
npm install @softwarefactory-project/re-ansi
```

Or using yarn:

```
yarn add @softwarefactory-project/re-ansi
```

Add to your `bsconfig.json`:

```diff
"bs-dependencies": [
+  "@softwarefactory-project/re-ansi"
]
```

## Example

In reason:

```reason
let log = "green color: \x1b[01m\x1b[01;32mOK\x1b[00m";

[@react.component]
let make = () => {
  <Ansi log />
}
```

In javascript:

```javascript
import Ansi from "@softwarefactory-project/re-ansi";

let make = () => {
  <Ansi log="content..." />;
};
```

## Contribute

```sh
git clone https://github.com/softwarefactory-project/re-ansi
cd re-ansi
npm install
npm start
```

Then build and run tests with `npm test`.
