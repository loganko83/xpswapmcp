// Distributed cache synchronization using pub/sub pattern
import { EventEmitter } from 'events';
import { cache } from '../services/cache.js';

interface CacheEvent {
  type: 'set' | 'delete' | 'clear';
  key?: string;
  value?: any;
  ttl?: number;
  nodeId: string;
  timestamp: number;
}

export class CacheSyncManager extends EventEmitter {
  private nodeId: string;
  private syncEnabled: boolean;
  private syncInterval: number;
  private syncTimer?: NodeJS.Timer;
  
  constructor(options?: {
    nodeId?: string;
    syncEnabled?: boolean;
    syncInterval?: number;
  }) {
    super();
    
    this.nodeId = options?.nodeId || process.env.NODE_ID || `node-${Date.now()}`;
    this.syncEnabled = options?.syncEnabled ?? process.env.CLUSTER_MODE === 'true';
    this.syncInterval = options?.syncInterval || 5000;
    
    if (this.syncEnabled) {
      this.initialize();
    }
  }
  
  private initialize() {
    console.log(`🔄 Cache sync initialized for node: ${this.nodeId}`);
    
    // Subscribe to cache events
    this.on('cache:sync', this.handleSyncEvent.bind(this));
    
    // Start heartbeat
    this.startHeartbeat();
    
    // In production, connect to Redis pub/sub or other message broker
    // this.connectToMessageBroker();
  }
  
  private async handleSyncEvent(event: CacheEvent) {
    // Ignore events from self
    if (event.nodeId === this.nodeId) {
      return;
    }
    
    console.log(`🔄 Received cache sync event from ${event.nodeId}:`, event.type);
    
    try {
      switch (event.type) {
        case 'set':
          if (event.key && event.value !== undefined) {
            await cache.set(event.key, event.value, event.ttl);
          }
          break;
          
        case 'delete':
          if (event.key) {
            await cache.delete(event.key);
          }
          break;
          
        case 'clear':
          await cache.clear();
          break;
      }
    } catch (error) {
      console.error('Cache sync error:', error);
    }
  }
  
  // Broadcast cache operations to other nodes
  async broadcastSet(key: string, value: any, ttl?: number) {
    if (!this.syncEnabled) return;
    
    const event: CacheEvent = {
      type: 'set',
      key,
      value,
      ttl,
      nodeId: this.nodeId,
      timestamp: Date.now()
    };
    
    this.broadcast(event);
  }
  
  async broadcastDelete(key: string) {
    if (!this.syncEnabled) return;
    
    const event: CacheEvent = {
      type: 'delete',
      key,
      nodeId: this.nodeId,
      timestamp: Date.now()
    };
    
    this.broadcast(event);
  }
  
  async broadcastClear() {
    if (!this.syncEnabled) return;
    
    const event: CacheEvent = {
      type: 'clear',
      nodeId: this.nodeId,
      timestamp: Date.now()
    };
    
    this.broadcast(event);
  }
  
  private broadcast(event: CacheEvent) {
    // In production, publish to Redis pub/sub or message broker
    // For now, emit locally (useful for testing)
    this.emit('cache:sync', event);
    
    // Production implementation:
    // this.pubClient.publish('cache:sync', JSON.stringify(event));
  }
  
  private startHeartbeat() {
    this.syncTimer = setInterval(async () => {
      try {
        const stats = await cache.getStats();
        console.log(`💓 Cache heartbeat from ${this.nodeId}:`, {
          size: stats.size,
          hitRate: stats.hitRate
        });
      } catch (error) {
        console.error('Heartbeat error:', error);
      }
    }, this.syncInterval);
  }
  
  stop() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = undefined;
    }
    
    this.removeAllListeners();
    console.log(`🛑 Cache sync stopped for node: ${this.nodeId}`);
  }
}

// Singleton instance
export const cacheSyncManager = new CacheSyncManager();

// Enhanced cache wrapper with sync support
export class SyncedCache {
  static async set(key: string, value: any, ttl?: number) {
    await cache.set(key, value, ttl);
    await cacheSyncManager.broadcastSet(key, value, ttl);
  }
  
  static async get(key: string) {
    return cache.get(key);
  }
  
  static async delete(key: string) {
    const result = await cache.delete(key);
    if (result) {
      await cacheSyncManager.broadcastDelete(key);
    }
    return result;
  }
  
  static async clear() {
    await cache.clear();
    await cacheSyncManager.broadcastClear();
  }
}

// Production Redis Pub/Sub implementation guide:
/*
To implement real Redis pub/sub:

1. Install Redis client:
   npm install ioredis

2. Create pub/sub clients:
   import Redis from 'ioredis';
   
   const pubClient = new Redis();
   const subClient = new Redis();
   
3. Subscribe to channel:
   subClient.subscribe('cache:sync');
   subClient.on('message', (channel, message) => {
     const event = JSON.parse(message);
     this.handleSyncEvent(event);
   });
   
4. Publish events:
   pubClient.publish('cache:sync', JSON.stringify(event));
*/

export default CacheSyncManager;
