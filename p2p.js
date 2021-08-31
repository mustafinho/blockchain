"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var crypto_1 = __importDefault(require("crypto"));
var discovery_swarm_1 = __importDefault(require("discovery-swarm")); // create a a network swarm that can use discovery-channel to find and connect peers
var dat_swarm_defaults_1 = __importDefault(require("dat-swarm-defaults")); //deploy server that are used to discover other peers
var get_port_1 = __importDefault(require("get-port")); //gets all the TCP ports avalible.
var chain_1 = require("./chain");
/**
 * @notice basic p2p network that creates and keep a TCP connection to send and recive
 here we request for latest block and receving it
 */
var registeredMiners = [];
var lastBlockMinedBy = [];
var messageType = {
    REQUEST_LATEST_BLOCK: 'requestLatestBlock',
    LATEST_BLOCK: 'latestBlock',
    RECEIVE_NEXT_BLOCK: 'reciveNextBlock',
    REQUEST_BLOCK: 'requestBlock',
    RECEIVE_NEW_BLOCK: 'receiveNewBlock',
    REQUEST_ALL_REGISTER_MINERS: 'requestAllRegisterMiners',
    REGISTER_MINER: 'registerMiner'
};
var peers = {};
var connSeq = 0;
var channel = 'myBlockchain'; // channelName in where all node are connected
var myPeerId = crypto_1["default"].randomBytes(32); //set a randomly generated peer ID for each of my peers 
console.log("myPeerId: " + myPeerId.toString('hex'));
//config object for initialize swarm library
var config = dat_swarm_defaults_1["default"]({
    id: myPeerId
});
var swarm = discovery_swarm_1["default"](config);
/**
 *
 * @param id the peer id that you are sending the message
 * @param type the message type
 * @param data data that would like to send accross the network (to send the blocks)
 */
var sendMessage = function (id, type, data) {
    peers[id].conn.write(JSON.stringify({
        to: id,
        from: myPeerId,
        type: type,
        data: data
    }));
};
//send a message to an specific peer id
var writeMessageToPeerToId = function (toId, type, data) {
    for (var id in peers) {
        if (id === toId) {
            console.log('-------- writeMessageToPeersToId start -------- ');
            console.log("type " + type + ", to " + toId);
            console.log('-------- writeMessageToPeersToId end -------- ');
            sendMessage(id, type, data);
        }
    }
};
var writeMessageToPeers = function (type, data) {
    for (var id in peers) {
        console.log('-------- writeMessageToPeers start -------- ');
        console.log("type: " + type + ", to: " + id);
        console.log('-------- writeMessageToPeers end -------- ');
        sendMessage(id, type, data);
    }
};
//continuisly monitor swarm.on event messages
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var port;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, get_port_1["default"]()];
            case 1:
                port = _a.sent();
                /**
                 * You listen on the random port selected, and once a connection
                 * is made to the peer, you use {setKeepAlive} to ensure the network
                 * connection stays with other peers
                 */
                swarm.listen(port);
                console.log("listening on port " + port);
                swarm.join(channel);
                swarm.on('connection', function (conn, info) {
                    var seq = connSeq;
                    var peerId = info.id.toString('hex');
                    console.log("Connected #" + seq + " to peer " + peerId);
                    if (info.initiator) {
                        try {
                            conn.setKeepAlive(true, 600);
                        }
                        catch (exc) {
                            console.log('exception', exc);
                        }
                    }
                    /**
                     * Once you receive a data message on the P2P network,
                     * you parse the data using JSON.parse
                     */
                    conn.on('data', function (data) {
                        var message = JSON.parse(data);
                        console.log('----------- Received Message start -------------');
                        console.log('from: ' + peerId.toString('hex'), 'to: ' + peerId.toString(message.to), 'my: ' + myPeerId.toString('hex'), 'type: ' + JSON.stringify(message.type));
                        switch (message.type) {
                            case messageType.REQUEST_ALL_REGISTER_MINERS:
                                console.log('-----------REQUEST_ALL_REGISTER_MINERS------------- ' + message.to);
                                writeMessageToPeers(messageType.REGISTER_MINER, registeredMiners);
                                registeredMiners = JSON.parse(JSON.stringify(message.data));
                                console.log('-----------REQUEST_ALL_REGISTER_MINERS------------- ' + message.to);
                                break;
                            case messageType.REGISTER_MINER:
                                console.log('-----------REGISTER_MINER------------- ' + message.to);
                                var miners = JSON.stringify(message.data);
                                registeredMiners = JSON.parse(miners);
                                console.log(registeredMiners);
                                console.log('-----------REGISTER_MINER------------- ' + message.to);
                                break;
                            case messageType.REQUEST_LATEST_BLOCK:
                                console.log('-----------REQUEST_BLOCK-------------');
                                var requestedIndex = (JSON.parse(JSON.stringify(message.data))).index;
                                var requestedBlock = chain_1.getBlock(requestedIndex);
                                if (requestedBlock)
                                    writeMessageToPeerToId(peerId.toString('hex'), messageType.RECEIVE_NEXT_BLOCK, requestedBlock);
                                else
                                    console.log('No block found @ index: ' + requestedIndex);
                                console.log('-----------REQUEST_BLOCK-------------');
                                break;
                            case messageType.RECEIVE_NEXT_BLOCK:
                                console.log('-----------RECEIVE_NEXT_BLOCK-------------');
                                chain_1.addBlock(JSON.stringify(chain_1.blockchain));
                                console.log(JSON.stringify(chain_1.blockchain));
                                var nextBlockIndex = chain_1.getLatestBlock().index + 1;
                                console.log('-- request next block @ index: ' + nextBlockIndex);
                                writeMessageToPeers(messageType.REQUEST_BLOCK, { index: nextBlockIndex });
                                console.log('-----------RECEIVE_NEXT_BLOCK-------------');
                                break;
                        }
                        console.log('----------- Received Message end -----------');
                    });
                    /**
                     * listen  a close event, indicate that you lost a connection with peers,
                     * so you can take action, such as delete the peers from your peers
                     * list object.
                     */
                    conn.on('close', function () {
                        console.log("Connection " + seq + " closed, peerId " + peerId);
                        if (peers[peerId].seq == seq) {
                            delete peers[peerId];
                        }
                    });
                    if (!peers[peerId]) {
                        peers[peerId] = {};
                    }
                    peers[peerId].conn = conn;
                    peers[peerId].seq = seq;
                    connSeq++;
                });
                return [2 /*return*/];
        }
    });
}); })();
/**
 * send a message after ten seconds to any available peers.
 */
setTimeout(function () {
    writeMessageToPeers('hello', null);
}, 10000);
/**
 * send a request to retrive the latest block every 5 seconds
 */
setTimeout(function () {
    writeMessageToPeers(messageType.REQUEST_BLOCK, { index: chain_1.getLatestBlock().index + 1 });
}, 5000);
/**
 * updates maninrs every Second
 */
setTimeout(function () {
    writeMessageToPeers(messageType.REQUEST_ALL_REGISTER_MINERS, null);
}, 5000);
/**
 * REGIST yours peers as a miner
 */
setTimeout(function () {
    registeredMiners.push(myPeerId.toString('hex'));
    console.log('----------Register my miner --------------');
    console.log(registeredMiners);
    writeMessageToPeers(messageType.REGISTER_MINER, registeredMiners);
    console.log('---------- Register my miner --------------');
}, 7000);
