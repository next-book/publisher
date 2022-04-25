import execa, { ExecaError } from 'execa';

const expectedMessage = `Insufficient document content found in:

reading.html
 - Root element "main" is missing.
 - <title> element is missing.
 - <title> text content is missing.

solitude.html
 - <title> element is missing.
 - <title> text content is missing.

sounds.html
 - <title> element is missing.
 - <title> text content is missing.`;

it('should log files with missing titles and main when provided insufficient files', async () => {
  try {
    await execa('publish-nb', {
      cwd: __dirname,
    });
  } catch (error) {
    const execaError = error as ExecaError;
    expect(execaError.shortMessage).toBe('Command failed with exit code 1: publish-nb');
    console.log(execaError.stderr);
    expect(execaError.stderr).toContain(expectedMessage);
    expect(execaError.stderr).toContain('Error: Document content not sufficient.\n');
  }
});
