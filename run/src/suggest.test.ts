/* Copyright (C) 2025 Patrick Brisbin
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
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
