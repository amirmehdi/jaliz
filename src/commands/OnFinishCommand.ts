import {Command} from "@colyseus/command";
import {JalizRoom} from "../jaliz";
import {OnHarvestCommand} from "./OnHarvestCommand";

export class OnFinishCommand extends Command<JalizRoom, {}> {

    execute(payload) {
        this.room.dispatcher.stop()
        const allPlayers = Array.from(this.state.players.values());
        const harvestCommand = new OnHarvestCommand()
        for (let player of allPlayers) {
            for (let boardsKey in player.boards) {
                harvestCommand.harvest(player, boardsKey)
            }
        }
        const winner = allPlayers.sort((a, b) => b.coinsWithUtility() - a.coinsWithUtility())[0]
        this.state.winner = winner.sessionId
        this.room.broadcast("news", {"message": `${winner.name} won!`})
    }


}
