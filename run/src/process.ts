/* Copyright (C) 2024 Patrick Brisbin
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
import * as exec from "@actions/exec";

export async function runProcess(cmd: string, args: string[]): Promise<number> {
  return await exec.exec(cmd, args, { ignoreReturnCode: true });
}

export async function readProcess(
  cmd: string,
  args: string[],
): Promise<string> {
  let stdout = "";
  let stderr = "";

  try {
    await exec.exec(cmd, args, {
      silent: true,
      listeners: {
        stdout: (data: Buffer) => {
          stdout += data.toString();
        },
        stderr: (data: Buffer) => {
          stderr += data.toString();
        },
      },
    });
  } catch (ex) {
    console.error("Crashing due to exec failure");
    console.error(`Captured stdout: ${stdout}`);
    console.error(`Captured stderr: ${stderr}`);
    throw ex;
  }

  return stdout.replace(/\n$/, "");
}
