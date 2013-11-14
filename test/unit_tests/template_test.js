module("Templates");

dt("Static Templates", 7, function() {
	var empty_template = cjs.template("", {});
	equal(empty_template.textContent, "");

	var hello_template = cjs.template("hello world", {});
	equal(hello_template.textContent, "hello world");

	var div_template = cjs.template("<div>hi</div>", {});
	equal(div_template.tagName.toLowerCase(), "div");
	equal(div_template.textContent, "hi");

	var nested_div_template = cjs.template("<div>hi <strong>world</strong></div>", {});
	equal(nested_div_template.tagName.toLowerCase(), "div");
	var strong_content = nested_div_template.getElementsByTagName("strong")[0];
	equal(strong_content.textContent, "world");

	var classed_template = cjs.template("<div class='my_class'>yo</div>", {});
	equal(classed_template.className, "my_class");
});

dt("Dynamic Templates", 3, function() {
	var t1 = cjs.template("{{x}}", {x: "hello world"});
	equal(t1.textContent, "hello world");

	var greet = cjs("hello");
	var t2 = cjs.template("{{x}}", {x: greet});
	equal(t2.textContent, "hello");
	greet.set("bye");
	equal(t2.textContent, "bye");
})