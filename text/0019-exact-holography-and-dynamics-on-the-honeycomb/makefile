# Build with pdflatex, the engine arXiv uses by default.
pdf:
	@pdflatex -interaction=nonstopmode vibe.tex
	@bibtex vibe || true
	@pdflatex -interaction=nonstopmode vibe.tex
	@pdflatex -interaction=nonstopmode vibe.tex
.PHONY: pdf

text:
	@lualatex -interaction=nonstopmode vibe.tex
	@bibtex vibe || true
	@lualatex -interaction=nonstopmode vibe.tex
	@lualatex -interaction=nonstopmode vibe.tex
.PHONY: text

arxiv: pdf
	@mkdir -p arxiv-submission/text
	@cp vibe.tex vibe.bib vibe.bbl arxiv-submission/
	@cp text/package.tex text/abstract.tex text/01-overview-and-setup.tex text/02-spectral-geometry.tex text/03-holography-and-continuum.tex text/04-composites-scattering-relativity.tex text/05-spin1-and-mass-gaps.tex text/06-decoherence-born-selves.tex text/07-lean4-and-open-frontiers.tex arxiv-submission/text/
	@cd arxiv-submission && zip -r -X ../arxiv-submission.zip . > /dev/null
	@echo "arXiv bundle ready: arxiv-submission.zip"
.PHONY: arxiv
