import assert from "assert";
import {ColyseusTestServer, boot} from "@colyseus/testing";

// import your "arena.config.ts" file here.
import appConfig from "../src/arena.config";
import {State} from "../src/schema/state";

describe("testing your Colyseus app", () => {
    let colyseus: ColyseusTestServer;

    before(async () => colyseus = await boot(appConfig));
    after(async () => colyseus.shutdown());

    beforeEach(async () => await colyseus.cleanup());

    it("connecting into a room", async () => {
        // `room` is the server-side Room instance reference.
        const room = await colyseus.createRoom<State>("jaliz", {});

        // `client1` is the client-side `Room` instance reference (same as JavaScript SDK)
        const client1 = await colyseus.connectTo(room, {"name": "mehdi"});
        const client2 = await colyseus.connectTo(room, {"name": "ali"});
        const client3 = await colyseus.connectTo(room, {"name": "mammad"});

        // make your assertions
        assert.strictEqual(client1.sessionId, room.clients[0].sessionId);

        // wait for state sync
        await room.waitForNextPatch();
        assert.equal(room.state.players.size, 3);

        client1.send('start')
        await room.waitForNextMessage(1000)
        assert.equal(room.state.currentStep, 'plant')

    });
});
