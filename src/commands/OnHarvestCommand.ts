import {Command} from "@colyseus/command";
import {Client} from "colyseus";
import {CARD_TYPES, JalizRoom} from "../jaliz";
import {Player} from "../schema/player";

export class OnHarvestCommand extends Command<JalizRoom,
    { client: Client, index: number }> {

    validate({client, index}): boolean {
        const player = this.state.players.get(client.sessionId)
        if (!player.boards[index]) {
            client.send('error', {'message': "index is invalid!"})
            return false
        }
        if (player.boards[index].cardCount === 0) {
            client.send('error', {'message': "this JALIZ is empty!"})
            return false
        }
        return true
    }

    execute({client, index}) {
        const player = this.state.players.get(client.sessionId)
        this.harvest(player, index);

    }

    public harvest(player: Player, index) {
        const rewardedCoin = this.rewardCalculation(player.boards[index])
        player.coins += rewardedCoin
        for (let i = 0; i < player.boards[index].cardCount - rewardedCoin; i++) {
            // TODO could be an option to use cards as coins or not
            this.room.burned_cards.push(player.boards[index].cardId)
        }
        player.boards[index].cardId = 0
        player.boards[index].cardCount = 0
        this.room.broadcast('news', {
            'message': `${player.name} harvest jaliz ${index + 1} and rewarded ${rewardedCoin} coins`,
            'event': 'harvest'
        })
    }

    rewardCalculation(board): number {
        const id = board.cardId
        let count = board.cardCount
        if (board.fertilizer && count > 1) {
            count += 1
        }
        const rewards = CARD_TYPES[id].rewards
        let reward = 0
        for (let index = 0; index < rewards.length; index++) {
            const value = rewards[index];
            if (value !== 0 && count >= value) {
                reward = index + 1
            }
        }
        return reward
    }


}
