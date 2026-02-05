package it.nucleo.application.upload

import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.receiveAsFlow

/**
 * Channel-based implementation for broadcasting upload events.
 * Each upload operation gets its own event channel.
 */
class UploadEventChannel {
    private val channel = Channel<UploadEvent>(Channel.BUFFERED)

    /**
     * Send an event to the channel
     */
    suspend fun send(event: UploadEvent) {
        channel.send(event)
    }

    /**
     * Get a flow of events for consumption
     */
    fun asFlow(): Flow<UploadEvent> = channel.receiveAsFlow()

    /**
     * Close the channel (call when upload is complete or on error)
     */
    fun close() {
        channel.close()
    }
}
