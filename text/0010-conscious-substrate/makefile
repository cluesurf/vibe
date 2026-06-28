text: clean
	@lualatex vibe.tex
	@bibtex vibe || true
	@lualatex vibe.tex
	@lualatex vibe.tex
.PHONY: text

clean:
	@rm -f *.aux *.log *.out *.toc *.lof *.lot *.bbl *.blg
.PHONY: clean
