'use strict';

var Curry = require("bs-platform/lib/js/curry.js");
var React = require("react");
var Belt_List = require("bs-platform/lib/js/belt_List.js");
var Belt_Option = require("bs-platform/lib/js/belt_Option.js");
var Caml_option = require("bs-platform/lib/js/caml_option.js");

function fourBitColors(code) {
  switch (code) {
    case 0 :
        return "black";
    case 1 :
        return "red";
    case 2 :
        return "green";
    case 3 :
        return "yellow";
    case 4 :
        return "blue";
    case 5 :
        return "magenta";
    case 6 :
        return "cyan";
    case 8 :
    case 9 :
        break;
    case 10 :
        return "grey";
    case 11 :
        return "#DA2647";
    case 12 :
        return "#87FF2A";
    case 13 :
        return "#FFF700";
    case 14 :
        return "#5DADEC";
    case 15 :
        return "#FF3399";
    case 16 :
        return "#8DD9CC";
    case 7 :
    case 17 :
        return "white";
    default:
      
  }
  console.log("Unknown color value:", code);
  
}

function combine(css1, css2) {
  return Object.assign({}, css1, css2);
}

function addWeight(fontWeight) {
  return {
          fontWeight: fontWeight
        };
}

function addStyle(fontStyle) {
  return {
          fontStyle: fontStyle
        };
}

function int_of_cp(c) {
  return c - 48 | 0;
}

function getColorStyle(colorMode, colorValue) {
  switch (colorMode) {
    case 0 :
    case 4 :
        return {
                TAG: /* Background */1,
                _0: colorValue
              };
    case 1 :
    case 2 :
    case 5 :
    case 6 :
    case 7 :
    case 8 :
        break;
    case 3 :
    case 9 :
        return {
                TAG: /* Foreground */0,
                _0: colorValue
              };
    default:
      
  }
  console.log("Unknown color code:", colorMode, colorValue);
  
}

function getColorStyleCss(color) {
  if (color.TAG) {
    return Belt_Option.flatMap(fourBitColors(color._0), (function (background) {
                  return {
                          background: background
                        };
                }));
  } else {
    return Belt_Option.flatMap(fourBitColors(color._0), (function (color) {
                  return {
                          color: color
                        };
                }));
  }
}

function get(colorMode, colorValue) {
  return Belt_Option.flatMap(getColorStyle(colorMode - 48 | 0, colorValue - 48 | 0), getColorStyleCss);
}

var ColorCss = {
  getColorStyle: getColorStyle,
  getColorStyleCss: getColorStyleCss,
  get: get
};

function getFontStyle(fontMode) {
  switch (fontMode) {
    case 1 :
        return /* FontStyle */{
                _0: addWeight("bold")
              };
    case 3 :
        return /* FontStyle */{
                _0: addStyle("italic")
              };
    case 2 :
    case 4 :
    case 5 :
    case 6 :
        return ;
    case 0 :
    case 7 :
        return /* Regular */0;
    default:
      return ;
  }
}

function getFontStyleCss(font) {
  if (font) {
    return Caml_option.some(font._0);
  }
  
}

function get$1(fontMode) {
  return Belt_Option.flatMap(getFontStyle(fontMode - 48 | 0), getFontStyleCss);
}

var FontCss = {
  getFontStyle: getFontStyle,
  getFontStyleCss: getFontStyleCss,
  get: get$1
};

function parse(txt, pos) {
  var match = txt.codePointAt(pos);
  if (match === undefined) {
    return [
            0,
            undefined
          ];
  }
  var switcher = match - 13 | 0;
  if (switcher > 14 || switcher < 0) {
    if (switcher !== -3) {
      return [
              0,
              undefined
            ];
    } else {
      return [
              1,
              /* CarriageReturn */2
            ];
    }
  }
  if (!(switcher > 13 || switcher < 1)) {
    return [
            0,
            undefined
          ];
  }
  var cps = function (_idx, _acc) {
    while(true) {
      var acc = _acc;
      var idx = _idx;
      var match = idx > 10;
      var match$1 = txt.codePointAt(pos + idx | 0);
      if (match) {
        return acc;
      }
      if (match$1 === undefined) {
        return acc;
      }
      if (match$1 === 109) {
        return acc;
      }
      _acc = Belt_List.add(acc, match$1);
      _idx = idx + 1 | 0;
      continue ;
    };
  };
  var codePoints = Belt_List.reverse(cps(1, /* [] */0));
  var length = Belt_List.length(codePoints) + 2 | 0;
  var exit = 0;
  var style;
  var colorMode;
  var colorValue;
  var style$1;
  var cm1;
  var cv1;
  var cm2;
  var cv2;
  var xs;
  if (codePoints) {
    var match$1 = codePoints.hd;
    if (match$1 !== 10) {
      if (match$1 !== 91) {
        exit = 1;
      } else {
        var match$2 = codePoints.tl;
        if (match$2) {
          var style$2 = match$2.hd;
          var exit$1 = 0;
          if (style$2 !== 48) {
            exit$1 = 4;
          } else {
            var match$3 = match$2.tl;
            if (!match$3) {
              return [
                      length,
                      /* Clear */0
                    ];
            }
            var style$3 = match$3.hd;
            var exit$2 = 0;
            if (style$3 !== 48) {
              exit$2 = 5;
            } else {
              if (!match$3.tl) {
                return [
                        length,
                        /* Clear */0
                      ];
              }
              exit$2 = 5;
            }
            if (exit$2 === 5) {
              var match$4 = match$3.tl;
              if (match$4) {
                if (match$4.hd !== 59) {
                  exit$1 = 4;
                } else {
                  var match$5 = match$4.tl;
                  if (match$5) {
                    var match$6 = match$5.tl;
                    if (match$6) {
                      var match$7 = match$6.tl;
                      var colorValue$1 = match$6.hd;
                      var colorMode$1 = match$5.hd;
                      if (match$7) {
                        if (match$7.hd !== 59) {
                          exit$1 = 4;
                        } else {
                          var match$8 = match$7.tl;
                          if (match$8) {
                            var cm2$1 = match$8.hd;
                            var match$9 = match$8.tl;
                            if (match$9) {
                              if (match$9.tl) {
                                if (cm2$1 !== 49) {
                                  exit$1 = 4;
                                } else {
                                  var match$10 = match$8.tl;
                                  var match$11 = match$10.tl;
                                  if (match$11.tl) {
                                    exit = 1;
                                  } else {
                                    style$1 = style$3;
                                    cm1 = colorMode$1;
                                    cv1 = colorValue$1;
                                    cm2 = match$10.hd;
                                    cv2 = match$11.hd;
                                    xs = codePoints;
                                    exit = 3;
                                  }
                                }
                              } else {
                                style$1 = style$3;
                                cm1 = colorMode$1;
                                cv1 = colorValue$1;
                                cm2 = cm2$1;
                                cv2 = match$9.hd;
                                xs = codePoints;
                                exit = 3;
                              }
                            } else {
                              exit$1 = 4;
                            }
                          } else {
                            exit = 1;
                          }
                        }
                      } else {
                        style = style$3;
                        colorMode = colorMode$1;
                        colorValue = colorValue$1;
                        exit = 2;
                      }
                    } else {
                      exit$1 = 4;
                    }
                  } else {
                    exit = 1;
                  }
                }
              } else {
                exit = 1;
              }
            }
            
          }
          if (exit$1 === 4) {
            var match$12 = match$2.tl;
            if (match$12 && match$12.hd === 59) {
              var match$13 = match$12.tl;
              if (match$13) {
                var match$14 = match$13.tl;
                if (match$14) {
                  var match$15 = match$14.tl;
                  var colorValue$2 = match$14.hd;
                  var colorMode$2 = match$13.hd;
                  if (match$15) {
                    if (match$15.hd !== 59) {
                      exit = 1;
                    } else {
                      var match$16 = match$15.tl;
                      if (match$16) {
                        var cm2$2 = match$16.hd;
                        var match$17 = match$16.tl;
                        if (match$17) {
                          if (match$17.tl) {
                            if (cm2$2 !== 49) {
                              exit = 1;
                            } else {
                              var match$18 = match$16.tl;
                              var match$19 = match$18.tl;
                              if (match$19.tl) {
                                exit = 1;
                              } else {
                                style$1 = style$2;
                                cm1 = colorMode$2;
                                cv1 = colorValue$2;
                                cm2 = match$18.hd;
                                cv2 = match$19.hd;
                                xs = codePoints;
                                exit = 3;
                              }
                            }
                          } else {
                            style$1 = style$2;
                            cm1 = colorMode$2;
                            cv1 = colorValue$2;
                            cm2 = cm2$2;
                            cv2 = match$17.hd;
                            xs = codePoints;
                            exit = 3;
                          }
                        } else {
                          exit = 1;
                        }
                      } else {
                        exit = 1;
                      }
                    }
                  } else {
                    style = style$2;
                    colorMode = colorMode$2;
                    colorValue = colorValue$2;
                    exit = 2;
                  }
                } else {
                  exit = 1;
                }
              } else {
                exit = 1;
              }
            } else {
              exit = 1;
            }
          }
          
        } else {
          exit = 1;
        }
      }
    } else {
      var match$20 = codePoints.tl;
      if (match$20 && match$20.hd === 27) {
        var match$21 = match$20.tl;
        if (match$21 && match$21.hd === 91) {
          var match$22 = match$21.tl;
          if (match$22 && match$22.hd === 49) {
            var match$23 = match$22.tl;
            if (match$23 && match$23.hd === 65) {
              var match$24 = match$23.tl;
              if (match$24 && match$24.hd === 27) {
                var match$25 = match$24.tl;
                if (match$25 && match$25.hd === 91) {
                  var match$26 = match$25.tl;
                  if (match$26) {
                    if (match$26.hd === 74) {
                      return [
                              9,
                              /* EraseLine */1
                            ];
                    }
                    exit = 1;
                  } else {
                    exit = 1;
                  }
                } else {
                  exit = 1;
                }
              } else {
                exit = 1;
              }
            } else {
              exit = 1;
            }
          } else {
            exit = 1;
          }
        } else {
          exit = 1;
        }
      } else {
        exit = 1;
      }
    }
  } else {
    exit = 1;
  }
  switch (exit) {
    case 1 :
        console.log("Unknown ANSI sequence:", Belt_List.toArray(codePoints));
        return [
                1,
                undefined
              ];
    case 2 :
        return [
                length,
                Belt_Option.flatMap(get(colorMode, colorValue), (function (colorCss) {
                        var fontCss = get$1(style);
                        if (fontCss !== undefined) {
                          return /* Style */{
                                  _0: Object.assign({}, colorCss, Caml_option.valFromOption(fontCss))
                                };
                        } else {
                          return /* Style */{
                                  _0: colorCss
                                };
                        }
                      }))
              ];
    case 3 :
        return [
                length,
                Belt_Option.flatMap(get(cm1, cv1), (function (colorCss1) {
                        return Belt_Option.flatMap(get(cm2, cv2 + (
                                        Belt_List.length(xs) === 9 ? 10 : 0
                                      ) | 0), (function (colorCss2) {
                                      var css = Object.assign({}, colorCss1, colorCss2);
                                      var fontCss = get$1(style$1);
                                      if (fontCss !== undefined) {
                                        return /* Style */{
                                                _0: Object.assign({}, css, Caml_option.valFromOption(fontCss))
                                              };
                                      } else {
                                        return /* Style */{
                                                _0: css
                                              };
                                      }
                                    }));
                      }))
              ];
    
  }
}

var AnsiCode = {
  fourBitColors: fourBitColors,
  combine: combine,
  addWeight: addWeight,
  addStyle: addStyle,
  int_of_cp: int_of_cp,
  ColorCss: ColorCss,
  FontCss: FontCss,
  parse: parse
};

function text(txt, from, to_) {
  var func = function (param, param$1) {
    return param$1.slice(from, param);
  };
  return {
          TAG: /* Text */0,
          _0: Curry._2(func, to_, txt)
        };
}

function parse$1(txt, length, pos) {
  var go = function (_pos, _prev) {
    while(true) {
      var prev = _prev;
      var pos = _pos;
      var match = pos === length;
      var match$1 = parse(txt, pos);
      if (match) {
        return [
                pos,
                {
                  hd: text(txt, prev, pos),
                  tl: /* [] */0
                }
              ];
      }
      var code = match$1[1];
      if (code !== undefined) {
        var prevElem = text(txt, prev, pos);
        var pos$1 = pos + match$1[0] | 0;
        if (typeof code === "number") {
          switch (code) {
            case /* Clear */0 :
                return [
                        pos$1,
                        {
                          hd: prevElem,
                          tl: /* [] */0
                        }
                      ];
            case /* EraseLine */1 :
                _prev = pos$1;
                _pos = pos$1;
                continue ;
            case /* CarriageReturn */2 :
                return [
                        pos$1,
                        {
                          hd: prevElem,
                          tl: {
                            hd: /* LineBreak */0,
                            tl: /* [] */0
                          }
                        }
                      ];
            
          }
        } else {
          var match$2 = go(pos$1, pos$1);
          var styled = match$2[1];
          if (styled !== undefined) {
            return [
                    match$2[0],
                    {
                      hd: prevElem,
                      tl: {
                        hd: {
                          TAG: /* DocStyle */1,
                          _0: code._0,
                          _1: styled
                        },
                        tl: /* [] */0
                      }
                    }
                  ];
          } else {
            return [
                    pos$1,
                    undefined
                  ];
          }
        }
      } else {
        _pos = pos + 1 | 0;
        continue ;
      }
    };
  };
  return go(pos, pos);
}

var $$Document = {
  text: text,
  parse: parse$1
};

function parse$2(txt) {
  var length = txt.length;
  var match = parse$1(txt, length, 0);
  var doc = match[1];
  var pos = match[0];
  if (doc !== undefined) {
    if (pos === length) {
      return doc;
    } else {
      return Belt_List.concat(doc, parse$2(txt.slice(pos)));
    }
  } else {
    return /* [] */0;
  }
}

function render(doc) {
  var go = function (_xs, _acc) {
    while(true) {
      var acc = _acc;
      var xs = _xs;
      if (!xs) {
        return Belt_List.toArray(Belt_List.reverse(acc));
      }
      var txt = xs.hd;
      if (typeof txt === "number") {
        _acc = Belt_List.add(acc, React.createElement("br", undefined));
        _xs = xs.tl;
        continue ;
      }
      if (txt.TAG) {
        _acc = Belt_List.add(acc, React.createElement("span", {
                  style: txt._0
                }, go(txt._1, /* [] */0)));
        _xs = xs.tl;
        continue ;
      }
      _acc = Belt_List.add(acc, txt._0);
      _xs = xs.tl;
      continue ;
    };
  };
  return go(doc, /* [] */0);
}

function Ansi(Props) {
  var log = Props.log;
  return React.createElement("div", undefined, render(parse$2(log)));
}

var make = Ansi;

var $$default = Ansi;

exports.AnsiCode = AnsiCode;
exports.$$Document = $$Document;
exports.parse = parse$2;
exports.render = render;
exports.make = make;
exports.$$default = $$default;
exports.default = $$default;
exports.__esModule = true;
/* react Not a pure module */
