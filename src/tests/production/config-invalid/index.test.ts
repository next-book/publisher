import execa, { ExecaError } from 'execa';

const expectedMultiline = `
The following config fields are not allowed:

selectors
 - Expected array, received string

meta > published
 - Expected number, received string

meta > edition
 - Expected string, received number
`;

it('should throw error when config file contains invalid data', async () => {
  expect.assertions(3);
  try {
    await execa('publish-nb', {
      cwd: __dirname,
    });
  } catch (error) {
    const execaError = error as ExecaError;
    expect(execaError.shortMessage).toBe('Command failed with exit code 1: publish-nb');
    expect(execaError.stderr).toContain(expectedMultiline);
    expect(execaError.stderr).toContain('Error: Invalid config options.\n');
  }
});
