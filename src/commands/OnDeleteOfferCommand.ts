import {Command} from "@colyseus/command";
import {Client} from "colyseus";
import {JalizRoom} from "../jaliz";

export class OnDeleteOfferCommand extends Command<JalizRoom, { client: Client, offerId: string }> {

    validate({client, offerId}) {
        if (this.state.currentStep !== "trade") {
            client.send('error', {'message': 'this is not trade stage'})
            return false
        }
        const offer = this.state.offers.get(offerId)
        if (!offer) {
            client.send('error', {'message': 'offer not found'})
            return false
        }
        if (offer.from !== client.sessionId && offer.to !== client.sessionId) {
            client.send('error', {'message': 'you can not delete the offer'})
            return false
        }
        return true
    }

    execute({client, offerId}) {
        const offer = this.state.offers.get(offerId)
        this.state.offers.delete(offerId)
        this.room.broadcast('news', {'message': `offer deleted: ${offer}`})
    }


}
