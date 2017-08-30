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


const path = require("path");

import {file_exists} from "./util";


const HELP_TEXT = "$${include(help.txt)}";


/** A unified config. */
export class Configuration {
	/** The descriptor file to read from. */
	in_file: string;

	/** The file to which output the resulting ePub. */
	out_file: string;

	/** Relative root for file paths. */
	rel_root: string;


	/** Parse commandline arguments.
		*
		* @param argv command-line argument array without executable nor script name.
		* @param out `(Console)` where to print errors/help should any occur
		*/
	constructor(argv: string[], out = console) {
		if(argv.length != 2 || !file_exists(argv[0])) {
			print_help(true, out);
			process.exitCode = 1;
			return;
		}

		this.in_file = argv[0];
		this.out_file = argv[1];
		this.rel_root = path.dirname(this.in_file);
	}
}


function print_help(err: boolean, out): void {
	if(err)
		out.error(HELP_TEXT);
	else
		out.log(HELP_TEXT);
}
