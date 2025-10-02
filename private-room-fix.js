// Fix for private room peer discovery
// This patch ensures that when users join a private room, they are also added to
// a special IP room structure so they can discover each other for WebRTC connections

const originalJoinPrivateRoom = DropShareServer.prototype._joinPrivateRoom;
const originalLeavePrivateRoom = DropShareServer.prototype._leavePrivateRoom;
const originalCreatePrivateRoom = DropShareServer.prototype._createPrivateRoom;

// Override _createPrivateRoom to also add host to special room structure
DropShareServer.prototype._createPrivateRoom = function(host, roomSettings) {
    // Call original method
    originalCreatePrivateRoom.call(this, host, roomSettings);
    
    // Add host to special room structure for peer discovery
    const roomCode = roomSettings.code;
    const specialRoomKey = `private_room_${roomCode}`;
    
    // Create room structure if it doesn't exist
    if (!this._rooms[specialRoomKey]) {
        this._rooms[specialRoomKey] = {};
        console.log(`✅ Created peer discovery structure for private room ${roomCode}`);
    }
    
    // Add host to room structure
    if (host.currentRoom === roomCode) {
        this._rooms[specialRoomKey][host.id] = host;
        console.log(`✅ Added host ${host.id} to peer discovery for room ${roomCode}`);
        
        // Notify host about other peers in the room (should be none for new room)
        this._send(host, {
            type: 'peers',
            peers: []
        });
    }
};

// Override _joinPrivateRoom to also add members to special room structure
DropShareServer.prototype._joinPrivateRoom = function(peer, roomCode, password) {
    // Call original method
    originalJoinPrivateRoom.call(this, peer, roomCode, password);
    
    // If join was successful, add to special room structure for peer discovery
    if (peer.currentRoom === roomCode) {
        const specialRoomKey = `private_room_${roomCode}`;
        
        // Create room structure if it doesn't exist
        if (!this._rooms[specialRoomKey]) {
            this._rooms[specialRoomKey] = {};
            console.log(`✅ Created peer discovery structure for private room ${roomCode}`);
        }
        
        // Notify existing peers about new member
        for (const otherPeerId in this._rooms[specialRoomKey]) {
            const otherPeer = this._rooms[specialRoomKey][otherPeerId];
            if (otherPeer && otherPeer.id !== peer.id) {
                this._send(otherPeer, {
                    type: 'peer-joined',
                    peer: peer.getInfo()
                });
                console.log(`📢 Notified ${otherPeer.id} about new peer ${peer.id} in room ${roomCode}`);
            }
        }
        
        // Get list of other peers
        const otherPeers = [];
        for (const otherPeerId in this._rooms[specialRoomKey]) {
            if (otherPeerId !== peer.id) {
                otherPeers.push(this._rooms[specialRoomKey][otherPeerId].getInfo());
            }
        }
        
        // Add peer to room structure
        this._rooms[specialRoomKey][peer.id] = peer;
        console.log(`✅ Added peer ${peer.id} to peer discovery for room ${roomCode}`);
        console.log(`📊 Room ${roomCode} now has ${Object.keys(this._rooms[specialRoomKey]).length} peers for discovery`);
        
        // Send peers list to new member
        this._send(peer, {
            type: 'peers',
            peers: otherPeers
        });
        console.log(`📋 Sent ${otherPeers.length} existing peers to ${peer.id}`);
    }
};

// Override _leavePrivateRoom to also remove from special room structure
DropShareServer.prototype._leavePrivateRoom = function(peer, roomCode) {
    const wasInRoom = peer.currentRoom === roomCode;
    
    // Call original method
    originalLeavePrivateRoom.call(this, peer, roomCode);
    
    // Remove from special room structure for peer discovery
    if (wasInRoom) {
        const specialRoomKey = `private_room_${roomCode}`;
        if (this._rooms[specialRoomKey] && this._rooms[specialRoomKey][peer.id]) {
            delete this._rooms[specialRoomKey][peer.id];
            console.log(`✅ Removed peer ${peer.id} from peer discovery for room ${roomCode}`);
            
            // Notify remaining peers
            for (const otherPeerId in this._rooms[specialRoomKey]) {
                const otherPeer = this._rooms[specialRoomKey][otherPeerId];
                if (otherPeer) {
                    this._send(otherPeer, {
                        type: 'peer-left',
                        peerId: peer.id
                    });
                }
            }
            
            // Clean up if room is empty
            if (Object.keys(this._rooms[specialRoomKey]).length === 0) {
                delete this._rooms[specialRoomKey];
                console.log(`🗑️ Cleaned up peer discovery structure for empty room ${roomCode}`);
            }
        }
    }
};

// Also override _cleanupPrivateRoomMembership to handle disconnections
const originalCleanupPrivateRoomMembership = DropShareServer.prototype._cleanupPrivateRoomMembership;
DropShareServer.prototype._cleanupPrivateRoomMembership = function(peer) {
    const roomCode = peer.currentRoom;
    
    // Call original method
    originalCleanupPrivateRoomMembership.call(this, peer);
    
    // Also clean up from peer discovery structure
    if (roomCode) {
        const specialRoomKey = `private_room_${roomCode}`;
        if (this._rooms[specialRoomKey] && this._rooms[specialRoomKey][peer.id]) {
            delete this._rooms[specialRoomKey][peer.id];
            console.log(`✅ Removed disconnected peer ${peer.id} from peer discovery for room ${roomCode}`);
            
            // Notify remaining peers
            for (const otherPeerId in this._rooms[specialRoomKey]) {
                const otherPeer = this._rooms[specialRoomKey][otherPeerId];
                if (otherPeer) {
                    this._send(otherPeer, {
                        type: 'peer-left',
                        peerId: peer.id
                    });
                }
            }
            
            // Clean up if room is empty
            if (Object.keys(this._rooms[specialRoomKey]).length === 0) {
                delete this._rooms[specialRoomKey];
                console.log(`🗑️ Cleaned up peer discovery structure for empty room ${roomCode}`);
            }
        }
    }
};

// Fix the _processMessage to handle signals for private rooms correctly
const original_processMessage = DropShareServer.prototype._processMessage;
DropShareServer.prototype._processMessage = function(sender, message) {
    // Special handling for signal messages in private rooms
    if (message.type === 'signal' && message.to && sender.currentRoom) {
        const specialRoomKey = `private_room_${sender.currentRoom}`;
        if (this._rooms[specialRoomKey]) {
            const recipient = this._rooms[specialRoomKey][message.to];
            if (recipient) {
                delete message.to;
                message.sender = sender.id;
                this._send(recipient, message);
                console.log(`📡 Forwarded signal from ${sender.id} to ${message.to} in private room ${sender.currentRoom}`);
                return; // Don't process further
            }
        }
    }
    
    // Call original method for other cases
    original_processMessage.call(this, sender, message);
};

console.log('✅ Private room peer discovery fix applied successfully!');
module.exports = {};