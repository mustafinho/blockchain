import crypto from 'crypto'
import Swarm from 'discovery-swarm' // create a a network swarm that can use discovery-channel to find and connect peers
import defaults from 'dat-swarm-defaults' //deploy server that are used to discover other peers
import getPort from 'get-port' //gets all the TCP ports avalible.

import {addBlock, getBlock, blockchain, getLatestBlock} from './chain'

/**
 * @notice basic p2p network that creates and keep a TCP connection to send and recive
 here we request for latest block and receving it 
 */

let registeredMiners = [];
const lastBlockMinedBy = [];
const messageType = {
    REQUEST_LATEST_BLOCK: 'requestLatestBlock',
    LATEST_BLOCK: 'latestBlock',
    RECEIVE_NEXT_BLOCK: 'reciveNextBlock',
    REQUEST_BLOCK: 'requestBlock',
    RECEIVE_NEW_BLOCK: 'receiveNewBlock',
    REQUEST_ALL_REGISTER_MINERS: 'requestAllRegisterMiners',
    REGISTER_MINER: 'registerMiner'
}


interface Peer {

}

const peers = {};
let connSeq: number = 0;
let channel: string = 'myBlockchain' // channelName in where all node are connected
const myPeerId = crypto.randomBytes(32); //set a randomly generated peer ID for each of my peers 

console.log(`myPeerId: ${myPeerId.toString('hex')}`)


//config object for initialize swarm library
const config = defaults({
    id: myPeerId,
})

const swarm = Swarm(config);

/**
 * 
 * @param id the peer id that you are sending the message
 * @param type the message type
 * @param data data that would like to send accross the network (to send the blocks)
 */
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
//send a message to an specific peer id
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

//continuisly monitor swarm.on event messages
(async () => {

    const port = await getPort();
    /**
     * You listen on the random port selected, and once a connection 
     * is made to the peer, you use {setKeepAlive} to ensure the network 
     * connection stays with other peers
     */
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

        /**
         * Once you receive a data message on the P2P network, 
         * you parse the data using JSON.parse
         */
        conn.on('data', data => {
            let message = JSON.parse(data);
            console.log('----------- Received Message start -------------')
            console.log(
                'from: ' + peerId.toString('hex'),
                'to: ' + peerId.toString(message.to),
                'my: ' + myPeerId.toString('hex'),
                'type: ' + JSON.stringify(message.type)
            );

            switch (message.type) {

                case messageType.REQUEST_ALL_REGISTER_MINERS:
                    console.log('-----------REQUEST_ALL_REGISTER_MINERS------------- ' + message.to);
                    writeMessageToPeers(messageType.REGISTER_MINER, registeredMiners);
                    registeredMiners = JSON.parse(JSON.stringify(message.data));
                    console.log('-----------REQUEST_ALL_REGISTER_MINERS------------- ' + message.to);
                    break;

                case messageType.REGISTER_MINER:
                    console.log('-----------REGISTER_MINER------------- ' + message.to);
                    const miners = JSON.stringify(message.data);
                    registeredMiners = JSON.parse(miners);
                    console.log(registeredMiners);
                    console.log('-----------REGISTER_MINER------------- ' + message.to);
                    break;

                case messageType.REQUEST_LATEST_BLOCK:
                    console.log('-----------REQUEST_BLOCK-------------')
                    const requestedIndex = (JSON.parse(JSON.stringify(message.data))).index
                    const requestedBlock = getBlock(requestedIndex);
                    if (requestedBlock) writeMessageToPeerToId(
                        peerId.toString('hex'),
                        messageType.RECEIVE_NEXT_BLOCK,
                        requestedBlock)

                    else console.log('No block found @ index: ' + requestedIndex);
                    console.log('-----------REQUEST_BLOCK-------------');
                    break;

                case messageType.RECEIVE_NEXT_BLOCK:
                    console.log('-----------RECEIVE_NEXT_BLOCK-------------');
                    addBlock(JSON.stringify(blockchain));
                    console.log(JSON.stringify(blockchain))
                    const nextBlockIndex = getLatestBlock().index + 1;
                    console.log('-- request next block @ index: ' + nextBlockIndex);
                    writeMessageToPeers(messageType.REQUEST_BLOCK, { index: nextBlockIndex })
                    console.log('-----------RECEIVE_NEXT_BLOCK-------------')
                    break;
            }
            console.log('----------- Received Message end -----------')
        });

        /**
         * listen  a close event, indicate that you lost a connection with peers, 
         * so you can take action, such as delete the peers from your peers 
         * list object.
         */
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


/**
 * send a message after ten seconds to any available peers.
 */
setTimeout(() => {
    writeMessageToPeers('hello', null);
}, 10000)


/**
 * send a request to retrive the latest block every 5 seconds
 */

setTimeout(() => {
    writeMessageToPeers(messageType.REQUEST_BLOCK, { index: getLatestBlock().index + 1 })
}, 5000)

/**
 * updates maninrs every Second
 */
setTimeout(() => {
    writeMessageToPeers(messageType.REQUEST_ALL_REGISTER_MINERS, null)
}, 5000)

/**
 * REGIST yours peers as a miner
 */
 setTimeout(() => {
    registeredMiners.push(myPeerId.toString('hex'));
    console.log('----------Register my miner --------------');
    console.log(registeredMiners);
    writeMessageToPeers(messageType.REGISTER_MINER, registeredMiners)
    console.log('---------- Register my miner --------------');
}, 7000)