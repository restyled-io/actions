import { Hunks } from "./hunk";
import { PullRequestFile, fromPullRequestFile } from "./diff";

type TestCase = {
  name: string;
  file: PullRequestFile;
  expected: Hunks<{ lineNumber: number }>;
};

describe("fromPullRequestFile", () => {
  const cases: TestCase[] = [
    {
      name: "Added file",
      file: {
        filename: ".headroom.yaml",
        patch: [
          "@@ -0,0 +1,52 @@",
          "+## This is the configuration file for Headroom.",
          "+## See https://github.com/vaclavsvejcar/headroom for more details.",
          "+",
          "+## Defines with which version of Headroom this configuration is compatible.",
          "+## Headroom uses this field to detect whether your configuration doesn't need",
          "+## any manual migration steps in case that it's older than your current Headroom",
          "+## version. You don't need to touch this field unless explicitly stated in",
          "+## migration guide during upgrading Headroom to new version.",
          "+version: 0.4.3.0",
          "+",
          "+## Defines the behaviour how to handle license headers, possible options are:",
          "+##",
          "+##   - add     = (default) adds license header to files with no existing header",
          "+##               (same as '-a|--add-headers' command line argument)",
          "+##   - drop    = drops existing license header from without replacement",
          "+##               (same as '-d|--drop-headers' command line argument)",
          "+##   - replace = adds or replaces existing license header",
          "+##               (same as '-r|--replace-headers' command line argument)",
          "+run-mode: add",
          "+",
          "+## Paths to source code files (either files or directories),",
          "+## same as '-s|--source-path=PATH' command line argument (can be used multiple",
          "+## times for more than one path).",
          "+source-paths:",
          "+  - app",
          "+  - src",
          "+  - test",
          "+",
          "+## If set to 'true', Headroom tries to detect whether any VCS (like GIT) is used",
          "+## for current project and if yes, it loads rules for ignored files and excludes",
          "+## all source paths that matches these rules.",
          "+exclude-ignored-paths: false",
          "+",
          "+## Paths to template files (either files or directories),",
          "+## same as '-t|--template-path=PATH' command line argument (can be used multiple",
          "+## times for more than one path).",
          "+template-paths:",
          "+  - headroom-templates",
          "+",
          "+## Variables (key-value) to replace in templates,",
          "+## same as '-v|--variable=\"KEY=VALUE\"' command line argument (can be used",
          "+## multiple times for more than one path).",
          "+variables:",
          "+  author: Patrick Brisbin",
          "+  email: pbrisbin@gmail.com",
          "+  project: Restyler",
          '+  year: "2024"',
          "+",
          "+license-headers:",
          "+  haskell:",
          "+    line-comment:",
          '+      prefixed-by: "^--"',
        ].join("\n"),
      },
      expected: new Hunks(linesFromTo(1, 52)),
    },
    {
      name: "Modified file",
      file: {
        filename: "test/SpecHelper.hs",
        patch: [
          "@@ -1,5 +1,13 @@ {-# LANGUAGE FieldSelectors #-}",
          " ",
          "+-- |",
          "+--",
          "+-- Module      : SpecHelper",
          "+-- Copyright   : (c) 2024 Patrick Brisbin",
          "+-- License     : AGPL-3",
          "+-- Maintainer  : pbrisbin@gmail.com",
          "+-- Stability   : experimental",
          "+-- Portability : POSIX",
          " module SpecHelper",
          "   ( someRestyler",
          " ",
        ].join("\n"),
      },
      expected: new Hunks(linesFromTo(2, 9)),
    },
    {
      name: "Deleted file",
      file: {
        filename: "LICENSE",
        patch: [
          "@@ -1,22 +0,0 @@",
          "-“Commons Clause” License Condition v1.0",
          "-",
          "-The Software is provided to you by the Licensor under the License, as defined",
          "-below, subject to the following condition.",
          "-",
          "-Without limiting other conditions in the License, the grant of rights under the",
          "-License will not include, and the License does not grant to you, the right to",
          "-Sell the Software.",
          "-",
          "-For purposes of the foregoing, “Sell” means practicing any or all of the rights",
          "-granted to you under the License to provide to third parties, for a fee or other",
          "-consideration (including without limitation fees for hosting or consulting/",
          "-support services related to the Software), a product or service whose value",
          "-derives, entirely or substantially, from the functionality of the Software. Any",
          "-license notice or attribution required by the License must also include this",
          "-Commons Cause License Condition notice.",
          "-",
          "-Software: Restyled",
          "-",
          "-License: MIT (https://opensource.org/licenses/MIT)",
          "-",
          "-Licensor: Patrick Brisbin",
        ].join("\n"),
      },
      expected: new Hunks([]),
    },
  ];

  test.each(cases)("$name", async ({ expected, file }) => {
    const changedFile = fromPullRequestFile(file);
    expect(changedFile.filename).toEqual(file.filename);
    expect(changedFile.additions).toEqual(expected);
  });
});

function linesFromTo(start: number, end: number): { lineNumber: number }[] {
  const lines: { lineNumber: number }[] = [];

  for (let i = start; i <= end; i++) {
    lines.push({ lineNumber: i });
  }

  return lines;
}
