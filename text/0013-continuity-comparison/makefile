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
	@cp vibe.tex vibe.bib vibefirst.bst vibe.bbl arxiv-submission/
	@cp text/*.tex arxiv-submission/text/
	@cd arxiv-submission && zip -r -X ../arxiv-submission.zip . > /dev/null
	@echo "arXiv bundle ready: arxiv-submission.zip"
.PHONY: arxiv

clean:
	@rm -f *.aux *.log *.out *.toc *.lof *.lot *.bbl *.blg *.thm
.PHONY: clean
