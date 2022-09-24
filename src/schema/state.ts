import {ArraySchema, MapSchema, Schema, type} from "@colyseus/schema";
import {Player} from "./player";
import {Offer} from "./offer";

export class State extends Schema {

    @type("string")
    currentTurn: string = ""
    @type("string")
    currentStep: string = ""
    @type(["string"])
    playersOrder: string[] = new ArraySchema<string>()
    @type({map: Player})
    players = new MapSchema<Player>();
    @type({map: Offer})
    offers = new MapSchema<Offer>()

    @type("string")
    winner: string;
    @type("uint8")
    remainingRound = 2

}
