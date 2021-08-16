import { spawnSync } from 'child_process';

let revision: string | null;

function getGitRev(): string | null {
  try {
    const spawn = spawnSync('git', ['rev-parse', '--short', 'HEAD']);

    const errorText = spawn.stderr.toString().trim();
    if (errorText) {
      console.log(
        'There was a problem checking for git revision. Perhaps this book is not a git repo?.'
      );
      console.log(`Specific git error: ${errorText}`);
    }

    return spawn.stdout
      .toString()
      .trim()
      .substr(0, 7);
  } catch (err) {
    return null;
  }
}

export function getRevision(): string | null {
  if (revision) return revision;

  revision = getGitRev();
  // todo: parse, dont validate
  return revision;
}