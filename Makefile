
build: index.js src
	@component-build --dev

components: component.json
	@component-install --dev

dist: build
	@component-build -s xgui -n xgui -o dist/ \
		&& cd utils \
		&& python builder.py

clean:
	rm -rf components build dist

.PHONY: clean
