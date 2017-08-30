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


import {WritableStreamBuffer} from "stream-buffers";
import {describe, it} from "mocha";
const assert = require("assert");
const fs = require("fs");

import {Configuration} from "../src/config";


const temp_dir = process.env["TMP"] || process.env["TEMP"] || "/tmp";
const bad_lengths = [0, 1, 3, 4, 5, 6, 7, 8, 9, 10];


describe("config", () => {
	describe("Configuration", () => {
		describe("#constructor()", () => {
			for(let i = 0; i < bad_lengths.length; ++i) {
				let argv_size = bad_lengths[i];
				it(`rejects ${argv_size}-length argv`, () => {
					let argv = [];
					for(let i = 0; i < argv_size; ++i)
						argv.push(process.argv[0]);
					test_rejected_argv(argv);
				});
			}

			it("rejects nonexistant in_file", (done) => {
				fs.mkdtemp(temp_dir + "/gen-epub-book.js-", (err, folder) => {
					if(err)
						throw err;

					test_rejected_argv([folder + "/nonexistant.file", folder + "/out.epub"]);
					done();
				});
			});

			it("accepts existant in_file", () => {
				const {stdout, stderr} = test_argv([process.argv[0], "dist/out.epub"]);
				assert.equal(process.exitCode, 0);
				assert.equal(stdout.size(), 0);
				assert.equal(stderr.size(), 0);
			});
		});
	});
});


function test_rejected_argv(argv: string[]): void {
	const {stdout, stderr} = test_argv(argv);

	assert.equal(process.exitCode, 1);
	assert.equal(stdout.size(), 0);
	assert.notEqual(stderr.size(), 0);

	process.exitCode = 0;
}

function test_argv(argv: string[]): {stdout: WritableStreamBuffer, stderr: WritableStreamBuffer} {
	invariant(typeof console.Console == "function");
	let stdout = new WritableStreamBuffer();
	let stderr = new WritableStreamBuffer();
	let out = new console.Console(stdout, stderr);

	new Configuration(argv, out);
	stdout.end();
	stderr.end();

	return {stdout, stderr};
}


function invariant(..._) {}
