/**
 * EventEmitter - Simple event emitter implementation
 * Provides event handling capabilities for WritrEditor
 */
export class EventEmitter {
    constructor() {
        this.events = {};
    }

    /**
     * Register an event listener
     */
    on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
        return this;
    }

    /**
     * Register a one-time event listener
     */
    once(event, listener) {
        const onceWrapper = (...args) => {
            listener.apply(this, args);
            this.off(event, onceWrapper);
        };
        this.on(event, onceWrapper);
        return this;
    }

    /**
     * Remove an event listener
     */
    off(event, listenerToRemove) {
        if (!this.events[event]) {
            return this;
        }

        this.events[event] = this.events[event].filter(
            listener => listener !== listenerToRemove
        );
        return this;
    }

    /**
     * Emit an event
     */
    emit(event, ...args) {
        if (!this.events[event]) {
            return false;
        }

        this.events[event].forEach(listener => {
            try {
                listener.apply(this, args);
            } catch (error) {
                console.error('Event listener error:', error);
            }
        });
        return true;
    }

    /**
     * Remove all listeners for an event or all events
     */
    removeAllListeners(event = null) {
        if (event) {
            delete this.events[event];
        } else {
            this.events = {};
        }
        return this;
    }

    /**
     * Get listener count for an event
     */
    listenerCount(event) {
        return this.events[event] ? this.events[event].length : 0;
    }
}
