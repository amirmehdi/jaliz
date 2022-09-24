import {ArraySchema, Schema, type} from "@colyseus/schema";

export class Offer extends Schema {
    @type("string")
    from: string;
    @type("string")
    to: string;
    @type(["uint8"])
    receive: number[] = new ArraySchema<number>()
    @type(["uint8"])
    give: number[] = new ArraySchema<number>()

    toString(): string {
        return `from:${this.from} receive:${Array.from(this.receive)} to:${this.to} give:${Array.from(this.give)}`;
    }
}
