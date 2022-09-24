import {Command} from "@colyseus/command";
import {Client} from "colyseus";
import {JalizRoom} from "../jaliz";
import {shuffle} from "../utils/ArrayUtils";
import {logger} from "../arena.config";
import {Garden} from "../schema/garden";

export class OnStartCommand extends Command<JalizRoom, {
    client: Client
}> {

    validate({client} = this.payload) {
        if (this.room.locked) {
            client.send('error', {"message": "room started already!"})
            return false
        }
        if (this.state.players.size < 3) {
            client.send('error', {"message": "user's must be greater than 2"})
            return false
        }
        //TODO return client.sessionId === this.room.owner || this.state.players.size === 7
        return true
    }

    execute({client}) {
        this.room.lock()
        logger.info(this.room.roomId, ' start command accepted and locked')
        this.room.board_cards = []
        for (let i = 7; i < 15; i++) {
            for (let j = 0; j < i; j++) {
                this.room.board_cards.push(i);
            }
        }
        shuffle(this.room.board_cards)
        this.state.players.forEach(player => {
            player.boards.push(new Garden())
            player.boards.push(new Garden())
            for (let i = 0; i < 5; i++) {
                player.cards.push(this.room.board_cards.pop())
            }
        });
        const playersSessionId = Array.from(this.state.players.keys())
        this.state.playersOrder = shuffle(playersSessionId)
        this.state.currentTurn = this.state.playersOrder[0]
        this.state.currentStep = 'plant'
        this.room.broadcast("news", {"message": "game started"})
        this.room.broadcast("plant", {
            "message": `${this.state.players.get(this.state.currentTurn).name} should plant!`,
            "sessionId": this.state.currentTurn
        })

    }


}
