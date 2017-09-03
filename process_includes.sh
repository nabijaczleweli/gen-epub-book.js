#!/usr/bin/env bash

# The MIT License (MIT)

# Copyright (c) 2017 nabijaczleweli

# Permission is hereby granted, free of charge, to any person obtaining a copy of
# this software and associated documentation files (the "Software"), to deal in
# the Software without restriction, including without limitation the rights to
# use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
# the Software, and to permit persons to whom the Software is furnished to do so,
# subject to the following conditions:

# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.

# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
# FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
# COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
# IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
# CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


asset_dir="$1"
shift

sys_temp="$TMP"
if [[ "$sys_temp" == "" ]]; then
	sys_temp="$TEMP"
	if [[ "$sys_temp" == "" ]]; then
		sys_temp="/tmp"
	fi
fi

temp_dir="$(mktemp -dp $sys_temp gen-epub-book.js-process_includes.XXXXXXXXXX)/"
temp_file="${temp_dir}.log"
echo > "$temp_file"

for i in "$@"; do
	mkdir -p "$(dirname "$temp_dir$i")"
	cp "$i" "$temp_dir$i"
	gawk '
		# Based on https://www.gnu.org/software/gawk/manual/html_node/Readfile-Function.html
		function readfile(fname) {
			old_rs = RS
			RS = "^$"

			getline file_content < fname
			close(fname)

			RS = old_rs
			return file_content
		}

		function escape(s) {
			# Note the ZWNJ, awk has trouble processing \\n or any variant thereof
			return gensub(/\n/, "‌n‌", "g", gensub("\"", "‌\"‌", "g", s));
		}


		/\$\${include\([^)]+\)}/ {
			fname = "'"$asset_dir"'" gensub(/.*\$\${include\(([^)]+)\)}.*/, "\\1", "g")
			read = readfile(fname)
			escaped = escape(read)
			print(gensub(/\$\${include\((.+)\)}/, escaped, "g"))
			print("Included " fname " in '"$i"'") >> "'"$temp_file"'"
		}

		!/\$\${include\([^)]+\)}/
	' "$temp_dir$i" > "$i"
	sed -i -e 's/‌n‌/\\n\\\n/g' -e 's/‌"‌/\\"/g' "$i"
done

cat "$temp_file"
