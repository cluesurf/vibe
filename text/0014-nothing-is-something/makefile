# Build with lualatex. The bibliography is inline (thebibliography), so no bibtex pass.
text: clean
	@lualatex vibe.tex
	@lualatex vibe.tex
.PHONY: text

# Build with pdflatex, the engine arXiv uses by default.
pdf: clean
	@pdflatex -interaction=nonstopmode vibe.tex
	@pdflatex -interaction=nonstopmode vibe.tex
.PHONY: pdf

# Build the arXiv source bundle. This paper is a single self-contained vibe.tex
# with an inline bibliography, so the bundle is just that file. Upload
# arxiv-submission.zip to arxiv.org.
arxiv: pdf
	@rm -rf arxiv-submission arxiv-submission.zip
	@mkdir -p arxiv-submission
	@cp vibe.tex arxiv-submission/
	@cd arxiv-submission && zip -r -X ../arxiv-submission.zip . > /dev/null
	@echo "arXiv bundle ready: arxiv-submission.zip"
.PHONY: arxiv

clean:
	@rm -f *.aux *.log *.out *.toc *.lof *.lot *.bbl *.blg *.thm
.PHONY: clean
