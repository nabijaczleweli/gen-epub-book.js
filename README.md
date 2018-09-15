# [gen-epub-book](https://nabijaczleweli.xyz/content/gen-epub-book).js [![Build Status](https://travis-ci.org/nabijaczleweli/gen-epub-book.js.svg?branch=master)](https://travis-ci.org/nabijaczleweli/gen-epub-book.js) [![Licence](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE) [![npm version](https://badge.fury.io/js/epubify.svg)](https://www.npmjs.com/package/epubify)
Generate an ePub book from a simple plaintext descriptor.

## [Manpage](https://rawcdn.githack.com/nabijaczleweli/gen-epub-book/man/gen-epub-book.js.1.html)
## [Browserified bundles](https://github.com/nabijaczleweli/gen-epub-book.js/tree/bundle)

## Quickstart

Install via:

```sh
npm install -g epubify
```

Copy this somewhere:

```text
Name: Simple ePub demonstration
Cover: cover.png

Image-Content: simple/chapter_image.png
Content: simple/ctnt.html

Author: nabijaczleweli
Date: 2017-02-08T15:30:18+01:00
Language: en-GB
```

Modify to your liking, then, assuming you put the file in "example/test.epupp" and want to write the result to "out/test.epub", run:

```sh
epubify example/test.epupp out/test.epub
```

For more detailed usage information and tag list, see the [manpage](https://rawcdn.githack.com/nabijaczleweli/gen-epub-book/man/gen-epub-book.js.1.html),
and for a full guide see the [webpage](https://nabijaczleweli.xyz/content/gen-epub-book).

## Versions in other languages

The original in [AWK](https://github.com/nabijaczleweli/gen-epub-book).

A rewrite in [Rust](https://github.com/nabijaczleweli/gen-epub-book.rs).

A rewrite in [C++](https://github.com/nabijaczleweli/gen-epub-book.cpp).

A rewrite in [Scala](https://github.com/nabijaczleweli/gen-epub-book.scala).

## Documentation

#### BookError

**Extends Error**

Generic book parsing error.

#### parse_descriptor(string_contents, relative_root)

Parse specified file content into a `Book` instance.

**Parameters**

  - `string_contents` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** the content of the specified file
  - `relative_root` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)**

Returns **Book**

#### util.RFC3339_FORMAT

Format string to parse RFC3339 with `moment`.

Type: [string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)

#### util.CHAPTER_TITLE_REGEX

Regex for extracting chapter titles.

Type: [RegExp](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp)

#### util.file_exists(path)

Check whether a file with the specified path exists.

**Parameters**

  - `path` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The file for whose existence to check.

Returns **[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** Whether the specified file exists.

#### util.string_content(content)

Get content of string-content, having provided the content of that string-content (yes).

**Parameters**

  - `content` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** String data of that string content.

Returns **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** String content to include in e-book.

#### util.image_content_string(img_path)

Get img filler for image-content.

For full image string content one need do `epubify.util.string_content(util.image_content_string(img_path))`.

**Parameters**

  - `img_path` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Packed path of image.

Returns **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Stringified &lt;img> tag.

#### util.file_id(file_path)

Get e-book ID for the specified relative path.

**Parameters**

  - `file_path` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Pathname specified in `"Content"` key.

Returns **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** E-book ID to use for content.

#### util.file_packed_path(file_path)

Get packed e-book path for the specified relative path.

**Parameters**

  - `file_path` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Pathname specified in `"Content"` key.

Returns **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** E-book path to use for content.

#### util.url_id(url, file_path)

Get e-book ID for the specified URL.

**Parameters**

  - `url` **[URL](https://developer.mozilla.org/en-US/docs/Web/API/URL/URL)**
  - `file_path`  Pathname specified in `"Remote-*"` key.

Returns **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** E-book ID to use for content.

#### util.url_packed_path(url)

Get packed e-book path for the specified URL.

**Parameters**

  - `url` **[URL](https://developer.mozilla.org/en-US/docs/Web/API/URL/URL)** Pathname specified in `"Remote-*"` key.

Returns **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** E-book path to use for content.

#### util.get_mime_for(pathname)

Get MIME-type for the specified MIME type.

**Parameters**

  - `pathname` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** File to get MIME type for.

Returns **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** MIME type for that file.

#### class Configuration(argv[, out])

A unified config.

Constructor: parse commandline arguments.

**Parameters**

  - `argv` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)>** command-line argument array without executable nor script name.
  - `out` **[Console](https://developer.mozilla.org/en-US/docs/Web/API/Console)** (optional, default: global `console` object)

##### Configuration.in_file

The descriptor file to read from.

Type: [string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)

##### Configuration.out_file

The file to which output the resulting ePub.

Type: [string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)

##### Configuration.rel_root

Relative root for file paths.

Type: [string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)

##### Configuration.separator

[Separator](http://192.168.1.109:8001/content/gen-epub-book/programmer.html#getting-the-gist) for *keys/values*.

Default: `":"`.

Type: [string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)

##### Configuration.free_date

Whether to try to parse non-RFC3339 date formats.

Default: `false`.

Type: [boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
