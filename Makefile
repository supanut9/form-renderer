.PHONY: setup typecheck build clean

setup:
	npm install

typecheck:
	npm run typecheck

build:
	npm run build

clean:
	rm -rf dist node_modules tsconfig.tsbuildinfo
