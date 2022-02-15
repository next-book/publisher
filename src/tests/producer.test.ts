/**
 * @jest-environment jsdom
 */

import { Separator } from '../parser';
import produce, { anchorObject, containsParsedObj, produceHTMLSpanIdea } from '../producer';
import { IdeaPiece } from '../structures';
import ParsedObj from '../structures/parsedobj';

describe('produce', () => {
  it('should throw when provided with undefined document', () => {
    expect(() =>
      produce(undefined as unknown as Document, new ParsedObj(document.body, [], '\n'))
    ).toThrowError('Expected document undefined.');
  });

  it('should throw when provided with undefined parsedObj', () => {
    expect(() => produce(document, undefined as unknown as ParsedObj)).toThrowError(
      'Expected parsedObj undefined.'
    );
  });

  it('should produce node with no children', () => {
    const parsed = new ParsedObj(document.createElement('main'), [], '');
    expect(produce(document, parsed).hasChildNodes()).toBe(false);
  });

  it('should produce node with empty single idea', () => {
    const parsed = new ParsedObj(document.createElement('main'), [[]], '\n');

    const main = document.createElement('main');
    const span = document.createElement('span');
    span.classList.add('idea');
    main.appendChild(span);

    expect(produce(document, parsed)).toStrictEqual(main);
  });

  it('should produce node with single idea that contains newline', () => {
    const parsed = new ParsedObj(document.createElement('main'), [['\n']], '\n');

    const main = document.createElement('main');
    const span = document.createElement('span');
    span.classList.add('idea');
    span.appendChild(document.createTextNode('\n'));
    main.appendChild(span);

    expect(produce(document, parsed)).toStrictEqual(main);
  });

  it('should produce node with two ideas, each containin newline, separated by newline child', () => {
    const parsed = new ParsedObj(document.createElement('main'), [['\n'], ['\n']], '\n');

    const main = document.createElement('main');

    const idea1 = document.createElement('span');
    idea1.classList.add('idea');
    idea1.appendChild(document.createTextNode('\n'));
    main.appendChild(idea1);

    main.appendChild(document.createTextNode('\n'));

    const idea2 = document.createElement('span');
    idea2.classList.add('idea');
    idea2.appendChild(document.createTextNode('\n'));
    main.appendChild(idea2);

    expect(produce(document, parsed)).toStrictEqual(main);
  });

  it('should produce node with single idea', () => {
    const parsed = new ParsedObj(document.createElement('main'), [['content']], '\n');

    const main = document.createElement('main');
    const span = document.createElement('span');
    span.classList.add('idea');
    span.appendChild(document.createTextNode('content'));
    main.appendChild(span);

    expect(produce(document, parsed)).toStrictEqual(main);
  });

  it('should produce node with single idea with two lines: main>span.idea*1>{first\\nsecond}', () => {
    const parsed = new ParsedObj(document.createElement('main'), [['first', 'second']], '\n');

    const main = document.createElement('main');
    const idea = document.createElement('span');
    idea.classList.add('idea');
    idea.appendChild(document.createTextNode('first'));
    idea.appendChild(document.createTextNode('second'));
    main.appendChild(idea);

    expect(produce(document, parsed)).toStrictEqual(main);
  });

  it('should produce node with two ideas (one multi-child, one single-child) separated with newline', () => {
    const parsed = new ParsedObj(document.createElement('main'), [['a', 'b'], ['c']], '\n');

    const main = document.createElement('main');

    const idea1 = document.createElement('span');
    idea1.classList.add('idea');
    idea1.appendChild(document.createTextNode('a'));
    idea1.appendChild(document.createTextNode('b'));
    main.appendChild(idea1);

    main.appendChild(document.createTextNode('\n'));

    const idea2 = document.createElement('span');
    idea2.classList.add('idea');
    idea2.appendChild(document.createTextNode('c'));
    main.appendChild(idea2);

    expect(produce(document, parsed)).toStrictEqual(main);
  });

  it('should produce empty anchor without idea when provided parsedobj idea', () => {
    const parsedA = new ParsedObj(document.createElement('a'), [], '\n');
    const parsed = new ParsedObj(document.createElement('main'), [[parsedA]], '\n');

    const main = document.createElement('main');
    const anchor = document.createElement('a');
    main.appendChild(anchor);

    expect(produce(document, parsed)).toStrictEqual(main);
  });

  it('should produce empty idea-less anchors and text NOT separated by newline when provided empty parsed objects', () => {
    const parsedA = new ParsedObj(document.createElement('a'), [], '\n');
    const parsedB = new ParsedObj(document.createElement('a'), [], '\n');
    const parsed = new ParsedObj(
      document.createElement('main'),
      [[parsedA, parsedB, 'content']],
      '\n'
    );

    const main = document.createElement('main');
    const anchorA = document.createElement('a');
    const anchorB = document.createElement('a');
    main.appendChild(anchorA);
    main.appendChild(anchorB);
    main.appendChild(document.createTextNode('content'));

    expect(produce(document, parsed)).toStrictEqual(main);
  });

  it('should produce empty idea-less anchors NOT separated by newline when provided empty parsed objects', () => {
    const parsedA = new ParsedObj(document.createElement('a'), [], '\n');
    const parsedB = new ParsedObj(document.createElement('a'), [], '\n');
    const parsed = new ParsedObj(document.createElement('main'), [[parsedA, parsedB], ['c']], '\n');

    const main = document.createElement('main');
    const anchorA = document.createElement('a');
    const anchorB = document.createElement('a');
    main.appendChild(anchorA);
    main.appendChild(anchorB);
    main.appendChild(document.createTextNode('\n'));
    const idea = document.createElement('span');
    idea.classList.add('idea');
    idea.appendChild(document.createTextNode('c'));
    main.appendChild(idea);

    expect(produce(document, parsed)).toStrictEqual(main);
  });

  it('should produce anchor with empty span idea', () => {
    const parsedA = new ParsedObj(document.createElement('a'), [[]], '\n');
    const parsed = new ParsedObj(document.createElement('main'), [[parsedA]], '\n');

    const main = document.createElement('main');
    const idea = document.createElement('span');
    idea.classList.add('idea');
    const anchor = document.createElement('a');
    anchor.appendChild(idea);
    main.appendChild(anchor);

    expect(produce(document, parsed)).toStrictEqual(main);
  });

  it('should produce anchor that contains idea span', () => {
    const parsedA = new ParsedObj(
      document.createElement('a'),
      [['single child idea in anchor']],
      '\n'
    );
    const parsed = new ParsedObj(document.createElement('main'), [[parsedA]], '\n');

    const main = document.createElement('main');

    const idea = document.createElement('span');
    idea.classList.add('idea');
    idea.appendChild(document.createTextNode('single child idea in anchor'));

    const anchor = document.createElement('a');
    anchor.appendChild(idea);

    main.appendChild(anchor);

    expect(produce(document, parsed)).toStrictEqual(main);
  });

  it('should produce anchor that contains multichild idea', () => {
    const parsedA = new ParsedObj(
      document.createElement('a'),
      [['multi-child', 'idea', 'in', 'anchor']],
      '\n'
    );
    const parsed = new ParsedObj(document.createElement('main'), [[parsedA]], '\n');

    const main = document.createElement('main');

    const idea = document.createElement('span');
    idea.classList.add('idea');
    idea.appendChild(document.createTextNode('multi-child'));
    idea.appendChild(document.createTextNode('idea'));
    idea.appendChild(document.createTextNode('in'));
    idea.appendChild(document.createTextNode('anchor'));

    const anchor = document.createElement('a');
    anchor.appendChild(idea);

    main.appendChild(anchor);

    expect(produce(document, parsed)).toStrictEqual(main);
  });

  it('should produce single-child and multichild ideas separated by newline', () => {
    const parsed = new ParsedObj(
      document.createElement('main'),
      [['single child idea before new line'], ['multi', 'child', 'idea', 'after', 'new', 'line']],
      '\n'
    );

    const main = document.createElement('main');

    const single = document.createElement('span');
    single.classList.add('idea');
    single.appendChild(document.createTextNode('single child idea before new line'));
    main.appendChild(single);

    main.appendChild(document.createTextNode('\n'));

    const multi = document.createElement('span');
    multi.classList.add('idea');
    multi.appendChild(document.createTextNode('multi'));
    multi.appendChild(document.createTextNode('child'));
    multi.appendChild(document.createTextNode('idea'));
    multi.appendChild(document.createTextNode('after'));
    multi.appendChild(document.createTextNode('new'));
    multi.appendChild(document.createTextNode('line'));
    main.appendChild(multi);

    expect(produce(document, parsed)).toStrictEqual(main);
  });

  it('should produce nested nested node, when provided nested ParsedObj containing other parsed Objects', () => {
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

    // parsed objects
    const parsedQuote2 = new ParsedObj(
      quote2,
      [
        ['je to náhoda!'],
        ['Mně totiž dnes ráno napadlo, že už jsme se dvacet let neviděli!'],
        ['Dvacet let, považ, Rudo!'],
      ],
      '\n'
    );

    const parsedQuote4 = new ParsedObj(
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
    );

    const parsedParagraph1 = new ParsedObj(
      paragraph1,
      [[quote1, ' radoval se trochu nuceně,'], [parsedQuote2]],
      '\n'
    );

    const parsedParagraph2 = new ParsedObj(
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
        [parsedQuote4],
      ],
      '\n'
    );

    const parsed = new ParsedObj(main, [[parsedParagraph1], [parsedParagraph2]], '\n');

    // quote2
    const producedQuote2 = document.createElement('q');

    const q2i1 = document.createElement('span');
    q2i1.classList.add('idea');
    q2i1.appendChild(document.createTextNode('je to náhoda!'));
    producedQuote2.appendChild(q2i1);
    producedQuote2.appendChild(document.createTextNode('\n'));

    const q2i2 = document.createElement('span');
    q2i2.classList.add('idea');
    q2i2.appendChild(
      document.createTextNode('Mně totiž dnes ráno napadlo, že už jsme se dvacet let neviděli!')
    );
    producedQuote2.appendChild(q2i2);
    producedQuote2.appendChild(document.createTextNode('\n'));

    const q2i3 = document.createElement('span');
    q2i3.classList.add('idea');
    q2i3.appendChild(document.createTextNode('Dvacet let, považ, Rudo!'));
    producedQuote2.appendChild(q2i3);

    // quote4
    const producedQuote4 = document.createElement('q');

    // quote ideas ...
    const q4i1 = document.createElement('span');
    q4i1.classList.add('idea');
    q4i1.appendChild(document.createTextNode('nebo NELEZ.'));
    producedQuote4.appendChild(q4i1);
    producedQuote4.appendChild(document.createTextNode('\n'));

    const q4i2 = document.createElement('span');
    q4i2.classList.add('idea');
    q4i2.appendChild(document.createTextNode('Nebo NÁLEZ. A dusíkové akcie také klesly.'));
    producedQuote4.appendChild(q4i2);
    producedQuote4.appendChild(document.createTextNode('\n'));

    const q4i3 = document.createElement('span');
    q4i3.classList.add('idea');
    q4i3.appendChild(document.createTextNode('Strašlivá stagnace.'));
    producedQuote4.appendChild(q4i3);
    producedQuote4.appendChild(document.createTextNode('\n'));

    const q4i4 = document.createElement('span');
    q4i4.classList.add('idea');
    q4i4.appendChild(document.createTextNode('Malé, směsně malé poměry.'));
    producedQuote4.appendChild(q4i4);
    producedQuote4.appendChild(document.createTextNode('\n'));

    const q4i5 = document.createElement('span');
    q4i5.classList.add('idea');
    q4i5.appendChild(document.createTextNode('– Ale to je nesmysl, kdo by inzeroval nález?'));
    producedQuote4.appendChild(q4i5);
    producedQuote4.appendChild(document.createTextNode('\n'));

    const q4i6 = document.createElement('span');
    q4i6.classList.add('idea');
    q4i6.appendChild(document.createTextNode('Spíše ztrátu.'));
    producedQuote4.appendChild(q4i6);
    producedQuote4.appendChild(document.createTextNode('\n'));

    const q4i7 = document.createElement('span');
    q4i7.classList.add('idea');
    q4i7.appendChild(document.createTextNode('Má tam asi stát ZTRÁTA, rozhodně.'));
    producedQuote4.appendChild(q4i7);

    // paragraph1
    const producedParagraph1 = document.createElement('p');
    // paragraph1 idea1 children quote
    const q1i1 = document.createElement('span');
    q1i1.classList.add('idea');
    const producedQuote1 = document.createElement('q');
    producedQuote1.appendChild(document.createTextNode('Vidíš,'));
    q1i1.appendChild(producedQuote1);
    // paragraph1 idea1 children text
    q1i1.appendChild(document.createTextNode(' radoval se trochu nuceně,'));
    producedParagraph1.appendChild(q1i1);
    // paragraph1 idea separation
    producedParagraph1.appendChild(document.createTextNode('\n'));
    // paragraph1 add parsed quote
    producedParagraph1.appendChild(producedQuote2);

    // paragraph2
    const producedParagraph2 = document.createElement('p');

    // paragraph2 ideas
    const p2i1 = document.createElement('span');
    p2i1.classList.add('idea');
    p2i1.appendChild(
      document.createTextNode('Pan G. H. Bondy, předseda správní rady, se zastavil.')
    );
    producedParagraph2.appendChild(p2i1);
    producedParagraph2.appendChild(document.createTextNode('\n'));

    const p2i2 = document.createElement('span');
    p2i2.classList.add('idea');
    p2i2.appendChild(document.createTextNode('Něco ho neodbytně dráždilo.'));
    producedParagraph2.appendChild(p2i2);
    producedParagraph2.appendChild(document.createTextNode('\n'));

    const p2i3 = document.createElement('span');
    p2i3.classList.add('idea');
    p2i3.appendChild(
      document.createTextNode('Sledoval to, až to nasel na poslední stránce odložených novin.')
    );
    producedParagraph2.appendChild(p2i3);
    producedParagraph2.appendChild(document.createTextNode('\n'));

    const p2i4 = document.createElement('span');
    p2i4.classList.add('idea');
    p2i4.appendChild(
      document.createTextNode(
        'Bylo to slovíčko LEZ. Vlastně jen půl slova, protože noviny byly zrovna před L přeloženy.'
      )
    );
    producedParagraph2.appendChild(p2i4);
    producedParagraph2.appendChild(document.createTextNode('\n'));

    const p2i5 = document.createElement('span');
    p2i5.classList.add('idea');
    p2i5.appendChild(
      document.createTextNode('Byla to právě ta polovičatost, která se tak neobyčejně vnucovala.')
    );
    producedParagraph2.appendChild(p2i5);
    producedParagraph2.appendChild(document.createTextNode('\n'));

    // paragraph2 idea6
    const p2i6 = document.createElement('span');
    p2i6.classList.add('idea');
    // paragraph2 idea6 quote3
    const producedQuote3 = document.createElement('q');
    producedQuote3.appendChild(document.createTextNode('Nu, bože, bude tam asi ŽELEZ,'));
    p2i6.appendChild(producedQuote3);
    // paragraph2 idea6 text
    p2i6.appendChild(document.createTextNode(' uvažoval Bondy neurčitě,'));
    producedParagraph2.appendChild(p2i6);
    producedParagraph2.appendChild(document.createTextNode('\n'));

    //paragraph2 quote4
    producedParagraph2.appendChild(producedQuote4);

    // produced
    const produced = document.createElement('main');
    produced.appendChild(producedParagraph1);
    produced.appendChild(document.createTextNode('\n'));
    produced.appendChild(producedParagraph2);

    expect(produce(document, parsed)).toStrictEqual(produced);
  });
});

describe('containsParsedObj', () => {
  it('returns false when provided with empty idea piece array', () => {
    expect(containsParsedObj([])).toBe(false);
  });
  it('returns false when provided with idea piece array containing strings', () => {
    expect(containsParsedObj(['a', 'b'])).toBe(false);
  });
  it('returns true when provided with idea piece array containing ParsedObj', () => {
    expect(
      containsParsedObj([
        'a',
        document.createElement('span'),
        new ParsedObj(document.createElement('main'), [], '\n'),
        new Separator(),
        document.createElement('a'),
        'b',
        'c',
      ])
    ).toBe(true);
  });
  it('returns true when provided with idea piece array containing ParsedObj on first index', () => {
    expect(
      containsParsedObj([
        new ParsedObj(document.createElement('main'), [], '\n'),
        'a',
        'b',
        new Separator(),
        'd',
        'e',
        document.createTextNode('text'),
        document.createElement('span'),
        'g',
      ])
    ).toBe(true);
  });
  it('returns true when provided with idea piece array containing ParsedObj on last index', () => {
    expect(
      containsParsedObj([
        'a',
        'b',
        new Separator(),
        'd',
        'e',
        document.createTextNode('text'),
        'g',
        new ParsedObj(document.createElement('main'), [], '\n'),
      ])
    ).toBe(true);
  });
});

describe('produceHTMLSpanIdea', () => {
  it('should return span idea with no children when provided empty array', () => {
    const ideaPieces: IdeaPiece[] = [new ParsedObj(document.createElement('main'), [], '\n')];

    expect(() => produceHTMLSpanIdea(ideaPieces, document)).toThrowError(
      'Idea children contain ParsedObj.'
    );
  });

  it('should return span idea with no children when provided empty array', () => {
    const ideaPieces: IdeaPiece[] = [];

    const expected = document.createElement('span');
    expected.classList.add('idea');

    expect(produceHTMLSpanIdea(ideaPieces, document)).toStrictEqual(expected);
  });

  it('should return span idea with no children when provided array whose only item is Separator', () => {
    const ideaPieces: IdeaPiece[] = [new Separator()];

    const expected = document.createElement('span');
    expected.classList.add('idea');

    expect(produceHTMLSpanIdea(ideaPieces, document)).toStrictEqual(expected);
  });

  it('should return span idea when provided simple string children', () => {
    const ideaPieces = ['a', 'b', 'c'];

    const expected = document.createElement('span');
    expected.classList.add('idea');
    expected.appendChild(document.createTextNode('a'));
    expected.appendChild(document.createTextNode('b'));
    expected.appendChild(document.createTextNode('c'));

    expect(produceHTMLSpanIdea(ideaPieces, document)).toStrictEqual(expected);
  });

  it('should return span idea containing text node children, when provided strings and Separator', () => {
    const ideaPieces = ['a', 'b', new Separator(), 'c'];

    const expected = document.createElement('span');
    expected.classList.add('idea');
    expected.appendChild(document.createTextNode('a'));
    expected.appendChild(document.createTextNode('b'));
    expected.appendChild(document.createTextNode('c'));

    expect(produceHTMLSpanIdea(ideaPieces, document)).toStrictEqual(expected);
  });

  it('should return span idea containing anchor when provided list containing anchor', () => {
    const link = document.createElement('a');
    link.appendChild(document.createTextNode('b'));
    const ideaPieces = ['a', link, 'c'];

    const expected = document.createElement('span');
    expected.classList.add('idea');
    expected.appendChild(document.createTextNode('a'));
    const anchor = document.createElement('a');
    anchor.appendChild(document.createTextNode('b'));
    expected.appendChild(anchor);
    expected.appendChild(document.createTextNode('c'));

    expect(produceHTMLSpanIdea(ideaPieces, document)).toStrictEqual(expected);
  });

  it('should return span idea and ignore separator', () => {
    const link = document.createElement('a');
    link.appendChild(document.createTextNode('b'));
    const ideaPieces = ['a', link, new Separator(), 'c'];

    const expected = document.createElement('span');
    expected.classList.add('idea');
    expected.appendChild(document.createTextNode('a'));
    const anchor = document.createElement('a');
    anchor.appendChild(document.createTextNode('b'));
    expected.appendChild(anchor);
    expected.appendChild(document.createTextNode('c'));

    expect(produceHTMLSpanIdea(ideaPieces, document)).toStrictEqual(expected);
  });
});

describe('anchorObject', () => {
  it('should return fragment when idea is empty array', () => {
    const anchor = anchorObject([], document);
    expect(anchor instanceof DocumentFragment).toBe(true);
  });
  it('should return fragment based on idea', () => {
    const idea = ['<p>', 'test', '</p>'];
    const anchor = anchorObject(idea, document);
    expect(anchor instanceof DocumentFragment).toBe(true);
  });
});
