import {Command} from "@colyseus/command";
import {Client} from "colyseus";
import {JalizRoom} from "../jaliz";
import {Offer} from "../schema/offer";

export class OnMakeOfferCommand extends Command<JalizRoom,
    { client: Client, to: string, receive: number[], give: number[] }> {

    validate({client, to, receive, give}) {
        if (this.state.currentStep !== "trade") {
            client.send('error', {'message': 'this is not trade stage'})
            return false
        }
        if (client.sessionId === to) {
            client.send('error', {'message': 'you can not offer to your self'})
            return false
        }
        if (this.state.currentTurn !== client.sessionId && to !== this.state.currentTurn) {
            client.send('error', {'message': `you should offer to ${this.state.players.get(this.state.currentTurn).name}`})
            return false
        }
        const previousOffers = Array.from(this.state.offers.values()).filter(x => x.from === client.sessionId).length
        if (this.state.currentTurn === client.sessionId && previousOffers > 3) {
            client.send('error', {'message': 'you can not offer more than 3'})
            return false
        }
        if (this.state.currentTurn !== client.sessionId && previousOffers > 0) {
            client.send('error', {'message': 'you can not offer more than one'})
            return false
        }
        if (!this.state.players.get(client.sessionId).checkBalance(give)
            || !this.state.players.get(to).checkBalance(receive)) {
            client.send('error', {'message': 'one side have no enough card'})
            return false
        }
        return true
    }

    execute({client, to, receive, give}) {
        const offer: Offer = new Offer()
        offer.from = client.sessionId
        offer.to = to
        offer.receive = receive
        offer.give = give
        let i = 1
        while (true) {
            if (this.state.offers.has(`${client.sessionId}-${i}`)) continue
            this.state.offers.set(`${client.sessionId}-${i}`, offer)
            break
        }
        this.room.broadcast('news',{'message':`'new offer! from: ${offer}`})

    }


}
