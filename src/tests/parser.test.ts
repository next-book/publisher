/**
 * @jest-environment jsdom
 */
import { ParsedObj } from '../structures';
import parse from '../parser';

it('should throw when undefined node provided', () => {
  expect(() => parse(undefined as unknown as Node, '')).toThrowError('Expected node undefined.');
});

it('should throw when undefined delimiter provided', () => {
  document.body.innerHTML = `<main></main>`;
  expect(() => parse(document.querySelector('main')!, undefined as unknown as string)).toThrowError(
    'Expected delimiter undefined.'
  );
});

it('should return ParsedObj with empty ideas', () => {
  document.body.innerHTML = `<main></main>`;
  const parsed = parse(document.querySelector('main')!, '');
  const main = document.createElement('main');
  expect(parsed).toStrictEqual(new ParsedObj(main, [], ''));
});

it('should return ParsedObj with one idea piece', () => {
  document.body.innerHTML = `<main>a</main>`;
  const parsed = parse(document.querySelector('main')!, '');
  const main = document.createElement('main');
  const a = document.createTextNode('a');
  main.appendChild(a);
  expect(parsed).toStrictEqual(new ParsedObj(main, [['a']], ''));
});

it('should return ParsedObj with empty ideas', () => {
  document.body.innerHTML = `<main></main>`;
  const parsed = parse(document.querySelector('main')!, '\n');
  const main = document.createElement('main');
  expect(parsed).toStrictEqual(new ParsedObj(main, [], '\n'));
});

it('should contain empty ideas', () => {
  document.body.innerHTML = '<main>\n</main>';
  const parsed = parse(document.querySelector('main')!, '\n');
  expect(parsed).toStrictEqual(new ParsedObj(expect.any(HTMLElement), [], '\n'));
});

it('should return ParsedObj with one idea when one line provided', () => {
  document.body.innerHTML = `<main><p>paragraph 1</p></main>`;
  const parsed = parse(document.querySelector('main')!, '\n');

  const main = document.createElement('main');
  const paragraph1 = document.createElement('p');
  paragraph1.appendChild(document.createTextNode('paragraph 1'));
  main.appendChild(paragraph1);

  expect(parsed).toStrictEqual(new ParsedObj(main, [[paragraph1]], '\n'));
});

it('should return ParsedObj with one idea containing paragraph ParsedObj', () => {
  document.body.innerHTML = `<main><p>paragraph 1</p></main>`;
  const parsed = parse(document.querySelector('main')!, '');

  const main = document.createElement('main');
  const paragraph1 = document.createElement('p');
  paragraph1.appendChild(document.createTextNode('paragraph 1'));
  main.appendChild(paragraph1);

  expect(parsed).toStrictEqual(
    new ParsedObj(
      main,
      [
        [
          new ParsedObj(
            paragraph1,
            [['p'], ['a'], ['r'], ['a'], ['g'], ['r'], ['a'], ['p'], ['h'], ['1']],
            ''
          ),
        ],
      ],
      ''
    )
  );
});

it('should return ParsedObj with one idea when one line provided', () => {
  document.body.innerHTML = `<main><p>paragraph 1</p><p>paragraph 2</p></main>`;
  const parsed = parse(document.querySelector('main')!, '\n');

  const main = document.createElement('main');
  const paragraph1 = document.createElement('p');
  paragraph1.appendChild(document.createTextNode('paragraph 1'));
  const paragraph2 = document.createElement('p');
  paragraph2.appendChild(document.createTextNode('paragraph 2'));
  main.appendChild(paragraph1);
  main.appendChild(paragraph2);

  expect(parsed).toStrictEqual(
    new ParsedObj(expect.any(HTMLElement), [[paragraph1, paragraph2]], '\n')
  );
});

it('should return ParsedObj with one idea', () => {
  document.body.innerHTML = `<main>
    <p>paragraph 1</p>
  </main>`;
  const parsed = parse(document.querySelector('main')!, '\n');

  const paragraph1 = document.createElement('p');
  paragraph1.appendChild(document.createTextNode('paragraph 1'));

  expect(parsed).toStrictEqual(new ParsedObj(expect.any(HTMLElement), [[' ', paragraph1]], '\n'));
});

it('should return ParsedObj with two ideas', () => {
  document.body.innerHTML = `<main>
    <p>paragraph 1</p>
    <p>paragraph 2</p>
  </main>`;
  const parsed = parse(document.querySelector('main')!, '\n');

  const paragraph1 = document.createElement('p');
  paragraph1.appendChild(document.createTextNode('paragraph 1'));
  const paragraph2 = document.createElement('p');
  paragraph2.appendChild(document.createTextNode('paragraph 2'));

  expect(parsed).toStrictEqual(
    new ParsedObj(
      expect.any(HTMLElement),
      [
        [' ', paragraph1],
        [' ', paragraph2],
      ],
      '\n'
    )
  );
});

it('should return ParsedObj with 4 ideas', () => {
  document.body.innerHTML = `<main>
    <p>paragraph 1</p>
    <p>paragraph 2</p>
    <p>paragraph 3</p>
    <p>paragraph 4</p>
  </main>`;
  const parsed = parse(document.querySelector('main')!, '\n');

  const paragraph1 = document.createElement('p');
  paragraph1.appendChild(document.createTextNode('paragraph 1'));
  const paragraph2 = document.createElement('p');
  paragraph2.appendChild(document.createTextNode('paragraph 2'));
  const paragraph3 = document.createElement('p');
  paragraph3.appendChild(document.createTextNode('paragraph 3'));
  const paragraph4 = document.createElement('p');
  paragraph4.appendChild(document.createTextNode('paragraph 4'));

  expect(parsed).toStrictEqual(
    new ParsedObj(
      expect.any(HTMLElement),
      [
        [' ', paragraph1],
        [' ', paragraph2],
        [' ', paragraph3],
        [' ', paragraph4],
      ],
      '\n'
    )
  );
});

it('should return ParsedObj with one idea when one line provided', () => {
  document.body.innerHTML = `<main><p><i>paragraph 1</i></p></main>`;
  const parsed = parse(document.querySelector('main')!, '\n');

  const main = document.createElement('main');
  const paragraph = document.createElement('p');
  const italic = document.createElement('i');
  italic.appendChild(document.createTextNode('paragraph 1'));
  paragraph.appendChild(italic);
  main.appendChild(paragraph);

  expect(parsed).toStrictEqual(new ParsedObj(main, [[paragraph]], '\n'));
});

it('should return ParsedObj with one idea when one line provided', () => {
  document.body.innerHTML = `<main><p><i>paragraph 1</i></p></main>`;
  const parsed = parse(document.querySelector('main')!, '\n');

  const main = document.createElement('main');
  const paragraph = document.createElement('p');
  const italic = document.createElement('i');
  italic.appendChild(document.createTextNode('paragraph 1'));
  paragraph.appendChild(italic);
  main.appendChild(paragraph);

  expect(parsed).toStrictEqual(new ParsedObj(main, [[paragraph]], '\n'));
});

it('should return nested ParsedObj when linebreak provided', () => {
  document.body.innerHTML = `<main><p><i>para\ngraph 1</i></p></main>`;
  const parsed = parse(document.querySelector('main')!, '\n');

  const main = document.createElement('main');
  const paragraph = document.createElement('p');
  const italic = document.createElement('i');
  italic.appendChild(document.createTextNode('para\ngraph 1'));
  paragraph.appendChild(italic);
  main.appendChild(paragraph);

  expect(parsed).toStrictEqual(
    new ParsedObj(
      main,
      [[new ParsedObj(paragraph, [[new ParsedObj(italic, [['para'], ['graph 1']], '\n')]], '\n')]],
      '\n'
    )
  );
});

it('should return nested ParsedObj when anchor provided', () => {
  document.body.innerHTML = `<main><p><i>paragraph with <a>anchor reference</a></i></p></main>`;
  const parsed = parse(document.querySelector('main')!, '\n');

  const main = document.createElement('main');
  const paragraph = document.createElement('p');
  const italic = document.createElement('i');
  const anchor = document.createElement('a');
  anchor.appendChild(document.createTextNode('anchor reference'));
  italic.appendChild(document.createTextNode('paragraph with '));
  italic.appendChild(anchor);
  paragraph.appendChild(italic);
  main.appendChild(paragraph);

  expect(parsed).toStrictEqual(new ParsedObj(main, [[paragraph]], '\n'));
});

it('should return ParsedObj with ideas.length=1 when minified (one-line) HTML provided', () => {
  document.body.innerHTML =
    '<main><p><q>Vidíš,</q> radoval se trochu nuceně, <q>je to náhoda! Mně totiž dnes ráno napadlo, že už jsme se dvacet let neviděli! Dvacet let, považ, Rudo!</q></p><p>Pan G. H. Bondy, předseda správní rady, se zastavil. Něco ho neodbytně dráždilo. Sledoval to, až to nasel na poslední stránce odložených novin. Bylo to slovíčko LEZ. Vlastně jen půl slova, protože noviny byly zrovna před L přeloženy. Byla to právě ta polovičatost, která se tak neobyčejně vnucovala. <q>Nu, bože, bude tam asi ŽELEZ,</q> uvažoval Bondy neurčitě, <q>nebo NELEZ. Nebo NÁLEZ. A dusíkové akcie také klesly. Strašlivá stagnace. Malé, směsně malé poměry. – Ale to je nesmysl, kdo by inzeroval nález? Spíše ztrátu. Má tam asi stát ZTRÁTA, rozhodně.</q></p><p>Poněkud rozladěn rozložil pan G. H. Bondy noviny, aby se zbavil nepříjemného slova. Nyní zmizelo docela v šachovnici inzerátů. Honil je sloupec za sloupcem; ukrylo se s rozčilující schválností. Nyní pan Bondy začal zdola a konečně od pravé strany. Protivný NÁLEZ byl ten tam.</p></main>';
  const parsed = parse(document.querySelector('main')!, '\n');

  const main = document.createElement('main');
  const paragraph1 = document.createElement('p');
  paragraph1.innerHTML =
    '<q>Vidíš,</q> radoval se trochu nuceně, <q>je to náhoda! Mně totiž dnes ráno napadlo, že už jsme se dvacet let neviděli! Dvacet let, považ, Rudo!</q>';
  const paragraph2 = document.createElement('p');
  paragraph2.innerHTML =
    'Pan G. H. Bondy, předseda správní rady, se zastavil. Něco ho neodbytně dráždilo. Sledoval to, až to nasel na poslední stránce odložených novin. Bylo to slovíčko LEZ. Vlastně jen půl slova, protože noviny byly zrovna před L přeloženy. Byla to právě ta polovičatost, která se tak neobyčejně vnucovala. <q>Nu, bože, bude tam asi ŽELEZ,</q> uvažoval Bondy neurčitě, <q>nebo NELEZ. Nebo NÁLEZ. A dusíkové akcie také klesly. Strašlivá stagnace. Malé, směsně malé poměry. – Ale to je nesmysl, kdo by inzeroval nález? Spíše ztrátu. Má tam asi stát ZTRÁTA, rozhodně.</q>';
  const paragraph3 = document.createElement('p');
  paragraph3.innerHTML =
    'Poněkud rozladěn rozložil pan G. H. Bondy noviny, aby se zbavil nepříjemného slova. Nyní zmizelo docela v šachovnici inzerátů. Honil je sloupec za sloupcem; ukrylo se s rozčilující schválností. Nyní pan Bondy začal zdola a konečně od pravé strany. Protivný NÁLEZ byl ten tam.';
  main.appendChild(paragraph1);
  main.appendChild(paragraph2);
  main.appendChild(paragraph3);
  expect(parsed).toStrictEqual(new ParsedObj(main, [[paragraph1, paragraph2, paragraph3]], '\n'));
});

test('Parser returns nested parsed object when multilne html provided', () => {
  document.body.innerHTML =
    '<main><p><q>Vidíš,</q> radoval se trochu nuceně, <q>je to náhoda!\nMně totiž dnes ráno napadlo, že už jsme se dvacet let neviděli!\nDvacet let, považ, Rudo!</q></p>\n<p>Pan G. H. Bondy, předseda správní rady, se zastavil.\nNěco ho neodbytně dráždilo.\nSledoval to, až to nasel na poslední stránce odložených novin.\nBylo to slovíčko LEZ. Vlastně jen půl slova, protože noviny byly zrovna před L přeloženy.\nByla to právě ta polovičatost, která se tak neobyčejně vnucovala.\n<q>Nu, bože, bude tam asi ŽELEZ,</q> uvažoval Bondy neurčitě, <q>nebo NELEZ.\nNebo NÁLEZ. A dusíkové akcie také klesly.\nStrašlivá stagnace.\nMalé, směsně malé poměry.\n– Ale to je nesmysl, kdo by inzeroval nález?\nSpíše ztrátu.\nMá tam asi stát ZTRÁTA, rozhodně.</q></p></main>';
  const parsed = parse(document.querySelector('main')!, '\n');

  const main = document.createElement('main');
  const paragraph1 = document.createElement('p');
  const quote1 = document.createElement('q');
  quote1.appendChild(document.createTextNode('Vidíš,'));
  paragraph1.appendChild(quote1);
  paragraph1.appendChild(document.createTextNode(' radoval se trochu nuceně, '));
  const quote2 = document.createElement('q');
  quote2.appendChild(
    document.createTextNode(
      'je to náhoda!\nMně totiž dnes ráno napadlo, že už jsme se dvacet let neviděli!\nDvacet let, považ, Rudo!'
    )
  );
  paragraph1.appendChild(quote2);
  main.appendChild(paragraph1);

  main.appendChild(document.createTextNode('\n'));

  const paragraph2 = document.createElement('p');
  paragraph2.appendChild(
    document.createTextNode(
      'Pan G. H. Bondy, předseda správní rady, se zastavil.\nNěco ho neodbytně dráždilo.\nSledoval to, až to nasel na poslední stránce odložených novin.\nBylo to slovíčko LEZ. Vlastně jen půl slova, protože noviny byly zrovna před L přeloženy.\nByla to právě ta polovičatost, která se tak neobyčejně vnucovala.\n'
    )
  );
  const quote3 = document.createElement('q');
  quote3.appendChild(document.createTextNode('Nu, bože, bude tam asi ŽELEZ,'));
  paragraph2.appendChild(quote3);
  paragraph2.appendChild(document.createTextNode(' uvažoval Bondy neurčitě, '));
  const quote4 = document.createElement('q');
  quote4.appendChild(
    document.createTextNode(
      'nebo NELEZ.\nNebo NÁLEZ. A dusíkové akcie také klesly.\nStrašlivá stagnace.\nMalé, směsně malé poměry.\n– Ale to je nesmysl, kdo by inzeroval nález?\nSpíše ztrátu.\nMá tam asi stát ZTRÁTA, rozhodně.'
    )
  );
  paragraph2.appendChild(quote4);

  main.appendChild(paragraph2);
  expect(parsed).toStrictEqual(
    new ParsedObj(
      main,
      [
        [
          new ParsedObj(
            paragraph1,
            [
              [quote1, ' radoval se trochu nuceně,'],
              [
                new ParsedObj(
                  quote2,
                  [
                    ['je to náhoda!'],
                    ['Mně totiž dnes ráno napadlo, že už jsme se dvacet let neviděli!'],
                    ['Dvacet let, považ, Rudo!'],
                  ],
                  '\n'
                ),
              ],
            ],
            '\n'
          ),
        ],
        [
          new ParsedObj(
            paragraph2,
            [
              ['Pan G. H. Bondy, předseda správní rady, se zastavil.'],
              ['Něco ho neodbytně dráždilo.'],
              ['Sledoval to, až to nasel na poslední stránce odložených novin.'],
              [
                'Bylo to slovíčko LEZ. Vlastně jen půl slova, protože noviny byly zrovna před L přeloženy.',
              ],
              ['Byla to právě ta polovičatost, která se tak neobyčejně vnucovala.'],
              [quote3, ' uvažoval Bondy neurčitě,'],
              [
                new ParsedObj(
                  quote4,
                  [
                    ['nebo NELEZ.'],
                    ['Nebo NÁLEZ. A dusíkové akcie také klesly.'],
                    ['Strašlivá stagnace.'],
                    ['Malé, směsně malé poměry.'],
                    ['– Ale to je nesmysl, kdo by inzeroval nález?'],
                    ['Spíše ztrátu.'],
                    ['Má tam asi stát ZTRÁTA, rozhodně.'],
                  ],
                  '\n'
                ),
              ],
            ],
            '\n'
          ),
        ],
      ],
      '\n'
    )
  );
});
