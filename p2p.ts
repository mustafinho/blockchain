import crypto from 'crypto'
import Swarm from 'discovery-swarm' // create a a network swarm that can use discovery-channel to find and connect peers
import defaults from 'dat-swarm-defaults' //deploy server that are used to discover other peers
import getPort from 'get-port' //gets all the TCP ports avalible.

interface Peer {

}

const peers = {};
let connSeq: number = 0;
let channel: string = 'myBlockchain' // the channel in where all node are connected
const myPeerId = crypto.randomBytes(32); //set a randomly generated peer ID for your peer 

console.log(`myPeerId: ${myPeerId.toString('hex')}`)

const config = defaults({
    id: myPeerId,
})

const swarm = Swarm(config);

const sendMessage = (id, type, data) => {
    peers[id].conn.write(JSON.stringify(
        {
            to: id,
            from: myPeerId,
            type,
            data
        }
    ));
};

const writeMessageToPeerToId = (toId, type, data): void => {
    for (let id in peers) {
        if (id === toId) {
            console.log('-------- writeMessageToPeersToId start -------- ');
            console.log(`type ${type}, to ${toId}`);
            console.log('-------- writeMessageToPeersToId end -------- ');
            sendMessage(id, type, data);

        }
    }
}

const writeMessageToPeers = (type: string, data): void => {
    for (let id in peers) {
        console.log('-------- writeMessageToPeers start -------- ');
        console.log(`type: ${type}, to: ${id}`);
        console.log('-------- writeMessageToPeers end -------- ');
        sendMessage(id, type, data);
    }
}

//continuisly monitor swwam.on event messages
(async () => {

    const port = await getPort();

    swarm.listen(port);
    console.log(`listening on port ${port}`)

    swarm.join(channel);

    swarm.on('connection', (conn, info) => {
        const seq = connSeq;
        const peerId = info.id.toString('hex');
        console.log(`Connected #${seq} to peer ${peerId}`)

        if (info.initiator) {
            try {
                conn.setKeepAlive(true, 600);
            }
            catch (exc) {
                console.log('exception', exc)
            }
        }


        conn.on('data', data => {
            let message = JSON.parse(data);
            console.log('----------- Received Message start -------------')
            console.log(
                'from: ' + peerId.toString('hex'),
                'to: ' + peerId.toString(message.to),
                'my: ' + myPeerId.toString('hex'),
                'type: ' + JSON.stringify(message.type)

            );
            console.log('----------- Received Message end -----------')
        });


        conn.on('close', () => {
            console.log(`Connection ${seq} closed, peerId ${peerId}`);

            if (peers[peerId].seq == seq) {
                delete peers[peerId]
            }

        });

        if (!peers[peerId]) {
            peers[peerId] = {}
        }

        peers[peerId].conn = conn;
        peers[peerId].seq = seq;
        connSeq++
    })
})();

setTimeout(() => {
    writeMessageToPeers('hello', null);
}, 10000)