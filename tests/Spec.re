let spec = () => {
  let raw = "Copying blob 15de\r\n\x1b[1A\x1b[JCopied";
  raw->Ansi.parse == [Text("Copied")] ? 0 : 1;
};

Node.Process.exit(spec());
