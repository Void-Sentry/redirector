import { OnModuleInit } from "@nestjs/common";
import { readFile } from "node:fs/promises";

export class ConfigService implements OnModuleInit {
    #secrets: Record<string, any>;
    
    async onModuleInit() {
        await this.reload();
        process.on('SIGHUP', this.reload);
    }

    readonly reload = () => (
        readFile('/secret/data/redirector/config', { encoding: 'utf8' })
          .then((file) => JSON.parse(file))
          .then((parsed) => this.#secrets = parsed)
          .catch((e) => console.log(e))
    );

    readonly get = (key?: string) => (
        this.#secrets?.[key]
    );
}