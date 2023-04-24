import { readdirSync, readFileSync, writeFileSync } from "fs";

// The directory to scan:
const dir = "./src/model/fullstates/";

const out_file_path = "./src/model/allgamestates.ts";

// Collect all typescript files from dir:
const files = readdirSync(dir).filter(f => f.endsWith(".ts"));

// Collect all classes that derive from GameState:
const class_regex =
    /export[ \t]*default[ \t]*class[ \t]*([A-Z]\w*)[ \t]*extends[ \t]*GameState/;
const class_list: string[][] = [];
for (const file of files) {
    const full_path = dir + file;
    const contents = readFileSync(full_path, "utf-8");
    const class_name = contents.match(class_regex)?.[1];

    if (!class_name) {
        console.warn(`Did not find a valid class in file "${file}"`);
        continue;
    }

    class_list.push([file, class_name]);
}

// Creating an output typescript file:
let outfile = "";

// First gets all imports:
for (const [file, name] of class_list) {
    // Using NodeNext, so need to replace it with .js
    const to_js = file.replace(".ts", ".js");
    outfile += `import ${name} from "./fullstates/${to_js}"\n`;
}

// Now add middle part:
outfile +=
`

export const all_game_states = {\n`;

// All entries:
for (const [_, name] of class_list) {
    outfile += `    ${name.toLocaleLowerCase()} : ${name},`;
}

outfile += `
};`

writeFileSync(out_file_path, outfile, "utf-8");