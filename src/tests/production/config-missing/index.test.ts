import execa, { ExecaError } from 'execa';

it('should throw error when book config file does not exist', async () => {
  try {
    await execa('publish-nb', {
      cwd: __dirname,
    });
  } catch (error) {
    const execaError = error as ExecaError;
    console.log(execaError.stderr);
    expect(execaError.shortMessage).toBe('Command failed with exit code 1: publish-nb');
    expect(execaError.stderr).toContain(
      'Error: Custom book config in "src/book.json" not found.\n'
    );
  }
});
