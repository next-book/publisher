import execa, { ExecaError } from 'execa';

const expectedMessage = `Insufficient document content found in:

index.html
 - The file index.html is missing.`;

it('should throw error when index file is missing', async () => {
  expect.assertions(3);
  try {
    await execa('publish-nb', {
      cwd: __dirname,
    });
  } catch (error) {
    const execaError = error as ExecaError;
    expect(execaError.shortMessage).toBe('Command failed with exit code 1: publish-nb');
    expect(execaError.stderr).toContain(expectedMessage);
    expect(execaError.stderr).toContain('Error: Book documents are not sufficient.\n');
  }
});
