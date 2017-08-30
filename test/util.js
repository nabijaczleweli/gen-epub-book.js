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
const fs = require("fs");

import {file_exists} from "../src/util";


const temp_dir = process.env["TMP"] || process.env["TEMP"] || "/tmp";


describe("util", () => {
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
});
