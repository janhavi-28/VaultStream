import Video from '../models/Video.js';
import {
  emitProcessingStarted,
  emitProcessingProgress,
  emitProcessingCompleted,
} from '../sockets/socketHandler.js';

/**
 * Simulates a video processing queue and AI sensitivity analysis
 * @param {Object} io - Socket.io instance
 * @param {String} userId - ID of the user who uploaded the video
 * @param {String} videoId - MongoDB ID of the video
 */
export const processVideoAsync = async (io, userId, videoId) => {
  try {
    // Fetch video record to get details like title
    const videoRecord = await Video.findById(videoId);
    if (!videoRecord) {
      console.error(`Video ${videoId} not found for processing`);
      return;
    }

    // 1. Notify user that processing has started
    emitProcessingStarted(io, userId, { 
      videoId,
      id: videoId,
      title: videoRecord.title
    });

    // Update DB status to processing
    await Video.findByIdAndUpdate(videoId, { status: 'processing' });

    // 2. Simulate processing progress
    const isServerless = !!process.env.VERCEL || !!process.env.VERCEL_URL;
    const steps = 5;
    const delayMs = isServerless ? 50 : 2000;
    
    for (let i = 1; i <= steps; i++) {
      // Wait to simulate processing
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      
      const percent = (i / steps) * 100;
      
      // Emit progress event
      emitProcessingProgress(io, userId, {
        videoId,
        id: videoId,
        title: videoRecord.title,
        percent,
        message: `Analyzing content... ${percent}%`,
      });
    }

    // 3. Rule-Based Sensitivity Classification
    let isFlagged = false;
    let flagReason = '';

    const bannedWords = ['hack', 'exploit', 'nsfw', 'illegal', 'violence', 'scam'];
    const textToCheck = `${videoRecord.title} ${videoRecord.description} ${videoRecord.originalName}`.toLowerCase();

    // Check 1: File size > 500MB (500 * 1024 * 1024 = 524288000 bytes)
    if (videoRecord.size > 524288000) {
      isFlagged = true;
      flagReason = 'File size exceeds 500MB limit';
    } 
    // Check 2: File format not mp4/mov
    else if (!videoRecord.originalName.toLowerCase().match(/\.(mp4|mov)$/)) {
      isFlagged = true;
      flagReason = 'File format not allowed (only mp4/mov supported)';
    }
    // Check 3: Banned words in title/description/filename
    else if (bannedWords.some(word => textToCheck.includes(word))) {
      isFlagged = true;
      flagReason = 'Contains restricted keywords';
    }

    const finalSensitivity = isFlagged ? 'flagged' : 'safe';

    // 4. Update Database with final results
    const updatedVideo = await Video.findByIdAndUpdate(
      videoId,
      {
        status: 'completed',
        sensitivity: finalSensitivity,
      },
      { new: true }
    );

    // 5. Notify user that processing is complete
    emitProcessingCompleted(io, userId, {
      videoId: updatedVideo._id,
      id: updatedVideo._id,
      title: updatedVideo.title || videoRecord.title,
      sensitivity: updatedVideo.sensitivity,
      status: updatedVideo.status,
    });

    console.log(`Video processing completed for ${videoId}. Result: ${finalSensitivity}`);
    
    return updatedVideo;

  } catch (error) {
    console.error(`Error processing video ${videoId}:`, error);
    
    // Attempt to mark as failed in DB
    try {
      await Video.findByIdAndUpdate(videoId, { status: 'failed' });
    } catch (e) {
      console.error('Failed to update status to failed', e);
    }
    
    return null;
  }
};
