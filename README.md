# nb-mapper

A tool for mapping HTML files for use with next-book tools. See [an example][example], [API documentations][api] or a [example book created with nb-mapper][fc], that builds functionalityon top of its markup: displaying and remembering position, addressable dictionary terms, tracing reader's journey through a book etc.


## Use with node.js

Install from npm:

```
npm install nb-mapper
```

Map HTML string or JSDOM objects:

```js
const html = '...';
const mapper = require('nb-mapper');
mapper.map(html);
```

Config the mapper with an options object `mapper.map(html, conf)`, see [API docs for Options][options].


## CLI use

Planned.


## Use in browser

Download nb-mapper from npm or github and include it in your project files. Check [the example with extensive highlighting][example] to see how the result looks like.

```html
<script type="text/javascript" src="nb-mapper/dist/browser.js"></script>
<script type="text/javascript">
	window.addEventListener('load', () => {
	  NbMapper.mapHtml();
	});
</script>
```

Browser use is currently primarily for quick try-outs, not intended for production use. 


## Contributing

Clone repository and install devDependencies. Build a complete project with `npm run build`. Limit PRs only to changed source files.



[fc]: https://github.com/next-book/free-culture/
[example]: http://next-book.github.io/nb-mapper/
[api]: http://next-book.github.io/nb-mapper/api
[options]: http://next-book.github.io/nb-mapper/api/#options
