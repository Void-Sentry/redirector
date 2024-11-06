import { RedisClientType, createClient } from 'redis';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CacheService {
    readonly client: RedisClientType;

    constructor() {
        this.client = createClient({
            url: process.env.CACHE_URL,
        });
    }
}
