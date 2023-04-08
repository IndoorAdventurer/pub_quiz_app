import WidgetSnippets from "../src/view/widgetsnippets";
import { readFileSync } from "fs";

describe("Basic snippet functionality", () => {

    test("Union of two WidgetSnippets that have no overlap", () => {

        let w1 = new WidgetSnippets();
        let w2 = new WidgetSnippets();

        w1.add_html_snippet("<template>A</template>")
          .add_html_snippet("<template>B</template>")
          .add_html_snippet("<template>C</template>")
          .add_css_snippet("css1")
          .add_css_snippet("css2")
          .add_css_snippet("css3")
          .add_js_snippet("x")
          .add_js_snippet("y")
          .add_js_snippet("z");
        
          w2.add_html_snippet("<template>X</template>")
          .add_html_snippet("<template>Y</template>")
          .add_html_snippet("<template>Z</template>")
          .add_css_snippet("css4")
          .add_css_snippet("css5")
          .add_css_snippet("css6")
          .add_js_snippet("a")
          .add_js_snippet("b")
          .add_js_snippet("c");
        
        w1 = w1.union(w2);

        const html = w1.get_html();
        const html2 = w2.get_html();
        const js = w1.get_js();
        const js2 = w2.get_js();
        const css = w1.get_css();
        const css2 = w2.get_css();

        expect(html.includes("<template>A</template>")).toBe(true);
        expect(html.includes("<template>B</template>")).toBe(true);
        expect(html.includes("<template>C</template>")).toBe(true);
        expect(html.includes("<template>X</template>")).toBe(true);
        expect(html.includes("<template>Y</template>")).toBe(true);
        expect(html.includes("<template>Z</template>")).toBe(true);

        expect(html2.includes("<template>A</template>")).toBe(false);
        expect(html2.includes("<template>B</template>")).toBe(false);
        expect(html2.includes("<template>C</template>")).toBe(false);
        expect(html2.includes("<template>X</template>")).toBe(true);
        expect(html2.includes("<template>Y</template>")).toBe(true);
        expect(html2.includes("<template>Z</template>")).toBe(true);

        expect(css.includes("css1")).toBe(true);
        expect(css.includes("css2")).toBe(true);
        expect(css.includes("css3")).toBe(true);
        expect(css.includes("css4")).toBe(true);
        expect(css.includes("css5")).toBe(true);
        expect(css.includes("css6")).toBe(true);

        expect(css2.includes("css1")).toBe(false);
        expect(css2.includes("css2")).toBe(false);
        expect(css2.includes("css3")).toBe(false);
        expect(css2.includes("css4")).toBe(true);
        expect(css2.includes("css5")).toBe(true);
        expect(css2.includes("css6")).toBe(true);

        expect(js.includes("x")).toBe(true);
        expect(js.includes("y")).toBe(true);
        expect(js.includes("z")).toBe(true);
        expect(js.includes("a")).toBe(true);
        expect(js.includes("b")).toBe(true);
        expect(js.includes("c")).toBe(true);

        expect(js2.includes("x")).toBe(false);
        expect(js2.includes("y")).toBe(false);
        expect(js2.includes("z")).toBe(false);
        expect(js2.includes("a")).toBe(true);
        expect(js2.includes("b")).toBe(true);
        expect(js2.includes("c")).toBe(true);
    })

    test("Using the file methods", () => {
        const w1 = new WidgetSnippets();
        const html_file = "./tests/widget_test_html.html";
        const js_file = "./tests/widget_test_js.js";
        const css_file = "./tests/widget_test_css.css";

        w1.add_html_file(html_file)
          .add_js_file(js_file)
          .add_css_file(css_file);

        expect(w1.get_html().includes(readFileSync(html_file, "utf-8"))).toBe(true);
        expect(w1.get_js().includes(readFileSync(js_file, "utf-8"))).toBe(true);
        expect(w1.get_css().includes(readFileSync(css_file, "utf-8"))).toBe(true);
    })

    test("Overlap tests", () => {
        let w1 = new WidgetSnippets();
        let w2 = new WidgetSnippets();

        w1.add_html_snippet("<template>A</template>")
          .add_html_snippet("<template>B</template>")
          .add_html_snippet("<template>C</template>")
          .add_css_snippet("css1")
          .add_css_snippet("css2")
          .add_css_snippet("css3")
          .add_js_snippet("x")
          .add_js_snippet("y")
          .add_js_snippet("z");
        
          w2.add_html_snippet("<template>A</template>")
          .add_css_snippet("css3")
          .add_js_snippet("x");
        
        const html = w1.get_html();
        const js = w1.get_js();
        const css = w1.get_css();

        w1.add_html_snippet("<template>B</template>")
          .add_css_snippet("css2")
          .add_js_snippet("z");
        
        expect(w1.get_html() === html).toBe(true);
        expect(w1.get_js() === js).toBe(true);
        expect(w1.get_css() === css).toBe(true);
        expect(w2.get_html() === html).toBe(false);
        expect(w2.get_js() === js).toBe(false);
        expect(w2.get_css() === css).toBe(false);

        w1 = w1.union(w2);

        expect(w1.get_html() === html).toBe(true);
        expect(w1.get_js() === js).toBe(true);
        expect(w1.get_css() === css).toBe(true);
        expect(w2.get_html() === html).toBe(false);
        expect(w2.get_js() === js).toBe(false);
        expect(w2.get_css() === css).toBe(false);
    })
})