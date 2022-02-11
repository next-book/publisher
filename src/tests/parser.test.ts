/**
 * @jest-environment jsdom
 */
import { ParsedObj } from '../structures';
import parse from '../parser';

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

test('Parser returns ParsedObj', () => {
  document.body.innerHTML = `<main><p><q>Vidíš,</q> radoval se trochu nuceně, <q>je to náhoda!
  Mně totiž dnes ráno napadlo, že už jsme se dvacet let neviděli!
  Dvacet let, považ, Rudo!</q></p>
  <p>Pan G. H. Bondy, předseda správní rady, se zastavil.
  Něco ho neodbytně dráždilo.
  Sledoval to, až to nasel na poslední stránce odložených novin.
  Bylo to slovíčko LEZ. Vlastně jen půl slova, protože noviny byly zrovna před L přeloženy.
  Byla to právě ta polovičatost, která se tak neobyčejně vnucovala.
  <q>Nu, bože, bude tam asi ŽELEZ,</q> uvažoval Bondy neurčitě, <q>nebo NELEZ.
  Nebo NÁLEZ. A dusíkové akcie také klesly.
  Strašlivá stagnace.
  Malé, směsně malé poměry.
  – Ale to je nesmysl, kdo by inzeroval nález?
  Spíše ztrátu.
  Má tam asi stát ZTRÁTA, rozhodně.</q></p>
  <p>Poněkud rozladěn rozložil pan G. H. Bondy noviny, aby se zbavil nepříjemného slova.
  Nyní zmizelo docela v šachovnici inzerátů.
  Honil je sloupec za sloupcem; ukrylo se s rozčilující schválností.
  Nyní pan Bondy začal zdola a konečně od pravé strany.
  Protivný NÁLEZ byl ten tam.</p></main>`;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  expect(parse(document.querySelector('main')!, '\n') instanceof ParsedObj).toBe(true);
});
