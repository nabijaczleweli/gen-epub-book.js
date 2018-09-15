// @flow

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


import {describe, it} from "mocha";
const assert = require("assert");
const moment = require("moment");

import {BookError, parse_descriptor} from "../src/lib";
import type {Book} from "../src/book";
import {RFC3339_FORMAT} from "../src/util";
const strsplit = require("strsplit");


const BOOK_STR: string =
"   Name: Everything we got, in one thing\n\
\n\
Content \t: simple/ctnt.html \t\t  \n\
String-Content: <strong>SEIZE THE MEANS OF PRODUCTION!</strong>\n\
Image-Content: simple/chapter_image.png\n\
Image-Content: not_dead_yet.png\n\
Network-Image-Content: https://rawcdn.githack.com/nabijaczleweli/nabijaczleweli.github.io/dev/src/writing_prompts/slim_shady.png\n\
\n\
Network-Cover: http://i.imgur.com/ViQ2WED.jpg\n\
\n\
Author: nabijaczleweli\n\
Date: 2017-02-08T15:30:18+01:00\n\
Language: en-GB";



describe("lib", () => {
	describe("#parse_descriptor()", () => {
		it("correctly parses correct book", () => {
			verify_book(parse_descriptor(BOOK_STR, "examples/"))
		});

		it("throws on doubled entries", () => {
			assert.throws(() => {parse_descriptor("Name: l1\nName: l2", "examples/")}, dupe_error_check("Name"));
			assert.throws(() => {parse_descriptor("Author: l1\nAuthor: l2", "examples/")}, dupe_error_check("Author"));
			assert.throws(() => {parse_descriptor("Date: 2017-02-08T15:30:18+01:00\nDate: 2017-02-08T15:30:18+02:00", "examples/")}, dupe_error_check("Date"));
			assert.throws(() => {parse_descriptor("Language: en\nLanguage: pl", "examples/")}, dupe_error_check("Language"));

			assert.throws(() => {parse_descriptor("Cover: cover.png\nCover: cover.png\n", "examples/")}, dupe_error_check("Cover or Network-Cover"));
			assert.throws(() => {parse_descriptor("Network-Cover: l1\nCover: cover.png\n", "examples/")}, dupe_error_check("Cover or Network-Cover"));
			assert.throws(() => {parse_descriptor("Cover: cover.png\nNetwork-Cover: l2\n", "examples/")}, dupe_error_check("Cover or Network-Cover"));
			assert.throws(() => {parse_descriptor("Network-Cover: l1\nNetwork-Cover: l2\n", "examples/")}, dupe_error_check("Cover or Network-Cover"));
		});

		it("throws on incorrect entries", () => {
			assert.throws(() => {parse_descriptor("Content: simple/ctnt.htm\n"), "examples/"},
				                   error_check("Content path \"examples/simple/ctnt.htm\" nonexistant."));
			assert.throws(() => {parse_descriptor("Image-Content: simple/chapter_image.jpg\n"), "examples/"},
				                   error_check("Image-Content path \"examples/simple/chapter_image.jpg\" nonexistant."));
			assert.throws(() => {parse_descriptor("Cover: cover.jpg\n"), "examples/"},
				                   error_check("Cover path \"examples/cover.jpg\" nonexistant"));
			assert.throws(() => {parse_descriptor("Network-Cover: htp:/asdfsa21_/ asf 2\n"), "examples/"});
			assert.throws(() => {parse_descriptor("Date: 2017-02-08T15:30:18+01:0\n"), "examples/"},
				                   error_check("Date value \"2017-02-08T15:30:18+01:0\" not valid RFC3339."));
			assert.throws(() => {parse_descriptor("Date: 2017-02-08T15:30:18\n"), "examples/"},
				                   error_check("Date value \"2017-02-08T15:30:18\" not valid RFC3339."));
			assert.throws(() => {parse_descriptor("Date: 2017-02-08T1:30:18\n"), "examples/"},
				                   error_check("Date value \"2017-02-08T1:30:18\" not valid RFC3339."));
			assert.throws(() => {parse_descriptor("Date: Sun Feb 19 14:33:26 Central European Standard Time 2017\n"), "examples/"},
				                   error_check("Date value \"Sun Feb 19 14:33:26 Central European Standard Time 2017\" not valid RFC3339."));
			assert.throws(() => {parse_descriptor("Date: Sun, 19 Feb 2017 14:33:40 Central European Standard Time\n"), "examples/"},
				                   error_check("Date value \"Sun, 19 Feb 2017 14:33:40 Central European Standard Time\" not valid RFC3339."));
			assert.throws(() => {parse_descriptor("Date: yesterday\n"), "examples/"},
				                   error_check("Date value \"yesterday\" not valid RFC3339."));
			assert.throws(() => {parse_descriptor("Language: l1\n"), "examples/"},
			                     error_check("Language value \"l1\" not valid BCP47: ${reason} at position 1."));
		});

		it("throws on missing entries", () => {
			const keys_that_can_be_missing: RegExp[] = [/Name/, /Author/, /Date/, /Language/];
			for(let i = 0; i < keys_that_can_be_missing.length; ++i)
				assert.throws(() => {parse_descriptor(book_without(keys_that_can_be_missing[i]), "examples/")},
				                     error_check(`Missing required key ${keys_that_can_be_missing[i].toString()}.`));
		});
	});
});


function verify_book(b: Book) {
	assert.equal(b.name, "Everything we got, in one thing");
	assert.equal(b.author, "nabijaczleweli");
	assert.deepEqual(b.date, moment("2017-02-08T15:30:18+01:00", RFC3339_FORMAT));
	assert.equal(b.language.language, "en");
	assert.equal(b.language.extendedLanguageSubtags.length, 0);
	assert(!b.language.script);
	assert.equal(b.language.region, "GB");
	assert.equal(b.language.variants.length, 0);
	assert.equal(b.language.extensions.length, 0);
	assert.equal(b.language.privateuse.length, 0);
	assert(!b.language.regular);
	assert(!b.language.irregular);
}

function error_check(s: string): (any) => bool {
	return e => {
		return !(e instanceof BookError) && !((e + "") == s);
	};
}

function dupe_error_check(n: string): (any) => bool {
	return error_check(`Duplicate key ${n}`);
}

function book_without(n: RegExp): string {
	return strsplit(BOOK_STR, '\n').filter(l => n.test(l)).reduce((all, cur) => {
		return all + cur + "\n";
	}, "");
}
