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


export const util = require("./util");
export const book = require("./book");
export const Configuration = require("./config").Configuration;

import Moment from "moment";
import {URL} from "url";
const strsplit = require("strsplit");
const uuid_v4 = require("uuid/v4");
const moment = require("moment");
const bcp47 = require("bcp-47");
const trim = require("trim");
const path = require("path");


/** Generic book parsing error. */
export class BookError extends Error {}


/** Parse specified file's content into a `Book` instance.
  *
  * @param string_contents the content of the specified file
  */
export function parse_descriptor(string_contents: string, relative_root: string): book.Book {
	let name: ?string = null;
	let author: ?string = null;
	let date: ?Moment = null;
	let language: ?Object = null;
	let cover: ?book.Content = null;
	let contents: book.Content[] = [];
	let additives: book.Content[] = [];

	strsplit(string_contents, "\n").forEach((line, idx) => {
		let kv = strsplit(line, ':', 2);
		if(kv.length < 2)
			return;

		let [key, value]: [string, string] = kv.map(trim);
		let rel_path: string = path.posix.join(relative_root, value);
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
				language = dedup_field(language, bcp47.parse(value, {warning: (reason: string, code: number, offset: number) => {
					throw new BookError(`Language value "${value}" not valid BCP47: ${reason} at position ${offset}`);
				}}), "Language");
				break;

			case "Content":
				if(!util.file_exists(rel_path))
					throw new BookError(`Content path "${rel_path}" nonexistant`);
				contents.push({
					id: util.file_id(value),
					packed_path: util.file_packed_path(value),
					data: rel_path,
					type: "local",
				});
				break;

			case "String-Content":
				contents.push({
					id: `string-content-${idx}_html`,
					packed_path: `string-content-${idx}.html`,
					data: util.string_content(value),
					type: "string",
				});
				break;

			case "Network-Image-Content": {
				let url = new URL(value);
				let packed_path = util.url_packed_path(url);
				additives.push({
					id: util.url_id(url),
					packed_path: packed_path,
					data: url,
					type: "remote",
				});
				contents.push({
					id: `network-image-content-${idx}_html`,
					packed_path: `network-image-content-${idx}.html`,
					data: util.string_content(util.image_content_string(packed_path)),
					type: "string",
				});
			} break;

			case "Cover": {
				if(!util.file_exists(rel_path))
					throw new BookError(`Cover path "${rel_path}" nonexistant`);
				let packed_path = util.file_packed_path(value);
				cover = dedup_field(cover, {
					id: "cover-content_html",
					packed_path: 'cover-content.html',
					data: util.string_content(util.image_content_string(packed_path)),
					type: "string",
				}, "Cover or Network-Cover");
				additives.push({
					id: util.file_id(value),
					packed_path: packed_path,
					data: rel_path,
					type: "local",
				});
			} break;

			case "Network-Cover": {
				let url = new URL(value);
				let packed_path = util.url_packed_path(url);
				cover = dedup_field(cover, {
					id: "network-cover-content_html",
					packed_path: 'network-cover-content.html',
					data: util.string_content(util.image_content_string(packed_path)),
					type: "string",
				}, "Cover or Network-Cover");
				additives.push({
					id: util.url_id(url),
					packed_path: packed_path,
					data: value,
					type: "local",
				});
			} break;

			case "Include":
				if(!util.file_exists(rel_path))
					throw new BookError(`Include path "${rel_path}" nonexistant`);
				additives.push({
					id: util.file_id(value),
					packed_path: util.file_packed_path(value),
					data: rel_path,
					type: "local",
				});
				break;

			case "Network-Include": {
				let url = new URL(value);
				additives.push({
					id: util.url_id(url),
					packed_path: util.url_packed_path(url),
					data: value,
					type: "local",
				});
			} break;

			case "Network-Include": {
				let url = new URL(value);
				additives.push({
					id: util.url_id(url),
					packed_path: util.url_packed_path(url),
					data: value,
					type: "local",
				});
			} break;
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

		cover: cover,
		contents: contents,
		additives: additives,
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
