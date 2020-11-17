# re-ansi

Ansi code to HTML

## Features

re-ansi supports:

* Cursor movement: `\n`, line erase and `\r` line erase
* SGR parameter: italic and bold
* 3/4 bits [color code][ansi-color-code]

For details, see the `AnsiCode.parse` function.

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

let make = () => (
  <Ansi log="content..." />;
);
```

## Contribute

Contribution are most welcome, for example the project needs help to:

- support more ANSI code.
- enable custom colors, such as solarized, by changing the `fourBitColors` function to a property.

Get started by running:

```sh
git clone https://github.com/softwarefactory-project/re-ansi
cd re-ansi
yarn install
yarn start
```

Then build and run tests with `yarn test`.

Make sure to read about [React][reason-react] and [Reason][rescript-lang] too.

[ansi-color-code]: https://en.wikipedia.org/wiki/ANSI_escape_code#3-bit_and_4-bit
[reason-react]: https://reasonml.github.io/reason-react/docs/en/components
[rescript-lang]: https://rescript-lang.org/docs/manual/v8.0.0/overview
