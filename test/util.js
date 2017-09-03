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


import {URL} from "url";
import {describe, it} from "mocha";
const assert = require("assert");
const moment = require("moment");
const fs = require("fs");

import {RFC3339_FORMAT, image_content_string, file_packed_path, url_packed_path, string_content, get_mime_for, file_exists, url_id, file_id}
	from "../src/util";


const temp_dir = process.env["TMP"] || process.env["TEMP"] || "/tmp";


describe("util", () => {
	describe("#RFC3339_FORMAT", () => {
		it("accepts RFC3339", () => {
			assert(moment("2017-02-08T15:30:18+01:00", RFC3339_FORMAT).isValid());
		});

		it("rejects RFC2822", () => {
			assert(!moment("Wed, 08 Feb 2017 15:30:18 +0100", RFC3339_FORMAT).isValid());
		});

		it("rejects Unix timestamp", () => {
			assert(!moment("1486564218", RFC3339_FORMAT).isValid());
			assert(!moment("1486564218+01:00", RFC3339_FORMAT).isValid());
		});
	});

	describe("#file_exists()", () => {
		it("correctly reports existing files", () => {
			assert(file_exists(process.argv[0]));
		});

		it("correctly reports nonexistant files", (done) => {
			fs.mkdtemp(temp_dir + "/gen-epub-book.js-", (err, folder) => {
				if(err)
					done(err);

				assert(!file_exists(folder + "/nonexistant.file"));
				done();
			});
		});
	});

	describe("#string_content()", () => {
		it("contains specified content", () => {
			assert(string_content(process.argv[0]).includes(process.argv[0]));
		});
	});

	describe("#image_content_string()", () => {
		it("is as expected", () => {
			assert.equal(image_content_string("henlo.html"), "<img href=\"henlo.html\" alt=\"henlo.html\"></img>");
		});
	});

	describe("#file_id()", () => {
		it("correctly processes slashes and extensions", () => {
			assert.equal(file_id("simple/chapter_image.png"), "simple-chapter_image_png");
			assert.equal(file_id("simple\\ctnt.html"), "simple-ctnt_html");
		});

		it("correctly strips ./s and ../s", () => {
			assert.equal(file_id("../cover.png"), "cover_png");
			assert.equal(file_id("relative/path/../green_ass_dog.html"), "relative-path-green_ass_dog_html");
			assert.equal(file_id("./../relative_path_fuckery\\relative/../relative/path\\../../relative/path/dead_santa.html"),
			             "relative_path_fuckery-relative-relative-path-relative-path-dead_santa_html");
			assert.equal(file_id("../cover"), "cover");
		});
	});

	describe("#file_packed_path()", () => {
		it("correctly processes slashes", () => {
			assert.equal(file_packed_path("simple/chapter_image.png"), "simple-chapter_image.png");
			assert.equal(file_packed_path("simple\\ctnt.html"), "simple-ctnt.html");
		});

		it("correctly strips ./s and ../s", () => {
			assert.equal(file_packed_path("../cover.png"), "cover.png");
			assert.equal(file_packed_path("relative/path/../green_ass_dog.html"), "relative-path-green_ass_dog.html");
			assert.equal(file_packed_path("./../relative_path_fuckery\\relative/../relative/path\\../../relative/path/dead_santa.html"),
			             "relative_path_fuckery-relative-relative-path-relative-path-dead_santa.html");
			assert.equal(file_packed_path("../cover"), "cover");
		});
	});

	describe("#url_id()", () => {
		it("picks last segment and correctly processes extensions", () => {
			assert.equal(url_id(new URL("http://i.imgur.com/ViQ2WED.jpg")), "ViQ2WED_jpg");
			assert.equal(url_id(new URL("https://cdn.rawgit.com/nabijaczleweli/nabijaczleweli.github.io/dev/src/writing_prompts/slim_shady.png")),
			             "slim_shady_png");
			assert.equal(url_id(new URL("https://img09.deviantart.net/e6c8/i/2015/138/8/0/the_pursuer_by_artsed-d7lbiua.jpg")),
			             "the_pursuer_by_artsed-d7lbiua_jpg");
			assert.equal(url_id(new URL("https://i.imgur.com/")), "");
			assert.equal(url_id(new URL("https://i.imgur.com/.png")), "_png");
		});
	});

	describe("#url_packed_path()", () => {
		it("picks last segment and correctly processes extensions", () => {
			assert.equal(url_packed_path(new URL("http://i.imgur.com/ViQ2WED.jpg")), "ViQ2WED.jpg");
			assert.equal(url_packed_path(new URL("https://cdn.rawgit.com/nabijaczleweli/nabijaczleweli.github.io/dev/src/writing_prompts/slim_shady.png")),
			             "slim_shady.png");
			assert.equal(url_packed_path(new URL("https://img09.deviantart.net/e6c8/i/2015/138/8/0/the_pursuer_by_artsed-d7lbiua.jpg")),
				           "the_pursuer_by_artsed-d7lbiua.jpg");
			assert.equal(url_packed_path(new URL("https://i.imgur.com/")), "");
			assert.equal(url_packed_path(new URL("https://i.imgur.com/.png")), ".png");
		});
	});

	describe("#get_mime_for()", () => {
		it("correctly resolves normal files", () => {
			assert.equal(get_mime_for("slim_shady.png"), "image/png");
			assert.equal(get_mime_for("index.js"), "application/javascript");
		});

		it("correctly handles unknown files", () => {
			assert.equal(get_mime_for(".htaccess"), "text/plain");
			assert.equal(get_mime_for("henlo.you-stinky-birb"), "text/plain");
		});

		it("correctly overrides html", () => {
			assert.equal(get_mime_for("ctnt.html"), "application/xhtml+xml");
		});
	});
});
