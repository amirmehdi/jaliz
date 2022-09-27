import {Command} from "@colyseus/command";
import {Client} from "colyseus";
import {JalizRoom, STAGES} from "../jaliz";
import {Player} from "../schema/player";

export class OnAcceptOfferCommand extends Command<JalizRoom, { client: Client, offerId: string }> {

    validate({client, offerId} = this.payload) {
        if (this.state.currentStep !== STAGES.TRADE) {
            client.send('error', {'message': 'this is not trade stage'})
            return false
        }
        const offer = this.state.offers.get(offerId)
        if (!offer) {
            client.send('error', {'message': 'offer not found'})
            return false
        }
        if (offer.to !== client.sessionId) {
            client.send('error', {'message': 'you can not accept the offer'})
            return false
        }
        if (!this.state.players.get(offer.to).checkBalance(offer.receive)
            || !this.state.players.get(offer.from).checkBalance(offer.give)) {
            client.send('error', {'message': 'one side have no enough card'})
            return false
        }
        return true
    }

    execute({client, offerId}) {
        const offer = this.state.offers.get(offerId)

        const fromPlayer = this.state.players.get(offer.from);
        fromPlayer.tradedCards = fromPlayer.tradedCards.concat(Array.from(offer.receive))
        const toPlayer = this.state.players.get(offer.to);
        toPlayer.tradedCards = toPlayer.tradedCards.concat(Array.from(offer.give))

        this.removeFromPlayerCards(fromPlayer, offer.give)
        this.removeFromPlayerCards(toPlayer, offer.receive)
        this.state.offers.delete(offerId)
        this.room.broadcast('news', {'message': `offer accepted: ${offer}`})
        if (this.state.players.get(this.state.currentTurn).offerCards.length === 0) {
            this.room.broadcast("news", {"message": "all of cards on the table, traded!"})
        }
    }

    removeFromPlayerCards(player: Player, cards: number[]) {
        for (const card of cards) {
            let index = player.offerCards.indexOf(card)
            if (index >= 0) {
                player.offerCards.splice(index, 1)
                continue
            }
            index = player.cards.indexOf(card)
            player.cards.splice(index, 1)
        }

    }


}
