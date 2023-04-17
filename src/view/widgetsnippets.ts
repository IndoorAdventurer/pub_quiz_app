import { readFileSync } from "fs";

/**
 * You can think of this class as a collection of code snippets that will be
 * sent to the client for rendering of all widgets we define.
 * 
 * Internally it keeps sets for, respectively, html, javascript and css. It
 * makes sure all snippets it contains in these sets are unique, such that at
 * the end it can create the client code without any duplicates.
 */
export default class WidgetSnippets {

    private html_snippets = new Set<string>();
    private js_snippets = new Set<string>();
    private js_import_snippets = new Set<string>();
    private css_snippets = new Set<string>();

    /**
     * Add an html snippet to the set of snippets
     * @param snippet snippet of html. Each html snippet has to define a single
     * page as an html template. **So it has to be formatted as follows**:
     * ```html
     * <template id="some_id">
     * <!-- your code here -->
     * </template>
     * ```
     * `some_id` should be the `name` attribute of the `GameState` object that
     * sends an update to the client!
     * @returns A reference to `this` for chaining
     * @throws An error if the html code is not wrapped in a template!
     */
    public add_html_snippet(snippet: `<template${string}`): WidgetSnippets {
        const template_regex = /^\s*<template[\s\S]*<\/template>\s*$/;
        if (!template_regex.test(snippet))
            throw new Error("Found widget that is not in template!");
        this.html_snippets.add(snippet);
        return this;
    }

    /**
     * Add a javascript snippet to the set of snippets. In some cases this
     * might be optional, as not all templates will need an associated snippet.
     * @param snippet snippet of javascript. Should be associated with an html
     * template (see `add_html_snippet`), and should define a listener for
     * incomming messages as follows:
     * ```javascript
     * (function() {
     * document.addEventListener("some_name", (ev) => {
     * const obj = ev.detail;
     * // modify page described in template with id "some_id", using the info
     * // in obj.
     * })
     * // other stuff
     * })();
     * ```
     * * `some_name` should be the `name` attribute of the `GameState` object
     * that sends an update to the client!.
     * * the current active page will be globally defined as `active_page`, so
     * you can search the DOM from it instead of from `document`.
     * * **IMPORTANT:** you have to use an Immediately Invoked Function
     * Expression (IIFE) to wrap your code in to avoid naming conflicts! You are
     * allowed to use ES6 import statements, however.
     * @returns A reference to `this` for chaining
     * @throws An error if the code is not wrapped in an IIFE!
     */
    public add_js_snippet(snippet: string): WidgetSnippets {
        const iife_regex =
        /\(\s*function\s*\(\s*\)\s*{[\s\S]*}\s*\)\s*\(\s*\)\s*;/m;
        const import_regex = /^[ \t]*import.*;$/gm;

        const iife = snippet.match(iife_regex)?.[0];
        if (!iife)
            throw new Error("Javascript snippet not wrapped in IIFE!");

        // Add the iife to the list of snippets:
        this.js_snippets.add(iife);
        
        // Add all imports too
        this.union_aux(
            this.js_import_snippets,
            new Set<string>(snippet.match(import_regex))
        );

        return this;
    }

    /**
     * Add a css snippet to the set of snippets. This is only needed when the
     * associated template (see `add_html_snippet`) requires some extra css.
     * @param snippet The css snippet to be added. In order to avoid conflicts
     * make it apply only to descendants of the "some_id" div defined as
     * template in `add_html_snippet`. So:
     * ```css
     * #some_id x {
     * ...
     * }
     * ```
     * instead of:
     * ```css
     * x {
     * ...
     * }
     * ```
     * @returns  A reference to `this` for chaining
     */
    public add_css_snippet(snippet: string): WidgetSnippets {
        this.css_snippets.add(snippet);
        return this;
    }

    /**
     * Loads `file_name`, and then calls `add_html_snippet(file_name)`.
     * See `add_html_snippet()` for more info!
     * @returns  A reference to `this` for chaining
     */
    public add_html_file(file_name: `${string}.html`): WidgetSnippets {
        this.add_file(file_name, this.add_html_snippet);
        return this;
    }

    /**
     * Loads `file_name`, and then calls `add_js_snippet(file_name)`.
     * See `add_js_snippet()` for more info!
     * @returns  A reference to `this` for chaining
     */
    public add_js_file(file_name: `${string}.js`): WidgetSnippets {
        this.add_file(file_name, this.add_js_snippet);
        return this;
    }

    /**
     * Loads `file_name`, and then calls `add_css_snippet(file_name)`.
     * See `add_css_snippet()` for more info!
     * @returns  A reference to `this` for chaining
     */
    public add_css_file(file_name: `${string}.css`): WidgetSnippets {
        this.add_file(file_name, this.add_css_snippet);
        return this;
    }

    /**
     * Computes the union of itself and `other` in place, and returns a
     * reference to itself.
     * @param other Another `WidgetSnippets` object.
     * @returns A reference to `this`, which will now be modified such that
     * for the 3 sets (one for html snippets, one for js snippets, and one for
     * css snippets) it has taken the union of `this` and `other`.
     */
    public union(other: WidgetSnippets): WidgetSnippets {
        this.union_aux(this.html_snippets, other.html_snippets);
        this.union_aux(this.js_snippets, other.js_snippets);
        this.union_aux(this.js_import_snippets, other.js_import_snippets);
        this.union_aux(this.css_snippets, other.css_snippets);
        return this;
    }

    /**
     * Concatenates all html snippets/templates into a single string, and
     * returns it.
     */
    public get_html(): string {
        return this.concat_all(this.html_snippets);
    }

    /**
     * Concatenates all javascript snippets and returns it. **IMPORTANT:** if
     * you are going to include this in an html file, make sure you wrap it in
     * a `<script defer></script>` block!
     */
    public get_js(): string {
        // Getting all imports, and changing paths so it works on the client
        // side:
        const imports = Array.from(this.js_import_snippets, (imp) => {
            return imp.replace("../client_scripts/", "./scripts/") + "\n";
        });

        // Returning first all imports on separate lines and then all IIFEs:
        return this.concat_all(imports) +  this.concat_all(this.js_snippets);
    }

    /**
     * Concatenates all css snippets into a single string and returns it.
     * **IMPORTANT:** if you are going to include this in an html file, make
     * sure you wrap it in a `<style>` block!
     */
    public get_css(): string {
        return this.concat_all(this.css_snippets);
    }

    /**
     * Private member: loads file and calls `func`.
     */
    private add_file(file_name: string, func: (str: any) => void): void {
        const file = readFileSync(file_name, "utf-8");
        func.call(this, file);
    }

    /**
     * Private member: implements the union function for two sets in place
     */
    private union_aux(setA: Set<string>, setB: Set<string>): void {
        for (const mem of setB)
            setA.add(mem);
    }

    /**
     * Private member: concats all string elements in a set with newlines
     * inbetween.
     */
    private concat_all(set: Set<string> | string[]): string {
        let ret = "";
        for (const mem of set)
            ret += mem + "\n";
        return ret;
    }
}