# re-ansi

Ansi code to HTML

## Features

re-ansi supports:

* Cursor movement: `\n`, line erase and `\r` line erase
* SGR parameter: italic, bold, underline and line-through
* 3/4 bits [color code][ansi-color-code]

re-ansi removes styles on new lines, so that a `<br />` can't be nested inside `<span style>` elements.

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

Add to your `rescript.json`:

```diff
"bs-dependencies": [
+  "@softwarefactory-project/re-ansi"
]
```

## Usage

In reason:

```reason
let log = "green color: \x1b[01m\x1b[01;32mOK\x1b[00m";

@react.component
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

Contributions are most welcome, for example the project needs help to:

- support more ANSI code.
- enable custom colors, such as solarized, by changing the `fourBitColors` function to a property.

Get started by running:

```sh
git clone https://github.com/softwarefactory-project/re-ansi
cd re-ansi
npm install
npm run test
```

Then build and run tests with `yarn test`.

Make sure to read about [React][reason-react] and [Reason][rescript-lang] too.

To make a release:

- Update the version number in packages.json
- Run `npm run build && npm run bundle`
- Then: `npm publish`
- Tag and push the commit

## Changes

### 0.7.5

- Fix link parsing when escape sequences at end of URL.

### 0.7.4

- Add the missing `Ansi.res.js` to the release.

### 0.7.3

- Better parse url.

### 0.7.2

- Use a bundle for the published JS library thanks to
  https://github.com/rescript-lang/rescript-compiler/issues/6754#issuecomment-2153018168

### 0.7.1

- Use @rescript/std instead of rescript.

### 0.7.0

- Update to rescript version 11.

### 0.6.0

- Fix support for bright colors.

### 0.5.0

- Add support for `[m` and `[K`.

### 0.4.0

- Add support for underline and line-through text decoration.
- Add support for lighter font style.
- Add initial support for color reset.

### 0.3.0

- Add unique keys to react list elements.
- Create a href elements for http links.

### 0.2.1

- Fix Ansi.parse to return the full document instead of the last line.

### 0.2.0

- Fix a recursion limit in Ansi.parse for log bigger than 10MB.

### 0.1.3

- Initial release.

[ansi-color-code]: https://en.wikipedia.org/wiki/ANSI_escape_code#3-bit_and_4-bit
[reason-react]: https://reasonml.github.io/reason-react/docs/en/components
[rescript-lang]: https://rescript-lang.org/docs/manual/v8.0.0/overview
