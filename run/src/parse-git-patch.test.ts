import * as fs from "fs";
import * as path from "path";
import parse from "./parse-git-patch";

const dataLocation = path.resolve(__dirname, "../example-patches");
const data: Record<string, string> = {};

fs.readdirSync(dataLocation).forEach((fileName) => {
  data[fileName] = fs.readFileSync(
    path.resolve(dataLocation, fileName),
    "utf-8",
  );
});

test("is a function", () => {
  expect(typeof parse).toBe("function");
});

test("parses a simple patch", () => {
  const patchResult = parse(data["one-file.patch"]);
  const diffResult = parse(data["one-file-diff.patch"]);

  expect.assertions(2);

  const expectResultFiles = [
    {
      added: false,
      deleted: false,
      beforeName: "src/events/http/HttpServer.js",
      afterName: "src/events/http/HttpServer.js",
      modifiedLines: [
        {
          tag: "removed",
          removedLineNumber: 773,
          line: "        if (result && typeof result.body !== 'undefined') {",
        },
        {
          tag: "added",
          addedLineNumber: 773,
          line: "        if (typeof result === 'string') {",
        },
        {
          tag: "added",
          addedLineNumber: 774,
          line: "          response.source = JSON.stringify(result)",
        },
        {
          tag: "added",
          addedLineNumber: 775,
          line: "        } else if (result && typeof result.body !== 'undefined') {",
        },
      ],
    },
  ];

  expect(patchResult).toEqual({
    hash: "0f6f88c98fff3afa0289f46bf4eab469f45eebc6",
    date: "Sat, 25 Jan 2020 19:21:35 +0200",
    message: "[PATCH] JSON stringify string responses",
    authorEmail: "13507001+arnas@users.noreply.github.com",
    authorName: "Arnas Gecas",
    files: expectResultFiles,
  });

  expect(diffResult).toEqual({
    files: expectResultFiles,
  });
});

test("parses a complex patch", () => {
  const result = parse(data["many-files.patch"]);

  expect(result).toEqual({
    hash: "a7696becf41fa2b5c9c93770e25a5cce6174d3b8",
    date: "Sat, 11 Jan 2020 08:19:48 -0500",
    message:
      "[PATCH] Fix path/resource/resourcePath in Lambda events, fixes #868",
    authorEmail: "dnalborczyk@gmail.com",
    authorName: "Daniel Nalborczyk",
    files: [
      {
        added: false,
        deleted: false,
        beforeName: "src/events/http/HttpServer.js",
        afterName: "src/events/http/HttpServer.js",
        modifiedLines: [
          {
            tag: "added",
            addedLineNumber: 476,
            line: "              _path,",
          },
          {
            tag: "added",
            addedLineNumber: 492,
            line: "          _path,",
          },
        ],
      },
      {
        added: false,
        deleted: false,
        beforeName: "src/events/http/lambda-events/LambdaIntegrationEvent.js",
        afterName: "src/events/http/lambda-events/LambdaIntegrationEvent.js",
        modifiedLines: [
          {
            tag: "added",
            addedLineNumber: 5,
            line: "  #path = null",
          },
          {
            tag: "removed",
            removedLineNumber: 9,
            line: "  constructor(request, stage, requestTemplate) {",
          },
          {
            tag: "added",
            addedLineNumber: 10,
            line: "  constructor(request, stage, requestTemplate, path) {",
          },
          {
            tag: "added",
            addedLineNumber: 11,
            line: "    this.#path = path",
          },
          {
            tag: "added",
            addedLineNumber: 22,
            line: "      this.#path,",
          },
        ],
      },
      {
        added: false,
        deleted: false,
        beforeName:
          "src/events/http/lambda-events/LambdaProxyIntegrationEvent.js",
        afterName:
          "src/events/http/lambda-events/LambdaProxyIntegrationEvent.js",
        modifiedLines: [
          {
            tag: "added",
            addedLineNumber: 19,
            line: "  #path = null",
          },
          {
            tag: "removed",
            removedLineNumber: 22,
            line: "  constructor(request, stage) {",
          },
          {
            tag: "added",
            addedLineNumber: 23,
            line: "  constructor(request, stage, path) {",
          },
          {
            tag: "added",
            addedLineNumber: 24,
            line: "    this.#path = path",
          },
          {
            tag: "removed",
            removedLineNumber: 109,
            line: "      path,",
          },
          {
            tag: "removed",
            removedLineNumber: 128,
            line: "      path,",
          },
          {
            tag: "added",
            addedLineNumber: 129,
            line: "      path: this.#path,",
          },
          {
            tag: "removed",
            removedLineNumber: 173,
            line: "        path: `/${this.#stage}${this.#request.route.path}`,",
          },
          {
            tag: "added",
            addedLineNumber: 174,
            line: "        path: this.#request.route.path,",
          },
          {
            tag: "removed",
            removedLineNumber: 179,
            line: "        resourcePath: this.#request.route.path,",
          },
          {
            tag: "added",
            addedLineNumber: 180,
            line: "        resourcePath: this.#path,",
          },
          {
            tag: "removed",
            removedLineNumber: 182,
            line: "      resource: this.#request.route.path,",
          },
          {
            tag: "added",
            addedLineNumber: 183,
            line: "      resource: this.#path,",
          },
        ],
      },
      {
        added: false,
        deleted: false,
        beforeName: "src/events/http/lambda-events/VelocityContext.js",
        afterName: "src/events/http/lambda-events/VelocityContext.js",
        modifiedLines: [
          {
            tag: "added",
            addedLineNumber: 39,
            line: "  #path = null",
          },
          {
            tag: "removed",
            removedLineNumber: 43,
            line: "  constructor(request, stage, payload) {",
          },
          {
            tag: "added",
            addedLineNumber: 44,
            line: "  constructor(request, stage, payload, path) {",
          },
          {
            tag: "added",
            addedLineNumber: 45,
            line: "    this.#path = path",
          },
          {
            tag: "removed",
            removedLineNumber: 109,
            line: "        resourcePath: this.#request.route.path,",
          },
          {
            tag: "added",
            addedLineNumber: 111,
            line: "        resourcePath: this.#path,",
          },
        ],
      },
    ],
  });
});

test("parses a renaming patch", () => {
  const result = parse(data["rename-file.patch"]);

  expect(result).toEqual({
    hash: "68ec4bbde5244929afee1b39e09dced6fad1a725",
    date: "Mon, 27 Jan 2020 17:35:01 +0100",
    message: "[PATCH] Rename README",
    authorEmail: "dherault@gmail.com",
    authorName: "=?UTF-8?q?David=20H=C3=A9rault?=",
    files: [
      {
        added: false,
        deleted: false,
        beforeName: "README.md",
        afterName: "README.mdx",
        modifiedLines: [],
      },
    ],
  });
});

test("parses a add and delete patch", () => {
  const result = parse(data["add-and-delete-file.patch"]);

  expect(result).toEqual({
    hash: "74d652cd9cda9849591d1c414caae0af23b19c8d",
    message: "[PATCH] Rename and edit README",
    authorEmail: "dherault@gmail.com",
    authorName: "=?UTF-8?q?David=20H=C3=A9rault?=",
    date: "Mon, 27 Jan 2020 17:36:29 +0100",
    files: [
      {
        added: false,
        deleted: true,
        afterName: "README.md",
        beforeName: "README.md",
        modifiedLines: [
          {
            tag: "removed",
            removedLineNumber: 1,
            line: "# stars-in-motion",
          },
          {
            tag: "removed",
            removedLineNumber: 2,
            line: "",
          },
          {
            tag: "removed",
            removedLineNumber: 3,
            line: "A canvas full of stars",
          },
        ],
      },
      {
        added: true,
        deleted: false,
        afterName: "README.mdx",
        beforeName: "README.mdx",
        modifiedLines: [
          {
            tag: "added",
            addedLineNumber: 1,
            line: "# stars-in-motion",
          },
          {
            tag: "added",
            addedLineNumber: 2,
            line: "",
          },
          {
            tag: "added",
            addedLineNumber: 3,
            line: "A canvas full of stars.",
          },
        ],
      },
    ],
  });
});

test("parses a complex patch 2", () => {
  parse(data["complex.patch"]);
});

test("pases a patch with hyphen deletes", () => {
  const result = parse(data["hlint-yaml.patch"]);

  expect(result).toEqual({
    hash: "89afcd42fb6f2602fbcd03d6e5573b1859347787",
    message: "[PATCH 2/2] Restyled by prettier-yaml",
    authorEmail: "commits@restyled.io",
    authorName: '"Restyled.io"',
    date: "Fri, 17 Jan 2025 18:09:56 +0000",
    files: [
      {
        added: false,
        deleted: false,
        beforeName: "hlint/.hlint.yaml",
        afterName: "hlint/.hlint.yaml",
        modifiedLines: [
          {
            tag: "removed",
            removedLineNumber: 27,
            line: "",
          },
          {
            tag: "removed",
            removedLineNumber: 29,
            line: '- error: {name: ""}',
          },
          {
            tag: "added",
            addedLineNumber: 28,
            line: '- error: { name: "" }',
          },
          {
            tag: "removed",
            removedLineNumber: 32,
            line: '- ignore: {name: "Use module export list"}',
          },
        ],
      },
    ],
  });
});
