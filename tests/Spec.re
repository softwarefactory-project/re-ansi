let withColor = (color, rest) =>
  Ansi.DocStyle(ReactDOM.Style.make(~color, ()), rest);

let withFont = (style, rest) =>
  Ansi.DocStyle(ReactDOM.Style.make(~fontWeight=style, ()), rest);

let generateFile = (size: int): string => {
  let codePointListToString = (xs: list(int)): string => {
    let rec go = (xs, acc) =>
      switch (xs) {
      | [] => acc
      | [x, ...xs] =>
        xs->go(x->Js.String.fromCharCode->Js.String.concat(acc))
      };
    xs->go("");
  };
  Random.init(42);
  let rec go = (acc, sz) =>
    sz > 0 ? acc->Belt.List.add(Random.int(256))->go(sz - 1) : acc;
  []->go(size)->codePointListToString;
};

let testParse = (txt, expected) => {
  let parsed = txt->Ansi.parse;
  parsed == expected
    ? true
    : {
      Js.log3(txt, "!=", expected);
      false;
    };
};

let spec = [
  generateFile(10000000)->Ansi.parse->Belt.List.length > 0,
  "Copying blob 15de\r\n\x1b[1A\x1b[JCopied"->testParse([Text("Copied")]),
  "bold: \x1b[1mtest\x1b[0m"
  ->testParse([Text("bold: "), withFont("bold", [Text("test")])]),
  "test: \x1b[31mr\x1b[32ma\x1b[0m"
  ->testParse([
      Text("test: "),
      withColor("red", [Text("r"), withColor("green", [Text("a")])]),
    ]),
];

Node.Process.exit(spec->Belt.List.every(x => x) ? 0 : 1);
