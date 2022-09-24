import {Command} from "@colyseus/command";
import {Client} from "colyseus";
import {JalizRoom} from "../jaliz";

export class OnStartTradingCommand extends Command<JalizRoom, { client: Client }> {

    validate({client}) {
        if (this.state.currentTurn !== client.sessionId) {
            client.send('error', {'message': "this is not your turn"})
            return false
        }
        if (this.state.players.get(client.sessionId).plantedCounts === 0 && this.state.players.get(client.sessionId).cards.length > 0) {
            client.send('error', {'message': 'you must plant something!'})
            return false
        }
        return true
    }

    execute({client}) {
        const player = this.state.players.get(client.sessionId)
        player.plantedCounts = 0
        this.state.currentStep = "trade"
        player.offerCards.push(this.room.getBoardCards().pop())
        player.offerCards.push(this.room.getBoardCards().pop())
        this.room.broadcast("trade", {"message": `offering started, offercards: ${Array.from(player.offerCards)}`})
    }


}
