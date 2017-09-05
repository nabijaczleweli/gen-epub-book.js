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
const minimist = require("minimist");
const package_data = require("../package.json");

import {file_exists} from "./util";


const HELP_TEXT: string = "$${include(help.txt)}";


/** A unified config. */
export class Configuration {
	/** The descriptor file to read from. */
	in_file: string;

	/** The file to which output the resulting ePub. */
	out_file: string;

	/** Relative root for file paths. */
	rel_root: string;

	/** [Separator](http://192.168.1.109:8001/content/gen-epub-book/programmer.html#getting-the-gist) for keys/values.
	  *
	  * Default: `":"`.
	  */
	separator: string;


	/** Parse commandline arguments.
		*
		* @param argv command-line argument array without executable nor script name.
		* @param out `(Console)` where to print errors/help should any occur
		*/
	constructor(argv: string[], out = console) {
		let pargv = minimist(argv, {
			string: ["separator"],
			boolean: ["version", "help"],
			alias: {
				v: "version",
				h: "help",
			}
		});

		if(pargv.help) {
			print_help(false, out);
			process.exitCode = 0;
			return;
		}

		if(pargv.version) {
			out.log("epubify", package_data.version);
			process.exitCode = 0;
			return;
		}

		if(pargv._.length !== 2 || !file_exists(pargv._[0])) {
			print_help(true, out);
			process.exitCode = 1;
			return;
		}

		this.in_file = pargv._[0];
		this.out_file = pargv._[1];
		this.rel_root = path.dirname(this.in_file);
		this.separator = pargv.separator || ":";
	}
}


function print_help(err: boolean, out): void {
	if(err)
		out.error(HELP_TEXT);
	else
		out.log(HELP_TEXT);
}
