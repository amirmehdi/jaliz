import {Command} from "@colyseus/command";
import {JalizRoom} from "../jaliz";

export class OnFakeCommand extends Command<JalizRoom, { sessionId: string }> {

    validate({sessionId} = this.payload) {
        return true
    }

    execute({sessionId}) {

    }


}
