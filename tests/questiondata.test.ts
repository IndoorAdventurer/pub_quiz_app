import QuestionData from "../src/model/constituentstates/questiondata";

describe("Basic question data mechanics", () => {
    
    test("Testing case insensitive situation", () => {

        const qd = new QuestionData("aap");

        qd.processAnswer("piet", "Aap");
        expect(qd.player_answers.length === 3).toBe(false);
        qd.processAnswer("jan", "aap");
        expect(qd.player_answers.length === 3).toBe(false);
        qd.processAnswer("derk", "noot");
        expect(qd.player_answers.length === 3).toBe(true);

        const s = qd.setDumpAndClear();
        expect(s.has("piet")).toBe(true);
        expect(s.has("jan")).toBe(true);
        expect(s.has("derk")).toBe(false);

    });

    test("Testing case sensitive situation", () => {

        const qd = new QuestionData("aap", true);

        qd.processAnswer("piet", "Aap");
        expect(qd.player_answers.length === 3).toBe(false);
        qd.processAnswer("jan", "aap");
        expect(qd.player_answers.length === 3).toBe(false);
        qd.processAnswer("derk", "noot");
        expect(qd.player_answers.length === 3).toBe(true);

        const s = qd.setDumpAndClear();
        expect(s.has("piet")).toBe(false);
        expect(s.has("jan")).toBe(true);
        expect(s.has("derk")).toBe(false);

    });

    test("Testing ordering", () => {

        const qd = new QuestionData("aap");

        qd.processAnswer("piet", "Aap");
        expect(qd.player_answers.length === 3).toBe(false);
        qd.processAnswer("derk", "noot");
        expect(qd.player_answers.length === 3).toBe(false);
        qd.processAnswer("jan", "aap");
        expect(qd.player_answers.length === 3).toBe(true);

        const l = qd.listDumpAndClear();
        expect(l.indexOf("piet")).toBe(0);
        expect(l.indexOf("derk")).toBe(-1);
        expect(l.indexOf("jan")).toBe(1);

    });

    test("Testing adding more correct answers", () => {

        const qd = new QuestionData("aap", true);

        qd.processAnswer("piet", "Aap");
        expect(qd.player_answers.length === 3).toBe(false);
        qd.processAnswer("jan", "aap");
        expect(qd.player_answers.length === 3).toBe(false);
        qd.processAnswer("derk", "noot");
        expect(qd.player_answers.length === 3).toBe(true);

        qd.addCorrectAnswers(["noot"]);

        const s = qd.setDumpAndClear();
        expect(s.has("piet")).toBe(false);
        expect(s.has("jan")).toBe(true);
        expect(s.has("derk")).toBe(true);
    });

    test("A second answer of a player should get ingored", () => {
        const qd = new QuestionData("aap", true);

        qd.processAnswer("piet", "Aap");
        expect(qd.player_answers.length).toBe(1);
        qd.processAnswer("jan", "aap");
        expect(qd.player_answers.length).toBe(2);
        qd.processAnswer("piet", "aap");
        expect(qd.player_answers.length).toBe(2);
        qd.processAnswer("derk", "noot");
        expect(qd.player_answers.length).toBe(3);
        qd.processAnswer("derk", "aap");
        expect(qd.player_answers.length).toBe(3);

        const s = qd.setDumpAndClear();
        expect(s.has("piet")).toBe(false);
        expect(s.has("jan")).toBe(true);
        expect(s.has("derk")).toBe(false);
    })
    
});