// Copyright 2020 Red Hat, Inc
//
// Licensed under the Apache License, Version 2.0 (the "License"); you may
// not use this file except in compliance with the License. You may obtain
// a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

// Ansi renders a log ANSI code to a React component

// Document type
type rec document = list<atom>
and atom =
  | Text(string)
  | Link(string)
  | LineBreak
  | DocStyle(ReactDOM.Style.t, document);

type parser<'a> = (int, option<'a>);

module AnsiCode = {
  type code =
    | Clear
    | EraseLine
    | CarriageReturn
    | HRef(string)
    | Style(ReactDOM.Style.t);

  // Convert a 4 bits color code to its css color: https://en.wikipedia.org/wiki/ANSI_escape_code#3-bit_and_4-bit
  let fourBitColors = (code: int): option<string> =>
    switch (code) {
    | 00 => "black"->Some
    | 01 => "red"->Some
    | 02 => "green"->Some
    | 03 => "yellow"->Some
    | 04 => "blue"->Some
    | 05 => "magenta"->Some
    | 06 => "cyan"->Some
    | 07 => "white"->Some
    | 09 => "initial"->Some
    | 10 => "grey"->Some
    | 11 => "#DA2647"->Some
    | 12 => "#87FF2A"->Some
    | 13 => "#FFF700"->Some
    | 14 => "#5DADEC"->Some
    | 15 => "#FF3399"->Some
    | 16 => "#8DD9CC"->Some
    | 17 => "white"->Some
    | _ =>
      Js.log2("Unknown color value:", code);
      None;
    };

  let threeBitColors = (code: int): option<string> =>
    switch (code) {
    | 00 => "grey"->Some
    | 01 => "red"->Some
    | 02 => "green"->Some
    | 03 => "yellow"->Some
    | 04 => "blue"->Some
    | 05 => "magenta"->Some
    | 06 => "cyan"->Some
    | 07 => "white"->Some
    | _ =>
      Js.log2("Unknown color value:", code);
      None;
    };

  // Css utility
  let combine = (css1, css2) => ReactDOM.Style.combine(css1, css2);
  let addWeight = fontWeight => ReactDOM.Style.make(~fontWeight, ());
  let addStyle = fontStyle => ReactDOM.Style.make(~fontStyle, ());
  let addDecoration = textDecoration => ReactDOM.Style.make(~textDecoration, ());
  let int_of_cp = c => c - 48;

  // Color management
  module ColorCss = {
    type t =
      | Foreground(int)
      | BrightForeground(int)
      | Background(int);
    let getColorStyle = (colorMode: int, colorValue: int): option<t> =>
      switch (colorMode) {
      | 3 => colorValue->Foreground->Some
      | 9 => colorValue->BrightForeground->Some
      | 4
      | 0 => colorValue->Background->Some
      | _ =>
        Js.log3("Unknown color code:", colorMode, colorValue);
        None;
      };

    let getColorStyleCss = (color: t): option<ReactDOM.Style.t> =>
      switch (color) {
      | Foreground(v) =>
        v
        ->fourBitColors
        ->Option.flatMap(color => ReactDOM.Style.make(~color, ())->Some)
      | BrightForeground(v) =>
        v
        ->threeBitColors
        ->Option.flatMap(color => ReactDOM.Style.make(~color, ~fontWeight="bold", ())->Some)
      | Background(v) =>
        v
        ->fourBitColors
        ->Option.flatMap(background =>
            ReactDOM.Style.make(~background, ())->Some
          )
      };

    let get = (colorMode: int, colorValue: int): option<ReactDOM.Style.t> =>
      colorMode
      ->int_of_cp
      ->getColorStyle(colorValue->int_of_cp)
      ->Option.flatMap(getColorStyleCss);
  };

  // Font management
  module FontCss = {
    type t =
      | Regular
      | FontStyle(ReactDOM.Style.t);

    let getFontStyle = (fontMode: int): option<t> =>
      switch (fontMode) {
      | 0 => Regular->Some
      | 1 => "bold"->addWeight->FontStyle->Some
      | 2 => "lighter"->addWeight->FontStyle->Some
      | 3 => "italic"->addStyle->FontStyle->Some
      | 4 => "underline"->addDecoration->FontStyle->Some
      // TODO: add blink for 5/6
      | 7 => Regular->Some
      // 8 is for hiding, not widely supported.
      | 9 => "line-through"->addDecoration->FontStyle->Some
      | _ => None
      };

    let getFontStyleCss = (font: t): option<ReactDOM.Style.t> =>
      switch (font) {
      | Regular => None
      | FontStyle(css) => css->Some
      };

    let get = (fontMode: int): option<ReactDOM.Style.t> =>
      fontMode->int_of_cp->getFontStyle->Option.flatMap(getFontStyleCss);
  };

  // Link management
  module HttpLink = {
    let linkRe = RegExp.fromString("^(http(s)?:\\/\\/[^\\s]+)");

    let get = (txt: string): parser<code> =>
      linkRe
      ->RegExp.exec(txt)
      ->Option.flatMap(res => res->Array.get(0)
          ->Option.flatMap(url =>
              (url->String.length, url->HRef->Some)->Some
            )
        )
      ->Option.getOr((1, None));
  };

  // Parse an ANSI code, returning the length of the sequence
  let parse = (txt: string, pos: int): parser<code> =>
    switch (Js.String.codePointAt(pos, txt)) {
    | Some(0x68) => HttpLink.get(txt->Js.String.slice(~from=pos, ~to_=512))
    | Some(0x0a) => (1, CarriageReturn->Some)
    | Some(0x0d)
    | Some(0x1b) =>
      // escape sequence begin
      let codePoints = [];

      let rec readCodePoints = (idx: int) =>
        switch (idx > 10, Js.String.codePointAt(pos + idx, txt)) {
        | (false, Some(109)) => ()
        | (false, Some(n)) => {
          codePoints->Array.push(n);
          readCodePoints(idx + 1)
        }
        | _ => ()
        };
      readCodePoints(1);

      // use get for pattern match value, it's fine to use 'getUnsafe' because we'll get undefined value.
      let get = (idx) => codePoints->Array.getUnsafe(idx)

      // Add 2 to take the 0x1b and 109 into account
      let length = codePoints->Array.length + 2;
      switch (codePoints) {
      // \n\x0d[1A\x0d[J
      | _ when
        get(0) == 10 && get(1) == 27 && get(2) == 91 && get(3) == 49 &&
        get(4) == 65 && get(5) == 27 && get(6) == 91 && get(7) == 74 => (9, EraseLine->Some)
      // [_K
      | _ when get(0) == 91 && get(2) == 75 => (4, EraseLine->Some)
      // [K
      | _ when get(0) == 91 && get(1) == 75 => (3, EraseLine->Some)
      // [00m
      | [91, 48, 48]
      // [0m
      | [91, 48]
      // [m
      | [91] => (length, Clear->Some)
      // [_m
      | [91, style] => (
          length,
          style->FontCss.get->Option.flatMap(style => style->Style->Some),
        )
      // [__m
      | [91, colorMode, colorValue] as xs
      // [1__m
      | [91, 49, colorMode, colorValue] as xs => (
          length,
          ColorCss.get(
            colorMode,
            colorValue + (xs->Array.length == 4 ? 10 : 0),
          )
          ->Option.flatMap(colorCss => colorCss->Style->Some),
        )
      // [__;_m
      | [91, colorMode, colorValue, 59, style]
      // [0_;__m
      | [91, 48, style, 59, colorMode, colorValue]
      // [_;__m
      | [91, style, 59, colorMode, colorValue] => (
          length,
          ColorCss.get(colorMode, colorValue)
          ->Option.flatMap(colorCss =>
              switch (style->FontCss.get) {
              | Some(fontCss) => combine(colorCss, fontCss)->Style->Some
              | None => colorCss->Style->Some
              }
            ),
        )
      // [0_;__;__m]
      | [91, 48, style, 59, cm1, cv1, 59, cm2, cv2] as xs
      // [_;__;__m
      | [91, style, 59, cm1, cv1, 59, cm2, cv2] as xs
      // [0_;__;1__m]
      | [91, 48, style, 59, cm1, cv1, 59, 49, cm2, cv2] as xs
      // [_;__;1__m]
      | [91, style, 59, cm1, cv1, 59, 49, cm2, cv2] as xs => (
          length,
          ColorCss.get(cm1, cv1)
          ->Option.flatMap(colorCss1 =>
              ColorCss.get(cm2, cv2 + (xs->Array.length == 9 ? 10 : 0))
              ->Option.flatMap(colorCss2 => {
                  let css = combine(colorCss1, colorCss2);
                  switch (style->FontCss.get) {
                  | Some(fontCss) => combine(css, fontCss)->Style->Some
                  | None => css->Style->Some
                  };
                })
            ),
        )

      | _xs =>
        //        Js.log2("Unknown ANSI sequence:", xs->List.toArray);
        (1, None)
      };
    | _ => (0, None)
    };
};

module Document = {
  let text = (txt: string, from: int, to_: int): atom =>
    txt->Js.String.slice(~from, ~to_)->Text;

  // Parse a document
  let parse = (txt: string, length: int, pos: int): parser<document> => {
    let rec go = (pos: int, prev: int) =>
      switch (pos == length, txt->AnsiCode.parse(pos)) {
      // we reached the end of the txt
      | (true, _) => (pos, list{text(txt, prev, pos)}->Some)
      // current codepoint is an ANSI code or a HRef
      | (_, (length, Some(code))) =>
        let prevElem = txt->text(prev, pos);
        let pos = pos + length;
        switch (code) {
        | Clear => (pos, list{prevElem}->Some)
        | EraseLine => pos->go(pos)
        | CarriageReturn => (pos, list{prevElem, LineBreak}->Some)
        | HRef(link) => (pos, list{prevElem, link->Link}->Some)
        | Style(style) =>
          // recursively parse the stylized block
          switch (pos->go(pos)) {
          | (pos, Some(styled)) => (
              pos,
              list{prevElem, DocStyle(style, styled)}->Some,
            )
          | _ => (pos, None)
          }
        };
      // otherwise we keep on parsing
      | (_, (_, None)) => go(pos + 1, prev)
      };
    pos->go(pos);
  };
};

// Convert a string to a document
let parse = (txt: string): document => {
  let rec go = (txt: string, acc: list<document>) => {
    let length = txt->String.length;
    switch (txt->Document.parse(length, 0)) {
    | (pos, Some(doc)) when pos == length => acc->List.add(doc)
    | (pos, Some(doc)) =>
      txt->Js.String.sliceToEnd(~from=pos)->go(acc->List.add(doc))
    | _ => acc
    };
  };
  txt->go(list{})->List.reverse->List.flat;
};

// Convert a document to a React.element
let render = (doc: document): React.element => {
  let rec go =
          (xs: document, idx: int, acc: list<React.element>): React.element =>
    switch (xs) {
    | list{} => acc->List.reverse->List.toArray->React.array
    | list{LineBreak, ...xs} =>
      xs->go(idx + 1, acc->List.add(<br key={idx->string_of_int} />))
    | list{Text(txt), ...xs} =>
      xs->go(idx + 1, acc->List.add(React.string(txt)))
    | list{Link(href), ...xs} =>
      xs->go(
        idx + 1,
        acc->List.add(
          <a key={idx->string_of_int} href> {href->React.string} </a>,
        ),
      )
    | list{DocStyle(style, elems), ...xs} =>
      xs->go(
        idx + 1,
        acc->List.add(
          <span key={idx->string_of_int} style> {elems->go(0, list{})} </span>,
        ),
      )
    };
  doc->go(0, list{});
};

// The react component
@react.component
let make = (~log: string) => {
  <div> {log->parse->render} </div>;
};

let default = make;
