text: clean
	@lualatex text.tex
	@bibtex text || true
	@lualatex text.tex
	@lualatex text.tex
.PHONY: text

clean:
	@rm -f *.aux *.log *.out *.toc *.lof *.lot *.bbl *.blg
.PHONY: clean
