import {Command} from "@colyseus/command";
import {Client} from "colyseus";
import {JalizRoom} from "../jaliz";
import {Garden} from "../schema/garden";
import {Player} from "../schema/player";

export class OnBuyUtilityCommand extends Command<JalizRoom,
    { client: Client, utility: string, index: any }> {


    execute({client, utility, index = undefined}) {
        const player = this.state.players.get(client.sessionId);
        switch (utility) {
            case 'fertilizer':
                this.buyFertilizer(client, player, index)
                break;
            case 'tractor':
                this.buyTractor(client, player)
                break;
            case 'jaliz':
                this.buyJaliz(client, player)
                break;
            default:
                client.send('error', {'message': "command is invalid!"})
                return
        }
    }


    private buyFertilizer(client, player: Player, index: number) {
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
        if (player.boards.filter(x => x.fertilizer).length > 0) {
            for (const p of this.state.players.values()) {
                if (p.boards.filter(x => x.fertilizer).length > 1) {
                    client.send('error', {'message': "someone has 2 fertilizer already!"})
                    return
                }
            }
        }
        player.coins -= 2
        player.boards[index].fertilizer = true
        this.room.broadcast("news", {
            "message": `${player.name} bought fertilizer and put on JALIZ ${index}`,
            "event": "buyUtility"
        })
    }

    private buyTractor(client, player: Player) {
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
        this.room.broadcast("news", {
            "message": `${player.name} bought tractor`,
            "event": "buyUtility"
        })
    }

    private buyJaliz(client, player: Player) {
        if (player.boards.length > 2) {
            client.send('error', {'message': "you can't buy more than 3 jaliz"})
            return
        }
        if (player.coins < 3) {
            client.send('error', {'message': "you don't have enough coin"})
            return
        }
        player.coins -= 3
        player.boards.push(new Garden())
        this.room.broadcast("news", {
            "message": `${player.name} bought JALIZ`,
            "event": "buyUtility"
        })
    }
}
