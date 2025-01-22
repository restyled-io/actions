import * as fs from "fs";

import { PullRequestFile } from "./pull-request";
import { suggest } from "./suggest";

describe("suggest", () => {
  const cases = ["test-files/suggest/restyled-io-actions-110"];

  test.each(cases)("%s", (path) => {
    const baseFilesRaw = fs.readFileSync(`${path}/files.json`).toString();
    const baseFiles: PullRequestFile[] = JSON.parse(baseFilesRaw);
    const patch = fs.readFileSync(`${path}/restyled.patch`).toString();

    const suggestions = suggest(baseFiles, [], patch);

    expect(suggestions).toMatchSnapshot();
  });
});
