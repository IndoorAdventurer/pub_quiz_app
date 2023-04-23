import WidgetSnippets from "../src/view/widgetsnippets";
import { readFileSync } from "fs";

describe("Basic snippet functionality", () => {

    test("Union of two WidgetSnippets that have no overlap", () => {

        let w1 = new WidgetSnippets();
        let w2 = new WidgetSnippets();

        w1.add_html_snippet("<template class=\"cls\">A</template>")
          .add_html_snippet("<template class=\"cls\">B</template>")
          .add_html_snippet("<template class=\"cls\">C</template>")
          .add_css_snippet("css1")
          .add_css_snippet("css2")
          .add_css_snippet("css3")
          .add_js_snippet("(function(){x})();")
          .add_js_snippet("(function(){y})();")
          .add_js_snippet("(function(){z})();");
        
          w2.add_html_snippet("<template class=\"cls\">X</template>")
          .add_html_snippet("<template class=\"cls\">Y</template>")
          .add_html_snippet("<template class=\"cls\">Z</template>")
          .add_css_snippet("css4")
          .add_css_snippet("css5")
          .add_css_snippet("css6")
          .add_js_snippet("(function(){a})();")
          .add_js_snippet("(function(){b})();")
          .add_js_snippet("(function(){c})();");
        
        w1 = w1.union(w2);

        const html = w1.get_html();
        const html2 = w2.get_html();
        const js = w1.get_js();
        const js2 = w2.get_js();
        const css = w1.get_css();
        const css2 = w2.get_css();

        expect(html.includes("<template class=\"cls\">A</template>")).toBe(true);
        expect(html.includes("<template class=\"cls\">B</template>")).toBe(true);
        expect(html.includes("<template class=\"cls\">C</template>")).toBe(true);
        expect(html.includes("<template class=\"cls\">X</template>")).toBe(true);
        expect(html.includes("<template class=\"cls\">Y</template>")).toBe(true);
        expect(html.includes("<template class=\"cls\">Z</template>")).toBe(true);

        expect(html2.includes("<template class=\"cls\">A</template>")).toBe(false);
        expect(html2.includes("<template class=\"cls\">B</template>")).toBe(false);
        expect(html2.includes("<template class=\"cls\">C</template>")).toBe(false);
        expect(html2.includes("<template class=\"cls\">X</template>")).toBe(true);
        expect(html2.includes("<template class=\"cls\">Y</template>")).toBe(true);
        expect(html2.includes("<template class=\"cls\">Z</template>")).toBe(true);

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

        expect(js.includes("(function(){x})();")).toBe(true);
        expect(js.includes("(function(){y})();")).toBe(true);
        expect(js.includes("(function(){z})();")).toBe(true);
        expect(js.includes("(function(){a})();")).toBe(true);
        expect(js.includes("(function(){b})();")).toBe(true);
        expect(js.includes("(function(){c})();")).toBe(true);

        expect(js2.includes("(function(){x})();")).toBe(false);
        expect(js2.includes("(function(){y})();")).toBe(false);
        expect(js2.includes("(function(){z})();")).toBe(false);
        expect(js2.includes("(function(){a})();")).toBe(true);
        expect(js2.includes("(function(){b})();")).toBe(true);
        expect(js2.includes("(function(){c})();")).toBe(true);
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

        w1.add_html_snippet("<template class=\"cls\">A</template>")
          .add_html_snippet("<template class=\"cls\">B</template>")
          .add_html_snippet("<template class=\"cls\">C</template>")
          .add_css_snippet("css1")
          .add_css_snippet("css2")
          .add_css_snippet("css3")
          .add_js_snippet("(function(){x})();")
          .add_js_snippet("(function(){y})();")
          .add_js_snippet("(function(){z})();");
        
          w2.add_html_snippet("<template class=\"cls\">A</template>")
          .add_css_snippet("css3")
          .add_js_snippet("(function(){x})();");
        
        const html = w1.get_html();
        const js = w1.get_js();
        const css = w1.get_css();

        w1.add_html_snippet("<template class=\"cls\">B</template>")
          .add_css_snippet("css2")
          .add_js_snippet("(function(){z})();");
        
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
    });

    test("Should properly handle scripts with imports", () => {

      let throws = 0;

      const ws = new WidgetSnippets();
      ws.add_js_snippet(
`
import x from "x.js";
import * as y from "y.js";

     import {a, b, c} from "abc.js";

(function(){})();
`
      );

      let js = ws.get_js();
      console.log(js);
      
      ws.add_js_snippet("import x from \"x.js\";\n(function(){})();")

      expect(ws.get_js()).toBe(js);

      const bads = [
        "importt x from \"x.js\";\n(function(){})();",
        "import x from \"x.js\"\n(function(){})();",
        "import x from \"x.js\";\n(function(){})()"
      ]

      for (const s of bads) {
        try {
          ws.add_js_snippet(s);
        } catch {
          ++throws;
        }
      }

      // It only throws for bad suntaxed IIFE. Bad imports get ignored.
      expect(throws).toBe(1);

      // Expect the bad import to have been ignored. Good IIFEs are identical
      // to the one present, so that one stays.
      expect(ws.get_js()).toBe(js);

    })
})