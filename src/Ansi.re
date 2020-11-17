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
type document = list(atom)
and atom =
  | Text(string)
  | LineBreak
  | DocStyle(ReactDOM.Style.t, document);

type parser('a) = (int, option('a));

open Belt;

module AnsiCode = {
  type code =
    | Clear
    | EraseLine
    | CarriageReturn
    | Style(ReactDOM.Style.t);

  // Convert a 4 bits color code to its css color: https://en.wikipedia.org/wiki/ANSI_escape_code#3-bit_and_4-bit
  let fourBitColors = (code: int): option(string) =>
    switch (code) {
    | 00 => "black"->Some
    | 01 => "red"->Some
    | 02 => "green"->Some
    | 03 => "yellow"->Some
    | 04 => "blue"->Some
    | 05 => "magenta"->Some
    | 06 => "cyan"->Some
    | 07 => "white"->Some
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

  // Css utility
  let combine = (css1, css2) => ReactDOM.Style.combine(css1, css2);
  let addWeight = fontWeight => ReactDOM.Style.make(~fontWeight, ());
  let addStyle = fontStyle => ReactDOM.Style.make(~fontStyle, ());
  let int_of_cp = c => c - 48;

  // Color management
  module ColorCss = {
    type t =
      | Foreground(int)
      | Background(int);
    let getColorStyle = (colorMode: int, colorValue: int): option(t) =>
      switch (colorMode) {
      | 3
      | 9 => colorValue->Foreground->Some
      | 4
      | 0 => colorValue->Background->Some
      | _ =>
        Js.log3("Unknown color code:", colorMode, colorValue);
        None;
      };

    let getColorStyleCss = (color: t): option(ReactDOM.Style.t) =>
      switch (color) {
      | Foreground(v) =>
        v
        ->fourBitColors
        ->Option.flatMap(color => ReactDOM.Style.make(~color, ())->Some)
      | Background(v) =>
        v
        ->fourBitColors
        ->Option.flatMap(background =>
            ReactDOM.Style.make(~background, ())->Some
          )
      };

    let get = (colorMode: int, colorValue: int): option(ReactDOM.Style.t) =>
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

    let getFontStyle = (fontMode: int): option(t) =>
      switch (fontMode) {
      | 0 => Regular->Some
      | 1 => "bold"->addWeight->FontStyle->Some
      | 3 => "italic"->addStyle->FontStyle->Some
      | 7 => Regular->Some
      | _ => None
      };

    let getFontStyleCss = (font: t): option(ReactDOM.Style.t) =>
      switch (font) {
      | Regular => None
      | FontStyle(css) => css->Some
      };

    let get = (fontMode: int): option(ReactDOM.Style.t) =>
      fontMode->int_of_cp->getFontStyle->Option.flatMap(getFontStyleCss);
  };

  // Parse an ANSI code, returning the length of the sequence
  let parse = (txt: string, pos: int): parser(code) =>
    switch (Js.String.codePointAt(pos, txt)) {
    | Some(0x0a) => (1, CarriageReturn->Some)
    | Some(0x0d)
    | Some(0x1b) =>
      // escape sequence begin
      let rec cps = (idx: int, acc: list(int)): list(int) =>
        switch (idx > 10, Js.String.codePointAt(pos + idx, txt)) {
        | (false, Some(109)) => acc
        | (false, Some(n)) => cps(idx + 1, acc->List.add(n))
        | _ => acc
        };

      let codePoints = 1->cps([])->List.reverse;
      let length = codePoints->List.length + 2;
      switch (codePoints) {
      // \n\x0d[1A\x0d[J
      | [10, 27, 91, 49, 65, 27, 91, 74, ..._] => (9, EraseLine->Some)
      // [00m
      | [91, 48, 48]
      // [0m
      | [91, 48] => (length, Clear->Some)
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
              ColorCss.get(cm2, cv2 + (xs->List.length == 9 ? 10 : 0))
              ->Option.flatMap(colorCss2 => {
                  let css = combine(colorCss1, colorCss2);
                  switch (style->FontCss.get) {
                  | Some(fontCss) => combine(css, fontCss)->Style->Some
                  | None => css->Style->Some
                  };
                })
            ),
        )

      | xs =>
        Js.log2("Unknown ANSI sequence:", xs->List.toArray);
        (1, None);
      };
    | _ => (0, None)
    };
};

module Document = {
  let text = (txt: string, from: int, to_: int): atom =>
    txt->Js.String.slice(~from, ~to_)->Text;

  // Parse a document
  let parse = (txt: string, length: int, pos: int): parser(document) => {
    let rec go = (pos: int, prev: int) =>
      switch (pos == length, txt->AnsiCode.parse(pos)) {
      // we reached the end of the txt
      | (true, _) => (pos, [text(txt, prev, pos)]->Some)
      // current codepoint is an ANSI code
      | (_, (length, Some(code))) =>
        let prevElem = txt->text(prev, pos);
        let pos = pos + length;
        switch (code) {
        | Clear => (pos, [prevElem]->Some)
        | EraseLine => pos->go(pos)
        | CarriageReturn => (pos, [prevElem, LineBreak]->Some)
        | Style(style) =>
          // recursively parse the stylized block
          switch (pos->go(pos)) {
          | (pos, Some(styled)) => (
              pos,
              [prevElem, DocStyle(style, styled)]->Some,
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
let rec parse = (txt: string): document => {
  let length = txt->Js.String.length;
  switch (txt->Document.parse(length, 0)) {
  | (pos, Some(doc)) when pos == length => doc
  | (pos, Some(doc)) =>
    doc->List.concat(txt->Js.String.sliceToEnd(~from=pos)->parse)
  | _ => []
  };
};

// Convert a document to a React.element
let render = (doc: document): React.element => {
  let rec go = (xs: document, acc: list(React.element)): React.element =>
    switch (xs) {
    | [] => acc->List.reverse->List.toArray->ReasonReact.array
    | [LineBreak, ...xs] => xs->go(acc->List.add(<br />))
    | [Text(txt), ...xs] => xs->go(acc->List.add(txt->React.string))
    | [DocStyle(style, elems), ...xs] =>
      xs->go(acc->List.add(<span style> {elems->go([])} </span>))
    };
  doc->go([]);
};

// The react component
[@react.component]
let make = (~log: string) => {
  <div> {log->parse->render} </div>;
};

let default = make;
