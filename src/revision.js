const { spawnSync } = require('child_process');

let revision;

function getGitRev() {
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

function get() {
  if (revision) return revision;

  revision = getGitRev();
  return revision;
}

module.exports = { get };
