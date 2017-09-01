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


import type {URL} from "url";
const fs = require("fs");


/** Format string to parse RFC3339 with `moment`. */
export const RFC3339_FORMAT: string = "YYYY-MM-DDTHH:mm:ssZ";


/** Check whether a file with the specified path exists.
  *
  * @param path The file for whose existence to check.
  * @return Whether the specified file exists.
  */
export function file_exists(path: string): boolean {
	try {
		fs.accessSync(path);
		return true;
	} catch(_) {
		return false;
	}
}

/** Get content of string-content, having provided the content of that string-content (yes).
  *
  * @param content String data of that string content.
  * @return String content to include in e-book.
  */
export function string_content(content: string): string {
	return "$${include(string_content_header.html)}\t" +  //
	       content +                                      //
	       "$${include(string_content_footer.html)}";
}

/** Get img filler for image-content.
  *
  * @param img_path Packed path of image.
  * @return Stringified &lt;img&gt; tag.
  */
export function image_content_string(img_path: string): string {
	return `<img href="${img_path}" alt="${img_path}"></img>`;
}

/** Get e-book ID for the specified relative path.
  *
  * @param file_path Pathname specified in `"Content"` key.
  * @return E-book ID to use for content.
  */
export function file_id(file_path: string): string {
	return file_packed_path(file_path).replace(/\./g, "_");
}

/** Get packed e-book path for the specified relative path.
  *
  * @param file_path Pathname specified in `"Content"` key.
  * @return E-book path to use for content.
  */
export function file_packed_path(file_path: string): string {
	return file_path.replace(/\\/g, "/").replace(/\.\.\//g, "").replace(/\.\//g, "").replace(/\//g, "-");
}

/** Get e-book ID for the specified URL.
  *
  * @param file_path Pathname specified in `"Remote-*"` key.
  * @return E-book ID to use for content.
  */
export function url_id(url: URL): string {
	return url_packed_path(url).replace(/\./g, "_");
}

/** Get packed e-book path for the specified URL.
  *
  * @param url Pathname specified in `"Remote-*"` key.
  * @return E-book path to use for content.
  */
export function url_packed_path(url: URL): string {
	return file_packed_path(url.pathname.substr(url.pathname.lastIndexOf("/") + 1));
}
