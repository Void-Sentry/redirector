import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { RedisClientType, createClient } from 'redis';
import { ClientRMQ } from '@nestjs/microservices';

@Injectable()
export class CacheService implements OnModuleInit {
    readonly #subscriberClient: RedisClientType;
    readonly client: RedisClientType;

    constructor(
        @Inject('SHORTENER_CLIENT')
        private readonly shortenerClient: ClientRMQ,
    ) {
        this.client = createClient({
            url: process.env.CACHE_URL,
        });
        this.#subscriberClient = createClient({
            url: process.env.CACHE_URL,
        });
    }

    readonly onModuleInit = async () => {
        await this.#subscriberClient.connect();
        await this.#subscriberClient.configSet('notify-keyspace-events', 'Ex');
        await this.#subscriberClient.pSubscribe('__keyevent@0__:expired', (err, _) => {
            if (err) throw err;
        });

        this.#subscriberClient.on('pmessage', (pattern, channel, expiredKey) => {
            this.#handleExpiredKey(expiredKey);
        });
    };

    readonly #handleExpiredKey = (expiredKey: string) => {
        this.shortenerClient.emit('URL_EXPIRED', { code: expiredKey });
    };
}
