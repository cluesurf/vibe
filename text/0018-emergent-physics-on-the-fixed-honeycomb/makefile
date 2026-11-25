text: clean
	@lualatex vibe.tex
	@bibtex vibe || true
	@lualatex vibe.tex
	@lualatex vibe.tex
.PHONY: text

# Build with pdflatex, the engine arXiv uses by default.
pdf: clean
	@pdflatex -interaction=nonstopmode vibe.tex
	@bibtex vibe || true
	@pdflatex -interaction=nonstopmode vibe.tex
	@pdflatex -interaction=nonstopmode vibe.tex
.PHONY: pdf

# Build the arXiv source bundle: compile with pdflatex (to generate vibe.bbl,
# which arXiv needs since it does not run bibtex), stage only the source files,
# and zip them. Upload arxiv-submission.zip to arxiv.org.
arxiv: pdf
	@rm -rf arxiv-submission arxiv-submission.zip
	@mkdir -p arxiv-submission/text
	@cp vibe.tex vibe.bib vibe.bbl arxiv-submission/
	@cp text/package.tex text/abstract.tex text/00-scope.tex text/01-one-rule.tex text/02-quantum-foundations.tex text/03-relativity-and-speed-lock.tex text/04-dynamical-gravity.tex text/05-chirality-confinement-generations.tex text/06-cosmology.tex text/07-unified-and-lean4.tex text/08-open.tex text/A-index.tex arxiv-submission/text/
	@cd arxiv-submission && zip -r -X ../arxiv-submission.zip . > /dev/null
	@echo "arXiv bundle ready: arxiv-submission.zip"
.PHONY: arxiv

clean:
	@rm -f *.aux *.log *.out *.toc *.lof *.lot *.bbl *.blg *.thm
.PHONY: clean
