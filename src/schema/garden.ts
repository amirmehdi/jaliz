import {Schema, type} from "@colyseus/schema";

export class Garden extends Schema {

    @type("boolean")
    fertilizer: boolean = false
    @type("uint8")
    cardId: number = 0
    @type("uint8")
    cardCount: number = 0

}