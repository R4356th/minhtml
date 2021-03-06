# minhtml - a Node.JS package for easily minifying HTML

[minhtml](https://minhtml.js.org), short for "minify html" is a highly **configurable**, **well-tested**, **JavaScript-based** HTML minifier. It also supports Mustache/Handlebars templates and should also reasonably support Angular, React and Vue components.

See [corresponding blog post by the original author](http://perfectionkills.com/experimenting-with-html-minifier/) for all the gory details of [how it works](http://perfectionkills.com/experimenting-with-html-minifier/#how_it_works), [description of each option](http://perfectionkills.com/experimenting-with-html-minifier/#options), [testing results](http://perfectionkills.com/experimenting-with-html-minifier/#field_testing) and [conclusions](http://perfectionkills.com/experimenting-with-html-minifier/#cost_and_benefits).

## Minification comparison

How does minhtml compare to other solutions — [HTML Minifier from Will Peavy](http://www.willpeavy.com/minifier/) (1st result in [Google search for "html minifier"](https://www.google.com/search?q=html+minifier)) as well as [minimize](https://github.com/Swaagie/minimize)?

| Site                                                                         | Original size *(KB)* | minhtml | minimize | Will Peavy |
| ---------------------------------------------------------------------------- |:--------------------:| ------------:| --------:| ----------:|
| [Google](https://www.google.com/)                                            | 49                   | **44**       | 49       | 51         |
| [Twitter](https://twitter.com/)                                              | 69                   | **61**       | 68       | 68         |
| [Stack Overflow](https://stackoverflow.com/)                                 | 202                  | **164**      | 178      | 178        |
| [minhtml](https://github.com/R4356th/minhtml)                           | 222                  | **136**      | 200      | 214        |
| [Bootstrap CSS](https://getbootstrap.com/docs/3.3/css/)                      | 271                  | **260**      | 269      | 229        |
| [BBC](https://www.bbc.co.uk/)                                                | 333                  | **307**      | 331      | 332        |
| [Amazon](https://www.amazon.co.uk/)                                          | 459                  | **410**      | 449      | 461        |
| [Wikipedia](https://en.wikipedia.org/wiki/President_of_the_United_States)    | 692                  | **558**      | 671      | 697        |
| [New York Times](https://www.nytimes.com/)                                   | 770                  | **688**      | 766      | 755        |
| [Eloquent Javascript](https://eloquentjavascript.net/1st_edition/print.html) | 870                  | **815**      | 840      | 864        |
| [NBC](https://www.nbc.com/)                                                  | 1857                 | **1712**     | 1844     | 1864       |
| [ES draft](https://tc39.github.io/ecma262/)                                  | 5912                 | **5194**     | 5384     | n/a        |

## Options Quick Reference

Most of the options are disabled by default.

| Option                         | Description     | Default |
|--------------------------------|-----------------|---------|
| `caseSensitive`                | Treat attributes in case sensitive manner (useful for custom HTML tags) | `false` |
| `collapseBooleanAttributes`    | [Omit attribute values from boolean attributes](http://perfectionkills.com/experimenting-with-html-minifier/#collapse_boolean_attributes) | `false` |
| `collapseInlineTagWhitespace`  | Don't leave any spaces between `display:inline;` elements when collapsing. Must be used in conjunction with `collapseWhitespace=true` | `false` |
| `collapseWhitespace`           | [Collapse white space that contributes to text nodes in a document tree](http://perfectionkills.com/experimenting-with-html-minifier/#collapse_whitespace) | `false` |
| `conservativeCollapse`         | Always collapse to 1 space (never remove it entirely). Must be used in conjunction with `collapseWhitespace=true` | `false` |
| `continueOnParseError`         | [Handle parse errors](https://html.spec.whatwg.org/multipage/parsing.html#parse-errors) instead of aborting. | `false` |
| `customAttrAssign`             | Arrays of regex'es that allow to support custom attribute assign expressions (e.g. `'<div flex?="{{mode != cover}}"></div>'`) | `[ ]` |
| `customAttrCollapse`           | Regex that specifies custom attribute to strip newlines from (e.g. `/ng-class/`) | |
| `customAttrSurround`           | Arrays of regex'es that allow to support custom attribute surround expressions (e.g. `<input {{#if value}}checked="checked"{{/if}}>`) | `[ ]` |
| `customEventAttributes`        | Arrays of regex'es that allow to support custom event attributes for `minifyJS` (e.g. `ng-click`) | `[ /^on[a-z]{3,}$/ ]` |
| `decodeEntities`               | Use direct Unicode characters whenever possible | `false` |
| `html5`                        | Parse input according to HTML5 specifications | `true` |
| `ignoreCustomComments`         | Array of regex'es that allow to ignore certain comments, when matched | `[ /^!/, /^\s*#/ ]` |
| `ignoreCustomFragments`        | Array of regex'es that allow to ignore certain fragments, when matched (e.g. `<?php ... ?>`, `{{ ... }}`, etc.)  | `[ /<%[\s\S]*?%>/, /<\?[\s\S]*?\?>/ ]` |
| `includeAutoGeneratedTags`     | Insert tags generated by HTML parser | `true` |
| `keepClosingSlash`             | Keep the trailing slash on singleton elements | `false` |
| `maxLineLength`                | Specify a maximum line length. Compressed output will be split by newlines at valid HTML split-points |
| `minifyCSS`                    | Minify CSS in style elements and style attributes (uses [clean-css](https://github.com/jakubpawlowicz/clean-css)) | `false` (could be `true`, `Object`, `Function(text, type)`) |
| `minifyJS`                     | Minify JavaScript in script elements and event attributes (uses [Terser](https://github.com/terser/terser)) | `false` (could be `true`, `Object`, `Function(text, inline)`) |
| `minifyURLs`                   | Minify URLs in various attributes (uses [relateurl](https://github.com/stevenvachon/relateurl)) | `false` (could be `String`, `Object`, `Function(text)`) |
| `preserveLineBreaks`           | Always collapse to 1 line break (never remove it entirely) when whitespace between tags include a line break. Must be used in conjunction with `collapseWhitespace=true` | `false` |
| `preventAttributesEscaping`    | Prevents the escaping of the values of attributes | `false` |
| `processConditionalComments`   | Process contents of conditional comments through minifier | `false` |
| `processScripts`               | Array of strings corresponding to types of script elements to process through minifier (e.g. `text/ng-template`, `text/x-handlebars-template`, etc.) | `[ ]` |
| `quoteCharacter`               | Type of quote to use for attribute values (' or ") | |
| `removeAttributeQuotes`        | [Remove quotes around attributes when possible](http://perfectionkills.com/experimenting-with-html-minifier/#remove_attribute_quotes) | `false` |
| `removeComments`               | [Strip HTML comments](http://perfectionkills.com/experimenting-with-html-minifier/#remove_comments) | `false` |
| `removeEmptyAttributes`        | [Remove all attributes with whitespace-only values](http://perfectionkills.com/experimenting-with-html-minifier/#remove_empty_or_blank_attributes) | `false` (could be `true`, `Function(attrName, tag)`) |
| `removeEmptyElements`          | [Remove all elements with empty contents](http://perfectionkills.com/experimenting-with-html-minifier/#remove_empty_elements) | `false` |
| `removeOptionalTags`           | [Remove optional tags](http://perfectionkills.com/experimenting-with-html-minifier/#remove_optional_tags) | `false` |
| `removeRedundantAttributes`    | [Remove attributes when value matches default.](http://perfectionkills.com/experimenting-with-html-minifier/#remove_redundant_attributes) | `false` |
| `removeScriptTypeAttributes`   | Remove `type="text/javascript"` from `script` tags. Other `type` attribute values are left intact | `false` |
| `removeStyleLinkTypeAttributes`| Remove `type="text/css"` from `style` and `link` tags. Other `type` attribute values are left intact | `false` |
| `removeTagWhitespace`          | Remove space between attributes whenever possible. **Note that this will result in invalid HTML!** | `false` |
| `sortAttributes`               | [Sort attributes by frequency](#sorting-attributes--style-classes) | `false` |
| `sortClassName`                | [Sort style classes by frequency](#sorting-attributes--style-classes) | `false` |
| `trimCustomFragments`          | Trim white space around `ignoreCustomFragments`. | `false` |
| `useShortDoctype`              | [Replaces the `doctype` with the short (HTML5) doctype](http://perfectionkills.com/experimenting-with-html-minifier/#use_short_doctype) | `false` |

### Sorting attributes / style classes

Minifier options like `sortAttributes` and `sortClassName` won't impact the plain-text size of the output. However, they form long repetitive chains of characters that should improve compression ratio of gzip used in HTTP compression.

## Special cases

### Ignoring chunks of markup

If you have chunks of markup you would like preserved, you can wrap them `<!-- htmlmin:ignore -->`.

### Preserving SVG tags

SVG tags are automatically recognized, and when they are minified, both case-sensitivity and closing-slashes are preserved, regardless of the minification settings used for the rest of the file.

### Working with invalid markup

minhtml **can't work with invalid or partial chunks of markup**. This is because it parses markup into a tree structure, then modifies it (removing anything that was specified for removal, ignoring anything that was specified to be ignored, etc.), then it creates a markup out of that tree and returns it.

Input markup (e.g. `<p id="">foo`)

↓

Internal representation of markup in a form of tree (e.g. `{ tag: "p", attr: "id", children: ["foo"] }`)

↓

Transformation of internal representation (e.g. removal of `id` attribute)

↓

Output of resulting markup (e.g. `<p>foo</p>`)

minhtml can't know that original markup was only half of the tree; it does its best to try to parse it as a full tree and it loses information about tree being malformed or partial in the beginning. As a result, it can't create a partial/malformed tree at the time of the output.

## Installation Instructions

From NPM for use as a (global) command line app:

```shell
npm install minhtml -g
```

From NPM for programmatic use:

```shell
npm install minhtml
```

From Git:

```shell
git clone https://github.com/R4356th/minhtml.git
cd minhtml
npm link .
```

## Usage

Note that almost all options are disabled by default. For command line usage, please see ``minhtml --help`` for a list of available options. Experiment and find what works best for you and your project.

* **Sample command:** ``minhtml --collapse-whitespace --remove-comments --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --use-short-doctype --minify-css true --minify-js true``

### Node.js

```js
var minify = require('minhtml').minify;
var result = await minify('<p title="blah" id="moo">foo</p>', {
  removeAttributeQuotes: true
});
result; // '<p title=blah id=moo>foo</p>'
```
