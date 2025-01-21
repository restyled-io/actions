import * as fs from "fs";

import { PullRequestFile } from "./pull-request";
import { Suggestion, suggest } from "./suggest";

class TestCase {
  public readonly name: string;

  private readonly files: string;

  constructor(name: string) {
    this.name = name;
    this.files = `./suggest-test-files/${name}`;
  }

  getActual(): Suggestion[] {
    const baseFilesRaw = this.readFile("files.json");
    const baseFiles: PullRequestFile[] = JSON.parse(baseFilesRaw);
    const patch = this.readFile("restyled.patch");
    return suggest(baseFiles, [], patch);
  }

  getExpected(): Suggestion[] {
    const base = "expected.json";

    if (!this.exists(base)) {
      console.warn(`Writing ${base} from first test run`);
      const suggestions = this.getActual();
      this.writeFile(base, JSON.stringify(suggestions));
    }

    const suggestionsRaw = this.readFile("expected.json");
    const suggestions: Suggestion[] = JSON.parse(suggestionsRaw);
    return suggestions;
  }

  private exists(base: string): boolean {
    return fs.existsSync(`${this.files}/${base}`);
  }

  private readFile(base: string): string {
    return fs.readFileSync(`${this.files}/${base}`).toString();
  }

  private writeFile(base: string, content: string): void {
    return fs.writeFileSync(`${this.files}/${base}`, content);
  }
}

const TEST_CASES = [new TestCase("restyled-io-actions-110")];

describe("suggest", () => {
  test.each(TEST_CASES)("$name", (tc) => {
    const actual = tc.getActual();
    const expected = tc.getExpected();
    expect(actual).toEqual(expected);
  });
});
