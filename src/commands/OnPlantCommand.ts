import {Command} from "@colyseus/command";
import {Client} from "colyseus";
import {JalizRoom, STAGES} from "../jaliz";
import {OnStartTradingCommand} from "./OnStartTradingCommand";

export class OnPlantCommand extends Command<JalizRoom,
    { client: Client, index: number, cardId: number, cardCount: number }> {

    validate({client, index, cardId, cardCount}) {
        if (!(this.state.currentStep in [STAGES.PLANT, STAGES.COUNTING])) {
            client.send('error', {'message': "this is not plant stage"})
            return false
        }
        if (this.state.currentTurn !== client.sessionId && this.state.currentStep !== STAGES.COUNTING) {
            client.send('error', {'message': 'this is not your turn'})
            return false
        }
        const player = this.state.players.get(client.sessionId)
        if (!player.boards[index]) {
            client.send('error', {'message': 'index is invalid'})
            return false
        }
        if (player.boards[index].cardId !== 0 && player.boards[index].cardId !== cardId) {
            client.send('error', {'message': 'you can not plant this card'})
            return false
        }
        const cardCountInHand = player.cards.filter(x => x === cardId).length
        if (cardCount > cardCountInHand) {
            client.send('error', {'message': 'you do not have enough card'})
            return false
        }
        if (player.plantedCounts + cardCount > (player.tractor ? 3 : 2)) {
            client.send('error', {'message': 'you can not plant this amount'})
            return false
        }
        return true
    }

    execute({client, index, cardId, cardCount}) {
        const player = this.state.players.get(client.sessionId)
        player.boards[index].cardId = cardId
        player.boards[index].cardCount += cardCount
        player.plantedCounts += cardCount
        for (let i = 0; i < cardCount; i++) {
            const removeIndex = player.cards.indexOf(cardId)
            player.cards.splice(removeIndex, 1)
        }
        this.room.broadcast('news', {'message': `${player.name} plant ${cardCount} ${cardId} on JALIZ ${index}`})
        if (this.state.currentStep === STAGES.PLANT && player.plantedCounts >= (player.tractor ? 3 : 2)) {
            this.room.dispatcher.dispatch(new OnStartTradingCommand(), {client})
        }

    }


}
