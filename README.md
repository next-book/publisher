# Next-book publishing tool: nb-mapper

Nb-mapper is a tool for mapping HTML files for use with next-book tools. See [an example][example], [API documentations][api] or a [example book created with nb-mapper][fc], that builds functionalityon top of its markup: displaying and remembering position, tracing reader's journey through a book etc.


## Use with node.js

Install in a book's repository (global installation is discouraged as nb-mapper is in its early development and API changes are expected):

```sh
npm i nb-mapper
```


## CLI use

Use nb-mapper command, e. g.

```sh
nb-mapper --src text --out book
```

Mapper reads all `\*.html` files in the source directory (`--src`, by default `./src`), sorts them by filename, maps them and outputs the result into the `output` directory (`--out`, by default `./book`).

It also creates a `spine.json` file that collects metadata about the book and adds several structural meta tags into files (prev, next, license, spine) that allow book traversal (with Javascript or native browser affordances).

It's required to include a `book.json` file in the source directory that adds metadata and a list of chapters. It's possible to specify static folders that will be copied from source to output as they are.

```json
{
  "meta": {
    "title": "Free Culture",
    "author": "Lawrence Lessig",
    "subtitle": "How big media uses technology and the law to lock down culture and control creativity",
    "published": 2004,
    "keywords": ["copyright law", "intellectual property", "public domain", "web", "Napster"]
  },
  "chapters": [
	"01-preface.html",
	"02-introduction.html",
	"03-piracy.html",
	"04-property.html",
	"05-puzzles.html",
	"06-balances.html",
	"07-conclusion.html",
	"08-afterword.html",
	"09-acknowledgments.html"
  ],
  "static": ["style", "scripts", "images"]
}
```

You can preview the book on a local web server by running the `nb-mapper` with `-w` flag (or with `--server` param).

```sh
nb-mapper --src text --out book --server
```


## Use in browser

Download nb-mapper from npm or github and include it in your project files. Check [the example with extensive highlighting][example] to see how the result looks like.

```html
<script type="text/javascript" src="nb-mapper/dist/browser.js"></script>
<script type="text/javascript">
  window.addEventListener('load', () => NbMapper.mapHtml());
</script>
```

Browser use is currently primarily for quick try-outs, not intended for production use. 


## Use in a Node.js script 

Map HTML string or JSDOM objects in a script:

```js
const html = '...';
const mapper = require('nb-mapper');
mapper.map(html);
```

Config the mapper with an options object `mapper.map(html, conf)`, see [API docs for Options][options].


## Contributing

Clone repository and install devDependencies. Build a complete project with `npm run build`. Limit PRs only to changed source files.

[fc]: https://github.com/next-book/free-culture/
[example]: http://next-book.github.io/nb-mapper/
[api]: http://next-book.github.io/nb-mapper/api
[options]: http://next-book.github.io/nb-mapper/api/#options

## License

nb-mapper &copy; 2016–2020 next-book

You should have received a copy of the GNU General Public License along with this program. If not, see http://www.gnu.org/licenses/.
