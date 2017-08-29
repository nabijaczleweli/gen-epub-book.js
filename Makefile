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


NPM := npm
CALIBRE_CONVERT := ebook-convert

OUTDIR := out/
DSTDIR := dist/

BOOK_SOURCES := $(sort $(wildcard examples/*.epupp examples/**/*.epupp examples/**/**/*.epupp examples/**/**/**/*.epupp))

.PHONY : all examples


all : examples

clean :
	rm -rf $(OUTDIR) $(DSTDIR)

examples : $(DSTDIR)main.js $(foreach l,$(patsubst examples/%.epupp,$(OUTDIR)%,$(BOOK_SOURCES)),$(foreach m,epub mobi pdf azw3,$(l).$(m)))


$(OUTDIR)%.mobi : $(OUTDIR)%.epub
	@mkdir -p $(dir $@)
	$(CALIBRE_CONVERT) "$^" "$@"

$(OUTDIR)%.epub : $(DSTDIR)main.js examples/%.epupp
	@mkdir -p $(dir $@)
	@$< "$(filter-out $<,$^)" "$@"
