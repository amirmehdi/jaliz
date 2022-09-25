import {ArraySchema, Schema, type} from "@colyseus/schema";
import {Client, Deferred} from "colyseus";
import {Garden} from "./garden";

export class Player extends Schema {

    @type("string")
    name: string = ""
    @type("string")
    color: string = ""
    @type([Garden])
    boards = new ArraySchema<Garden>();
    @type(["number"])
    cards: number[] = new ArraySchema<number>()
    @type(["number"])
    offerCards: number[] = new ArraySchema<number>()
    @type(["number"])
    tradedCards: number[] = new ArraySchema<number>()
    @type("boolean")
    tractor: boolean = false
    @type("uint8")
    coins: number = 0
    @type("uint8")
    plantedCounts: number = 0
    @type("boolean")
    connected: boolean = true

    // not serializable
    reconnection: Deferred<Client> = null
    sessionId: string = null

    checkBalance(cardsList: number[]) {
        const allCards = this.cards.concat(Array.from(this.offerCards))
        return cardsList.every(x => cardsList.filter(y => y === x).length <=
            allCards.filter(y => y === x).length)
    }

    coinsWithUtility() {
        return this.coins + (this.tractor ? 1 : 0) + (this.boards.length === 3 ? 2 : 0)
    }

}
