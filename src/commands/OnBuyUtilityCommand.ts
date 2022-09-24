import {Command} from "@colyseus/command";
import {Client} from "colyseus";
import {JalizRoom} from "../jaliz";

export class OnBuyUtilityCommand extends Command<JalizRoom,
    { client: Client, utility: string, index: any }> {


    execute({client, utility, index = undefined}) {
        const sessionId = client.sessionId
        const player = this.state.players.get(sessionId);
        if (utility === 'fertilizer') {
            if (player.coins < 2) {
                client.send('error', {'message': "you don't have enough coin"})
                return
            }
            if (!player.boards[index]) {
                client.send('error', {'message': "index is invalid!"})
                return
            }
            if (player.boards[index].fertilizer) {
                client.send('error', {'message': "the board has a fertilizer already!"})
                return
            }
            for (const p of this.state.players.values()) {
                if (p.boards.filter(x => x.fertilizer).length > 1) {
                    client.send('error', {'message': "someone has 2 fertilizer already!"})
                    return
                }
            }
            player.coins -= 2
            player.boards[index].fertilizer = true

        } else if (utility === 'tractor') {
            if (player.tractor) {
                client.send('error', {'message': "you have tractor already"})
                return
            }
            if (player.coins < 2) {
                client.send('error', {'message': "you don't have enough coin"})
                return
            }
            player.coins -= 2
            player.tractor = true

        } else if (utility === 'jaliz') {
            if (player.boards.length > 2) {
                client.send('error', {'message': "you can't buy more than 3 jaliz"})
                return
            }
            if (player.coins < 3) {
                client.send('error', {'message': "you don't have enough coin"})
                return
            }
            player.coins -= 2
            player.tractor = true
        } else {
            client.send('error', {'message': "command is invalid!"})
            return
        }
        this.room.broadcast("news", {
            "message": `${player.name} bought ${utility}`,
            "event": "buyUtility"
        })
    }


}
