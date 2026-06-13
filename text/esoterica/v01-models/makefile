text: clean
	@lualatex esoterica.tex
	@bibtex esoterica
	@lualatex esoterica.tex
	@lualatex esoterica.tex
.PHONY: text

clean:
	@rm -f *.aux *.log *.out *.toc *.lof *.lot *.bbl *.blg text/**/*.aux
.PHONY: clean
