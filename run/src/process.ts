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
