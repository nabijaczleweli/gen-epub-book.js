# gen-epub-book.js browsified releases
Include in HTML as:
```html
<script type="text/javascript" src="https://cdn.rawgit.com/nabijaczleweli/gen-epub-book.js/bundle/{version}/epubify.min.js"></script>
```

Where `{version}` is one of the directories above, then use
```js
var epubify = require("epubify");
```

In your code.
