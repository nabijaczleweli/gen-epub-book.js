#!/usr/bin/env node

// The MIT License (MIT)

// Copyright (c) 2017 nabijaczleweli

// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
// the Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
// FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
// IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
// CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// @flow


const epubify = require("./lib");
const mkdirp = require("mkdirp");
const path = require("path");
const fs = require("fs");


const config = new epubify.Configuration(process.argv.slice(2));
console.log(mkdirp.sync(path.dirname(config.out_file)));

const content = fs.readFileSync(config.in_file, {encoding: "utf8"});
const built = epubify.parse_descriptor(content, config.rel_root);
epubify.pack_book(built).generateNodeStream({
	compression: "DEFLATE",
	compressionOptions: {
		level: 9
	}
}).pipe(fs.createWriteStream(config.out_file));
