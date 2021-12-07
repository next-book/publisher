import { spawnSync } from 'child_process';
import { Revision } from '../shared/manifest';

let revision: Revision;

function getGitRev(): Revision {
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
    return null;
  }
}

export function getRevision(): Revision {
  if (revision) return revision;

  revision = getGitRev();
  // todo: Avoid returning null. Follow parse, dont validate philosophy instead.
  return revision;
}
