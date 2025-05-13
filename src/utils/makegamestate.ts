/**
 * Small AND UGLY script to create a new game state. Just run it with node and
 * answer the questions.
 */


import * as readline from "readline";
import fs from "fs";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

/**
 * Wrap readline question function in a promise so I can nicely use it in an
 * async function.
 * @param question The question to ask the user. Space character gets added to
 * end
 * @returns Promise of a string
 */
function askQuestion(question: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        rl.question(question + " ", resolve);
    });
}

/**
 * Ask a yes or no question that returns true for yes and false for no
 * @param question Question to be asked. " (y/n)" will be appended to end.
 * @returns Promise of a boolean
 */
async function askYesNoQuestion(question: string): Promise<boolean> {
    const yOrN = await askQuestion(question + " (y/n)");
    return yOrN.trim().toLocaleLowerCase()[0] === "y";
}


const gs_template =
    `import Game from "../game.js";
import GameState from "../gamestate.js";
import WidgetSnippets from "../../view/widgetsnippets.js";
import { GameDataMsg } from "../gametypes.js";
import yesOrThrow from "../../utils/yesorthrow.js";

/**
 * TODO: add description!
 */
export default class CLS_CAMEL extends GameState {

    public readonly name = "CLS_LOWER";

    /**
     * Constructor of \`CLS_CAMEL\`
     * @param parent_game The \`Game\` this lobby will be added to
     * @param config The config object.
     */
    constructor(parent_game: Game, config: { [key: string]: any }) {
        super(parent_game, config);
        // TODO: use config to init all needed fields. E.g.:
        // this.some_field = yesOrThrow(config, "some_field");
    }

    // @GameState.stateChanger
    // public begin_active() {
    //     // TODO
    // }

    // public end_active(): void {
    //     // TODO
    // }

    public bigScreenWidgets(): WidgetSnippets {
        return new WidgetSnippets()BIGSCREENWIDGETS;
    }

    public playerScreenWidgets(): WidgetSnippets {
        return new WidgetSnippets()PLAYERWIDGETS;
    }

    // public adminScreenWidgets(): WidgetSnippets {
    //     return new WidgetSnippets()ADMINWIDGETS;
    // }

    // public playerAnswer(name: string, response: string): boolean {
    //     // TODO
    //     return false;
    // }

    // public adminAnswer(obj: {[key: string]: any}): void {
    //     // TODO
    // }

    public stateMsg(): GameDataMsg {
        return {
            general_info: {},
            // admin_info: {},
            player_specific_info: {}
        };
    }
}`;

const html_template =
`<template class="CLS_LOWER">
    <!-- TODO -->
</template>`;

const ts_template =
`// Use following function in player widgets to send message to server:
// import { socketMessage } from "../client_scripts/playerscreen.js"
(function(){
    document.addEventListener("CLS_LOWER", (ev: Event) => {
        const msg = (ev as CustomEvent).detail.new_msg;
        // const msg_old = (ev as CustomEvent).detail.old_msg;
        // TODO
    });
})();`;

const css_template = `/* TODO */`;


(async function () {
    try {
        // Step 1: asking if it should go in ./src/model/fullstates or
        // ./src/model/constituentstates
        const isFull = await askYesNoQuestion(
            "Is this a full game state? In other words: can it directly be " +
            "added to the game? If not, it will be treated as a " +
            "constituent game state, which is meant to be used by other game " +
            "states to make a full one."
        );
        const target_dir_name = isFull ? "fullstates" : "constituentstates";

        // Step 2: asking for name, etc
        const camel_name = await askQuestion("Give a CamelCase class name for your template:");
        const lower_name = camel_name.toLocaleLowerCase();
        console.log(`All names will use: "${camel_name}" or "${lower_name}"`);

        // Step 3: checking if path is available still:
        const model_path = `./src/model/${target_dir_name}/${lower_name}.ts`;
        if (fs.existsSync(model_path))
            throw new Error(`"${model_path}" already exists.`);
        console.log(`The new gamestate will be found at: ${model_path}`);

        // Step 4: inserting names into model string:
        let gs = gs_template.replace(/CLS_CAMEL/g, camel_name)
            .replace(/CLS_LOWER/g, lower_name);

        // Step 5: asking what default widgets to make:
        let files: { path: string, content: string }[] = []
        const screens = [
            ["bigscreen", "BIGSCREENWIDGETS"],
            ["playerscreen", "PLAYERWIDGETS"],
            ["adminscreen", "ADMINWIDGETS"]
        ];
        for (const screen of screens) {
            const result = await addWidgets(lower_name, screen[0]);
            files = files.concat(result.files);
            gs = gs.replace(screen[1], result.source);
        }
        files.push({ path: model_path, content: gs });

        // STEP 6: showing user all changes and ask to proceed:
        console.log("-----The-template-will-look-like-this:-------------");
        console.log(gs);
        console.log("-----And-the-following-files-will-be-created:------");
        for (const f of files)
            console.log(f.path);
        if (await askYesNoQuestion("Do you want to proceed?")) {
            for (const f of files)
                fs.writeFileSync(f.path, f.content.replace(/\n/g, "\r\n"), "utf-8");
            console.log("All done!");
        }

        console.log("Goodbye! 😊");
        rl.close();

    } catch (error: any) {
        if ("message" in error)
            console.warn("ERROR:", error.message);

        console.warn("Closing due to error");
        rl.close();
    }

})();

async function addWidgets(name: string, type: string): Promise<widgets_collection> {
    let source = "";
    const files: { path: string, content: string }[] = [];

    const widget_types = [
        { name: "html", include: "./src/view/html/widgets/", inc_ext: ".html", path: "./src/view/html/widgets/", path_ext: ".html", template: html_template },
        { name: "js", include: "./dist/view/widget_scripts/", inc_ext: ".js", path: "./src/view/widget_scripts/", path_ext: ".ts", template: ts_template },
        { name: "css", include: "./src/view/widgets_css/", inc_ext: ".css", path: "./src/view/widgets_css/", path_ext: ".css", template: css_template }
    ];

    for (const t of widget_types) {
        if (await askYesNoQuestion(`Add ${t.name} for ${type}?`)) {
            const path = t.path + name + "_" + type + t.path_ext;
            if (fs.existsSync(path))
                throw new Error(`"${path}" already exists.`);
            const content = t.template.replace(/CLS_LOWER/g, name);

            console.log(`The new ${t.name} will be found at: "${path}". Contents:`);
            console.log(content);
            files.push({ path: path, content: content });

            source += "\n            .add_" + t.name + "_file(\"" + t.include + name + "_" + type + t.inc_ext + "\")";
        }
    }

    return { source: source, files: files };
}

type widgets_collection = {
    source: string,
    files: { path: string, content: string }[]
}