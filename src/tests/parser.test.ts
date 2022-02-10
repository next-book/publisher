/**
 * @jest-environment jsdom
 */
import { ParsedObj } from '../structures';
import parse from '../parser';

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
