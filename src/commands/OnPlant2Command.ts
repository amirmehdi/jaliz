import {Command} from "@colyseus/command";
import {Client} from "colyseus";
import {JalizRoom} from "../jaliz";
import {Player} from "../schema/player";

export class OnPlant2Command extends Command<JalizRoom,
    { client: Client, index: number, cardId: number, cardCount: number }> {

    validate({client, index, cardId, cardCount}) {
        if (this.state.currentStep !== "trade") {
            client.send('error', {'message': 'this is not trade stage'})
            return false
        }
        const player = this.state.players.get(client.sessionId)
        if (cardCount > player.tradedCards.concat(Array.from(player.offerCards)).filter(x => x == cardId).length) {
            client.send('error', {'message': 'you do not have enough card'})
            return false
        }
        if (!player.boards[index]) {
            client.send('error', {'message': 'index is invalid'})
            return false
        }
        if (player.boards[index].cardId !== 0 && player.boards[index].cardId !== cardId) {
            client.send('error', {'message': 'you can not plant this card here'})
            return false
        }
        return true
    }

    execute({client, index, cardId, cardCount}) {
        const player = this.state.players.get(client.sessionId)
        player.boards[index].cardId = cardId
        player.boards[index].cardCount += cardCount
        const cards = []
        for (let i = 0; i < cardCount; i++) {
            cards.push(cardId)
        }
        this.removeFromPlayerOfferedAndTradedCards(player, cards)
        this.room.broadcast('news', {'message': `${player.name} plant ${cardCount} ${cardId} on JALIZ ${index}`})

        const allPlayers = Array.from(this.state.players.values());
        // finish the round!
        if (allPlayers.every(x => x.tradedCards.concat(Array.from(x.offerCards)).length === 0)) {
            const currentPlayer = this.state.players.get(this.state.currentTurn)
            const boardCards = this.room.getBoardCards()
            currentPlayer.cards.push(boardCards.pop())
            currentPlayer.cards.push(boardCards.pop())
            if (this.state.players.size >= 5) {
                currentPlayer.cards.push(boardCards.pop())
            }
            const nextIndex = this.room.getNextPlayerIndex()
            this.state.currentTurn = this.state.playersOrder[nextIndex]
            this.state.currentStep = 'plant'
            if (nextIndex === 0) {
                // pick an event
                // at the end of game, determine the winner
                if (this.state.remainingRound <= 0) {
                    const winner = allPlayers.sort((a, b) => b.coinsWithUtility() - a.coinsWithUtility())[0]
                    this.state.winner = winner.sessionId
                    this.room.broadcast("news", {"message": `${winner.name} won!`})
                    this.room.dispatcher.stop()
                    return
                }
            }
            this.room.broadcast("plant", {
                "message": `${this.state.players.get(this.state.currentTurn).name} should plant!`,
                "sessionId": this.state.currentTurn
            })
        }

    }

    removeFromPlayerOfferedAndTradedCards(player: Player, cards: number[]) {
        for (const card of cards) {
            let index = player.offerCards.indexOf(card)
            if (index >= 0) {
                player.offerCards.splice(index, 1)
                continue
            }
            index = player.tradedCards.indexOf(card)
            player.tradedCards.splice(index, 1)
        }

    }
}
