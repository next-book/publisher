import execa, { ExecaError } from 'execa';

const expectedMultiline = `
The following config fields were invalid:

selectors
 - Expected array, received string

meta > published
 - Expected number, received string

meta > edition
 - Expected string, received number
`;

it('should throw error when config file contains invalid data', async () => {
  try {
    await execa('publish-nb', {
      cwd: __dirname,
    });
  } catch (error) {
    const execaError = error as ExecaError;
    console.log(execaError.stderr);
    expect(execaError.shortMessage).toBe('Command failed with exit code 1: publish-nb');
    expect(execaError.stderr).toContain(expectedMultiline);
    expect(execaError.stderr).toContain('Error: Invalid config options.\n');
  }
});
