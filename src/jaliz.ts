import {Client, Room} from 'colyseus';
import {Dispatcher} from "@colyseus/command";

import {OnStartCommand} from './commands/OnStartCommand';
import {OnPlantCommand} from './commands/OnPlantCommand';
import {OnHarvestCommand} from './commands/OnHarvestCommand';
import {OnMakeOfferCommand} from './commands/OnMakeOfferCommand';
import {OnAcceptOfferCommand} from './commands/OnAcceptOfferCommand';
import {OnBuyUtilityCommand} from './commands/OnBuyUtilityCommand';
import {OnPlant2Command} from './commands/OnPlant2Command';
import {shuffle} from './utils/ArrayUtils';
import {OnStartTradingCommand} from './commands/OnStartTradingCommand';
import {State} from "./schema/state";
import {Player} from "./schema/player";
import {OnDeleteOfferCommand} from "./commands/OnDeleteOfferCommand";

export const CARD_TYPES = {
    6: {
        'name': 'pepper',
        'img': '',
        'rewards': [2, 0, 4, 0]
    },
    7: {
        'name': 'pea',
        'img': '',
        'rewards': [2, 3, 5, 0]
    },
    8: {
        'name': 'eggplant',
        'img': '',
        'rewards': [2, 4, 5, 0]
    },
    9: {
        'name': 'tomato',
        'img': '',
        'rewards': [2, 4, 0, 6]
    },
    10: {
        'name': 'watermelon',
        'img': '',
        'rewards': [3, 4, 5, 7]
    },
    11: {
        'name': 'melon',
        'img': '',
        'rewards': [3, 5, 6, 7]
    },
    12: {
        'name': 'pumpkin',
        'img': '',
        'rewards': [3, 5, 6, 8]
    },
    13: {
        'name': 'turnip',
        'img': '',
        'rewards': [3, 5, 7, 8]
    },
    14: {
        'name': 'carrot',
        'img': '',
        'rewards': [4, 5, 7, 8]
    },
    15: {
        'name': 'bean',
        'img': '',
        'rewards': [4, 6, 7, 8]
    },
    16: {
        'name': 'onion',
        'img': '',
        'rewards': [4, 6, 7, 9]
    },
    17: {
        'name': 'potato',
        'img': '',
        'rewards': [4, 6, 8, 9]
    },
    18: {
        'name': 'cocumber',
        'img': '',
        'rewards': [4, 6, 8, 10]
    },
}


const commands = {
    'start': OnStartCommand,
    'plant': OnPlantCommand,
    'startTrading': OnStartTradingCommand,
    'makeOffer': OnMakeOfferCommand,
    'acceptOffer': OnAcceptOfferCommand,
    'deleteOffer': OnDeleteOfferCommand,
    'plant2': OnPlant2Command,
    'harvest': OnHarvestCommand,
    'buyUtility': OnBuyUtilityCommand,

}

export class JalizRoom extends Room<State> {

    dispatcher = new Dispatcher(this);
    maxClients = 7
    owner: string = null
    board_cards = []
    burned_cards = []
    available_colors = ["red", "yellow", "purple", "blue", "green", "orange", "gray"]

    onCreate(options: any) {
        this.setState(new State());
        console.log(this.roomId, 'created')
        for (const key in commands) {
            this.onMessage(key, (client, message) => {
                this.dispatcher.dispatch(new commands[key](), {
                    client,
                    ...message
                })
            });
        }
        this.onMessage('*', (client, message) => {
            client.send('error', {'message': 'wrong command'})
        });
    }

    onJoin(client: Client, options: any, auth: any) {
        console.log(client.sessionId, ' joined')
        if (!this.owner) {
            this.owner = client.sessionId
        }

        const player = new Player()
        player.name = options.name ? options.name : `player-${this.state.players.size + 1}`
        player.sessionId = client.sessionId
        player.color = this.available_colors[Math.floor(Math.random() * this.available_colors.length)];
        this.state.players.set(client.sessionId, player);

        if (this.state.players.size === 7) {
            this.dispatcher.dispatch(new OnStartCommand(), {
                client
            })
        }
    }


    async onLeave(client: Client, consented: boolean) {
        // flag client as inactive for other users
        this.state.players.get(client.sessionId).connected = false;

        try {
            if (consented || !this.locked) {
                throw new Error("consented leave");
            }

            // get reconnection token
            const reconnection = this.allowReconnection(client);
            this.state.players.get(client.sessionId).reconnection = reconnection

            // allow disconnected client to reconnect
            await reconnection;

            // client returned! let's re-activate it.
            this.state.players.get(client.sessionId).connected = true;

        } catch (e) {
            this.state.players.delete(client.sessionId)
            // client can't reconnect. now what we do!?
        }
    }

    onDispose() {
        this.dispatcher.stop();
    }

    getNextPlayerIndex() {
        const index = this.state.playersOrder.indexOf(this.state.currentTurn)
        if (index === this.state.playersOrder.length - 1) {
            return 0
        }
        return index + 1
    }

    getBoardCards() {
        if (this.board_cards.length < 3) {
            this.burned_cards = shuffle(this.burned_cards).concat(this.board_cards)
            this.state.remainingRound -= 1
            this.board_cards = []
        }
        return this.board_cards
    }


}
