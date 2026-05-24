/**
 * Socket.io Handler - VaultStream
 * Manages all real-time socket connections, rooms, and events.
 */

// Emit helpers so controllers can fire events without importing io directly
const userRooms = new Map(); // Track userId -> socketId for cleanup

export const initializeSockets = (io) => {

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // ─────────────────────────────────────────────
    // JOIN USER ROOM
    // Frontend emits: socket.emit('join-user-room', userId)
    // ─────────────────────────────────────────────
    socket.on('join-user-room', (userId) => {
      if (!userId) return;

      const roomName = `user_${userId}`;
      socket.join(roomName);
      userRooms.set(socket.id, roomName);
      console.log(`User joined room: ${roomName}`);

      // Confirm to the client they are in the room
      socket.emit('room-joined', { room: roomName });
    });

    // ─────────────────────────────────────────────
    // DISCONNECT
    // ─────────────────────────────────────────────
    socket.on('disconnect', (reason) => {
      const room = userRooms.get(socket.id);
      if (room) {
        userRooms.delete(socket.id);
        console.log(`Socket ${socket.id} left room ${room} (reason: ${reason})`);
      } else {
        console.log(`Socket disconnected: ${socket.id} (reason: ${reason})`);
      }
    });
  });
};

/**
 * Emit upload-started event to a specific user
 * @param {object} io - Socket.io server instance
 * @param {string} userId - MongoDB User ID
 * @param {object} data - { videoId, title, filename, size }
 */
export const emitUploadStarted = (io, userId, data) => {
  io.to(`user_${userId}`).emit('upload-started', {
    event: 'upload-started',
    ...data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Emit upload-progress event to a specific user
 * @param {object} io - Socket.io server instance
 * @param {string} userId
 * @param {object} data - { videoId, percent }
 */
export const emitUploadProgress = (io, userId, data) => {
  io.to(`user_${userId}`).emit('upload-progress', {
    event: 'upload-progress',
    ...data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Emit processing-started event to a specific user
 * @param {object} io - Socket.io server instance
 * @param {string} userId
 * @param {object} data - { videoId }
 */
export const emitProcessingStarted = (io, userId, data) => {
  io.to(`user_${userId}`).emit('processing-started', {
    event: 'processing-started',
    ...data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Emit processing-progress event to a specific user
 * @param {object} io - Socket.io server instance
 * @param {string} userId
 * @param {object} data - { videoId, percent }
 */
export const emitProcessingProgress = (io, userId, data) => {
  io.to(`user_${userId}`).emit('processing-progress', {
    event: 'processing-progress',
    ...data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Emit processing-completed event to a specific user
 * @param {object} io - Socket.io server instance
 * @param {string} userId
 * @param {object} data - { videoId, outputPath }
 */
export const emitProcessingCompleted = (io, userId, data) => {
  io.to(`user_${userId}`).emit('processing-completed', {
    event: 'processing-completed',
    ...data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Emit video-ready event to a specific user
 * @param {object} io - Socket.io server instance
 * @param {string} userId
 * @param {object} data - { videoId, streamUrl }
 */
export const emitVideoReady = (io, userId, data) => {
  io.to(`user_${userId}`).emit('video-ready', {
    event: 'video-ready',
    ...data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Emit a general notification to a specific user
 * @param {object} io - Socket.io server instance
 * @param {string} userId - MongoDB User ID
 * @param {object} notification - Notification object from DB
 */
export const emitNotification = (io, userId, notification) => {
  io.to(`user_${userId}`).emit('new-notification', {
    ...notification.toObject(),
    timestamp: new Date().toISOString(),
  });
};
