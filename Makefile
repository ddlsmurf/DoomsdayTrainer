# Doomsday Trainer — the page is a single self-contained file; these are just
# conveniences for running and checking it.

PAGE  := index.html
PORT  ?= 8137
HOST  ?= 127.0.0.1

.DEFAULT_GOAL := help
.PHONY: help serve open test test-page

help: ## Show this list
	@grep -hE '^[a-z-]+:.*?## ' $(MAKEFILE_LIST) | sed -e 's/:.*## /\t/' | expand -t 12

serve: ## Serve the page over HTTP, printing the URL (use this to test on a phone)
	@echo "http://$(HOST):$(PORT)/$(PAGE)"
	@python3 -m http.server $(PORT) --bind $(HOST)

open: ## Open the page straight from the filesystem
	@open $(PAGE)

test: ## Syntax-check the page and verify the algorithm for every date 1583-2999
	@node tools/selftest.mjs $(PAGE)

test-page: ## Run the same verification inside the browser
	@open "$(PAGE)?selftest=1"
