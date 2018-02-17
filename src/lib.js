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
import JSZip from "jszip";
import {URL} from "url";
const strsplit = require("strsplit");
const request = require("request");
const uuid_v4 = require("uuid/v4");
const moment = require("moment");
const bcp47 = require("bcp-47");
const trim = require("trim");
const path = require("path");
const fs = require("fs");


/** Generic book parsing error. */
export class BookError extends Error {}


/** Parse specified file's content into a `Book` instance.
  *
  * @param string_contents the content of the specified file
  */
export function parse_descriptor(string_contents: string, relative_root: string, separator: string = ":", free_date: boolean = false): book.Book {
	let name: ?string = null;
	let author: ?string = null;
	let date: ?Moment = null;
	let language: ?Object = null;
	let cover: ?book.Content = null;
	let description: ?book.UnnamedContent = null;
	let contents: book.Content[] = [];
	let additives: book.Content[] = [];

	strsplit(string_contents, "\n").forEach((line, idx) => {
		let kv = strsplit(line, separator, 2);
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

			case "Date": {
				let dt = moment(value, util.RFC3339_FORMAT);
				if(free_date && !dt.isValid())
					dt = moment(value);

				date = dedup_field(date, dt, "Date");
				if(!date.isValid())
					throw new BookError(`Date value "${value}" not valid RFC3339${
						free_date ? ", nor any ISO8601 format, nor RFC2822, nor any format supported by Date" : ""}`);
			} break;

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
					data: url,
					type: "remote",
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
					data: url,
					type: "remote",
				});
			} break;

			case "Description":
				if(!util.file_exists(rel_path))
					throw new BookError(`Description path "${rel_path}" nonexistant`);
				description = dedup_field(description, {
					data: rel_path,
					type: "local",
				}, "Description, String-Description, or Network-Description");
				break;

			case "String-Description":
				description = dedup_field(description, {
					data: value,
					type: "string",
				}, "Description, String-Description, or Network-Description");
				break;

			case "Network-Description":
				description = dedup_field(description, {
					data: new URL(value),
					type: "remote",
				}, "Description, String-Description, or Network-Description");
				break;
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
		description: description,
		contents: contents,
		additives: additives,
	};
}

export function pack_book(book: book.Book): JSZip {
	let epub = new JSZip();
	epub.file("mimetype", "$${include(mimetype)}");
	epub.file("META-INF/container.xml", "$${include(container.xml)}");
	epub.file("content.opf", content_opf_s(book));
	epub.file("toc.ncx", toc_ncx_s(book));
	add_elements(book, epub);
	return epub;
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

function content_opf_s(buk: book.Book): Promise<string> {
	let description: Promise<string>;
		if(!buk.description)
			description = Promise.resolve("");
		else
			description = Promise.resolve(add_element(buk.description)).then(_ => "\t\t<dc:description>\n" + _ + "\t\t</dc:description>\n");

	return description.then((description: string) => {
		let cover: string = "";
		if(buk.cover)
			cover = `\t\t<meta name=\"cover\" content=\"${buk.cover.id}\" />\n`;

		let specified_ids: Set<string> = new Set();
		let specify_item = (ctnt: book.Content) => {
			if(specified_ids.has(ctnt.id))
				return;
			specified_ids.add(ctnt.id);

			return `\t\t<item href=\"${ctnt.packed_path}\" id=\"${ctnt.id}\" media-type=\"${util.get_mime_for(ctnt.packed_path)}\" />\n`;
		};

		let content: string = "";
		if(buk.cover)
			content = specify_item(buk.cover);
		content = buk.additives.reduce((acc, el) => acc + specify_item(el),
			        buk.contents.reduce((acc, el) => acc + specify_item(el),
			        content));

		let toclist: string = buk.contents.reduce((acc, el) => {
			return acc + `\t\t<itemref idref=\"${el.id}\" />\n`;
		}, "");

		let cover_guide: string = "";
		if(buk.cover)
			cover_guide = `\t\t<reference xmlns=\"http://www.idpf.org/2007/opf\" href=\"${buk.cover.packed_path}\" title=\"${buk.cover.id}\" type=\"cover\" />\n`;

		return "$${include(content.opf.header)}" +                                                   //
		       `\t\t<dc:title>${buk.name}</dc:title>\n` +                                            //
		       `\t\t<dc:creator opf:role=\"aut\">${buk.author}</dc:creator>\n` +                     //
		       `\t\t<dc:identifier id=\"uuid\" opf:scheme=\"uuid\">${buk.uuid}</dc:identifier>\n` +  //
		       `\t\t<dc:date>${buk.date.format(util.RFC3339_FORMAT)}</dc:date>\n` +                  //
		       cover +                                                                               //
		       description +                                                                         //
		       `\t</metadata>\n` +                                                                   //
		       `\t<manifest>\n` +                                                                    //
		       "$${include(content.opf.manifest-toc-line)}" +                                        //
		       content +                                                                             //
		       "\t</manifest>\n" +                                                                   //
		       "\t<spine toc=\"toc\">\n" +                                                           //
		       toclist +                                                                             //
		       "\t</spine>\n" +                                                                      //
		       "\t<guide>\n" +                                                                       //
		       cover_guide +                                                                         //
		       "$${include(content.opf.guide-toc-line)}" +                                           //
		       "\t</guide>\n" +                                                                      //
		       "</package>\n";
	});
}

function toc_ncx_s(buk: book.Book): Promise<string> {
	let titles: Promise<string>[] = buk.contents.filter(el => el.type === "local").map((el, i) =>
		new Promise((resolve, reject) => {
			fs.readFile(el.data, "utf-8", (err, data) => {
				if(err)
					throw err;

				let title: ?(string[]) = data.match(util.CHAPTER_TITLE_REGEX);
				if(title)
					resolve(`\t\t<navPoint id=\"${el.id}\" playOrder=\"${i + 1}\">\n` +  //
					        "\t\t\t<navLabel>\n" +                                       //
					        `\t\t\t\t<text>${title[1]}</text>\n` +                       //
					        "\t\t\t</navLabel>\n" +                                      //
					        `\t\t\t<content src=\"${el.packed_path}\" />\n` +            //
					        `\t\t</navPoint>\n`);                                        //
				else
					resolve("");
			});
		})
	);

	return Promise.all(titles).then(navs => navs.reduce((acc, el) => acc + el, "")).then(navmap =>
		"<?xml version='1.0' encoding='utf-8'?>\n" +                                                                                 //
		`<ncx xmlns=\"http://www.daisy.org/z3986/2005/ncx/\" version=\"2005-1\" xml:lang=\"${bcp47.stringify(buk.language)}\">\n` +  //
		"\t<head>\n" +                                                                                                               //
		`\t\t<meta content=\"${buk.uuid}\" name=\"dtb:uid\" />\n` +                                                                  //
		"\t\t<meta content=\"2\" name=\"dtb:depth\" />\n" +                                                                          //
		"\t</head>\n" +                                                                                                              //
		"\t<docTitle>\n" +                                                                                                           //
		`\t\t<text>${buk.name}</text>\n` +                                                                                           //
		"\t</docTitle>\n" +                                                                                                          //
		"\t<navMap>\n" +                                                                                                             //
		navmap +                                                                                                                     //
		"\t</navMap>\n" +                                                                                                            //
		"</ncx>"                                                                                                                     //
	);
}

function add_elements(buk: book.Book, zip: JSZip) {
	let written_fnames: Set<string> = new Set();
	let maybe_add_element = el => {
		if(written_fnames.has(el.packed_path))
			return;
		written_fnames.add(el.packed_path);
		zip.file(el.packed_path, add_element(el), {binary: true});
	};

	if(buk.cover)
		maybe_add_element(buk.cover);

	buk.contents.forEach(maybe_add_element);
	buk.additives.forEach(maybe_add_element);
}

function add_element(ctnt: book.Content | book.UnnamedContent) {
	switch(ctnt.type) {
		case "local":
			return new Promise((resolve, reject) => {
				fs.readFile(ctnt.data, (err, data) => {
					if(err)
						reject(err);
					else
						resolve(data);
				});
			});

		case "string":
			return ctnt.data;

		case "remote":
			return new Promise((resolve, reject) => {
				request.get({uri: ctnt.data}).on("response", (data) => {
					let buffer = [];
					data.on("data", d => buffer.push(d))
					data.on("end", () => resolve(Buffer.concat(buffer)))
				}).on("error", reject)
			});
	}
}
