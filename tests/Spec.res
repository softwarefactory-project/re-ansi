let withColor = (color, rest) =>
  Ansi.DocStyle(ReactDOM.Style.make(~color, ()), rest->List.fromArray);

let withBrightColor = (color, rest) =>
  Ansi.DocStyle(ReactDOM.Style.make(~color, ~fontWeight="bold", ()), rest->List.fromArray);

let withFont = (style, rest) =>
  Ansi.DocStyle(ReactDOM.Style.make(~fontWeight=style, ()), rest->List.fromArray);

let withDecoration = (textDecoration, rest) =>
  Ansi.DocStyle(ReactDOM.Style.make(~textDecoration, ()), rest->List.fromArray);

let generateFile = (size: int): string => {
  let codePointListToString = (xs: list<int>): string => {
    let rec go = (xs, acc) =>
      switch (xs) {
      | list{} => acc
      | list{x, ...xs} =>
        xs->go(x->Js.String.fromCharCode->Js.String.concat(acc))
      };
    xs->go("");
  };
  Random.init(42);
  let rec go = (acc, sz) =>
    sz > 0 ? acc->List.add(Random.int(256))->go(sz - 1) : acc;
  list{}->go(size)->codePointListToString;
};

let testParse = (txt, expected) => {
  let parsed = txt->Ansi.parse;
  parsed == expected->List.fromArray
    ? true
    : {
      Js.log3(txt, "!=", expected);
      Js.log2("got", parsed);
      false;
    };
};

let spec = [
  generateFile(10000000)->Ansi.parse->List.length > 0,
  "Copying blob 15de\r\n\x1b[1A\x1b[JCopied"->testParse([Text("Copied")]),
  "zookeeper: \x1b[4munderlined\x1b[m"
  ->testParse([
      Text("zookeeper: "),
      withDecoration("underline", [Text("underlined")]),
    ]),
  "bold: \x1b[1mtest\x1b[m over"
  ->testParse([Text("bold: "), withFont("bold", [Text("test")]), Text(" over")]),
  "a\x1b[0Kb"
  ->testParse([Text("b")]),
  "a\x1b[Kb"
  ->testParse([Text("b")]),
  "prev\x1b[1A\x1b[KStatus output"
  ->testParse([Text("Status output")]),
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
  "bright: \x1b[90mtest\x1b[m"
  ->testParse([Text("bright: "), withBrightColor("grey", [Text("test")])]),
];

if !(spec->Array.every(x => x)) {
  %raw(`process.exit(1)`)
}
