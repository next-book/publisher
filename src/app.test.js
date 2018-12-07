const app = require('./app');

const string = `<!DOCTYPE html>
<html>
<head>
  <title>Haha</title>
</head>
<body>
  <p>
    Tohle je test.
    Haha.
  </p>
</body>
</html>`;

const expected = `<!DOCTYPE html><html><head>
  <title>Haha</title>
<link rel="import" href="./spine.json"><meta name="chars" content="19"><meta name="words" content="4"></head>
<body data-nb-words="4" data-nb-chars="19">
  <p class="chunk" data-nb-ref-number="1" id="chunk1" data-nb-words="4" data-nb-chars="19">    <span class="idea" data-nb-ref-number="1" id="idea1" data-nb-words="3" data-nb-chars="14">Tohle je test.</span>    <span class="idea" data-nb-ref-number="2" id="idea2" data-nb-words="1" data-nb-chars="5">Haha.</span>  </p>

</body></html>`;

test('document is mapped', () => {
  expect(app.map([string]).documents[0]).toBe(expected);
});

const expectedArray = [
  `<!DOCTYPE html><html><head>
  <title>Haha</title>
<link rel="import" href="./spine.json"><meta name="chars" content="19"><meta name="words" content="4"><meta name="publicationChars" content="38"><meta name="publicationWords" content="8"><meta name="charOffset" content="0"><meta name="wordOffset" content="0"><meta name="id" content="1"></head>
<body data-nb-words="4" data-nb-chars="19" data-nb-publication-words="8" data-nb-words-offset="0" data-nb-publication-chars="38" data-nb-chars-offset="0" data-nb-document-id="1">
  <p class="chunk" data-nb-ref-number="1" id="chunk1" data-nb-words="4" data-nb-chars="19">    <span class="idea" data-nb-ref-number="1" id="idea1" data-nb-words="3" data-nb-chars="14">Tohle je test.</span>    <span class="idea" data-nb-ref-number="2" id="idea2" data-nb-words="1" data-nb-chars="5">Haha.</span>  </p>

</body></html>`,
  `<!DOCTYPE html><html><head>
  <title>Haha</title>
<link rel="import" href="./spine.json"><meta name="chars" content="19"><meta name="words" content="4"><meta name="publicationChars" content="38"><meta name="publicationWords" content="8"><meta name="charOffset" content="19"><meta name="wordOffset" content="4"><meta name="id" content="2"></head>
<body data-nb-words="4" data-nb-chars="19" data-nb-publication-words="8" data-nb-words-offset="4" data-nb-publication-chars="38" data-nb-chars-offset="19" data-nb-document-id="2">
  <p class="chunk" data-nb-ref-number="1" id="chunk1" data-nb-words="4" data-nb-chars="19">    <span class="idea" data-nb-ref-number="1" id="idea1" data-nb-words="3" data-nb-chars="14">Tohle je test.</span>    <span class="idea" data-nb-ref-number="2" id="idea2" data-nb-words="1" data-nb-chars="5">Haha.</span>  </p>

</body></html>`,
];

test('multiple documents are mapped', () => {
  expect(app.map([string, string]).documents).toEqual(expectedArray);
});
