# [gen-epub-book](https://nabijaczleweli.xyz/content/gen-epub-book).js [![Build Status](https://travis-ci.org/nabijaczleweli/gen-epub-book.js.svg?branch=master)](https://travis-ci.org/nabijaczleweli/gen-epub-book.js) [![Licence](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE)
Generate an ePub book from a simple plaintext descriptor.

## [Manpage](https://cdn.rawgit.com/nabijaczleweli/gen-epub-book/man/gen-epub-book.js.1.html)
## [Documentation](https://cdn.rawgit.com/nabijaczleweli/gen-epub-book.js/doc/index.html)

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

For more detailed usage information and tag list, see the [manpage](https://cdn.rawgit.com/nabijaczleweli/gen-epub-book/man/gen-epub-book.js.1.html),
and for a full guide see the [webpage](https://nabijaczleweli.xyz/content/gen-epub-book).

## Versions in other languages

The original in [AWK](https://github.com/nabijaczleweli/gen-epub-book).

A rewrite in [Rust](https://github.com/nabijaczleweli/gen-epub-book.rs).

A rewrite in [C++](https://github.com/nabijaczleweli/gen-epub-book.cpp).

A rewrite in [Scala](https://github.com/nabijaczleweli/gen-epub-book.scala).
