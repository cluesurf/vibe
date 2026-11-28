# Build with pdflatex, the engine arXiv uses by default.
pdf:
	@pdflatex -interaction=nonstopmode paper.tex
	@bibtex paper || true
	@pdflatex -interaction=nonstopmode paper.tex
	@pdflatex -interaction=nonstopmode paper.tex
.PHONY: pdf

arxiv: pdf
	@mkdir -p arxiv-submission/text
	@cp paper.tex paper.bib paper.bbl arxiv-submission/
	@cp text/package.tex text/abstract.tex text/01-introduction.tex text/02-geometry.tex text/03-addressing.tex text/04-expansion.tex text/05-universality.tex text/06-obstructions.tex text/07-open-problems.tex arxiv-submission/text/
	@cd arxiv-submission && zip -r -X ../arxiv-submission.zip . > /dev/null
	@echo "arXiv bundle ready: arxiv-submission.zip"
.PHONY: arxiv
