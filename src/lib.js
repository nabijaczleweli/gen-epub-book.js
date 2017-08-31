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


import {Configuration} from "./config";
import {Book} from "./book";
const util = require("./util");

import Moment from "moment";
const strsplit = require("strsplit");
const uuid_v4 = require("uuid/v4");
const moment = require("moment");
const bcp47 = require("bcp-47");
const trim = require("trim");

exports["util"] = util;
exports["Book"] = Book;
exports["Configuration"] = Configuration;


export class BookError extends Error {}


/** Parse specified file's content into a `Book` instance.
  *
  * @param contents the content of the specified file
  */
export function parse_file(contents: string): Book {
	let name: ?string = null;
	let author: ?string = null;
	let date: ?Moment = null;
	let language: ?Object = null;

	strsplit(contents, "\n").forEach(line => {
		let kv = strsplit(line, ':', 2);
		if(kv.length < 2)
			return;

		let [key, value]: [string, string] = kv;
		switch(key) {
			case "Name":
				name = dedup_field(name, value, "Name");
				break;
			case "Author":
				author = dedup_field(author, value, "Author");
				break;
			case "Date":
				date = dedup_field(date, moment(value, util.RFC3339_FORMAT), "Date");
				if(!date.isValid())
					throw new BookError(`Date value "${value}" not valid RFC3339`);
				break;
			case "Language":
				language = dedup_field(language, bcp47.parse(value), "Language");
				if(Object.keys(language).length === 0)
					throw new BookError(`Language value "${value}" not valid BCP47`);
				break;
			// TODO: *-Content, *-Include
		}
	});

	missing_field(name, "Name");
	missing_field(author, "Author");
	missing_field(date, "Date");
	missing_field(language, "Language");

	return {
		uuid: uuid_v4(),
		name: name,
		author: author,
		date: date,
		language: language,

		contents: [],
		additives: [],
	};
}


function dedup_field<T>(curval: ?T, newval: T, name: string): T {
	if(!curval)
		return newval;
	else
		throw new BookError(`Duplicate key ${name}`);
}

function missing_field<T>(val: ?T, name: string) {
	if(!val)
		throw new BookError(`Missing required key ${name}`);
}
