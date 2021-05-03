let withColor = (color, rest) =>
  Ansi.DocStyle(ReactDOM.Style.make(~color, ()), rest);

let withFont = (style, rest) =>
  Ansi.DocStyle(ReactDOM.Style.make(~fontWeight=style, ()), rest);

let withDecoration = (textDecoration, rest) =>
  Ansi.DocStyle(ReactDOM.Style.make(~textDecoration, ()), rest);

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
  "zookeeper: \x1b[4munderlined"
  ->testParse([
      Text("zookeeper: "),
      withDecoration("underline", [Text("underlined")]),
    ]),
  "bold: \x1b[1mtest\x1b[0m"
  ->testParse([Text("bold: "), withFont("bold", [Text("test")])]),
  "multi\nline\nend"
  ->testParse([
      Text("multi"),
      LineBreak,
      Text("line"),
      LineBreak,
      Text("end"),
    ]),
  "test: \x1b[31mRED\x1b[32mGREEN\x1b[0m\x1b[33mYELLOW\x1b[0m"
  ->testParse([
      Text("test: "),
      withColor(
        "red",
        [Text("RED"), withColor("green", [Text("GREEN")])],
      ),
      Text(""),
      withColor("yellow", [Text("YELLOW")]),
    ]),
  "get1: http://example.com/test 200"
  ->testParse([
      Text("get1: "),
      Link("http://example.com/test"),
      Text(" 200"),
    ]),
];

Node.Process.exit(spec->Belt.List.every(x => x) ? 0 : 1);
