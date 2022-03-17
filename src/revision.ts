import { spawnSync } from 'child_process';
import { Revision } from '../shared/manifest';

let revision: Revision;

function getGitRev(): Revision | never {
  try {
    const spawn = spawnSync('git', ['rev-parse', '--short', 'HEAD']);

    const errorText = spawn.stderr.toString().trim();
    if (errorText) {
      console.log(
        'There was a problem checking for git revision. Perhaps this book is not a git repo?.'
      );
      console.log(`Specific git error: ${errorText}`);
    }

    return spawn.stdout.toString().trim().substr(0, 7);
  } catch (err) {
    throw new Error('There was a problem getting git revision.');
  }
}

export function getRevision(): Revision | never {
  if (revision) return revision;

  revision = getGitRev();
  return revision;
}
