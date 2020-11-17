'use strict';

var Ansi = require("../src/Ansi.bs.js");
var Process = require("process");
var Caml_obj = require("bs-platform/lib/js/caml_obj.js");

function spec(param) {
  if (Caml_obj.caml_equal(Ansi.parse("Copying blob 15de\r\n\x1b[1A\x1b[JCopied"), {
          hd: {
            TAG: /* Text */0,
            _0: "Copied"
          },
          tl: /* [] */0
        })) {
    return 0;
  } else {
    return 1;
  }
}

Process.exit(spec(undefined));

exports.spec = spec;
/*  Not a pure module */
