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
import * as core from "@actions/core";

export type Outputs = {
  success: boolean;
  differences: boolean;
  gitPatch: string;
  restyledBase: string;
  restyledHead: string;
  restyledTitle: string;
  restyledBody: string;
};

export function setOutputs(outputs: Outputs): void {
  core.setOutput("success", outputs.success ? "true" : "false");
  core.setOutput("differences", outputs.differences ? "true" : "false");
  core.setOutput("git-patch", outputs.gitPatch);
  core.setOutput("restyled-base", outputs.restyledBase);
  core.setOutput("restyled-head", outputs.restyledHead);
  core.setOutput("restyled-title", outputs.restyledTitle);
  core.setOutput("restyled-body", outputs.restyledBody);
}
