import { MessagePattern, Payload } from "@nestjs/microservices";
import { CacheService } from "./cache.service";
import { Controller } from "@nestjs/common";

@Controller()
export class AppHandler {
    constructor(private readonly cacheService: CacheService) {}

    @MessagePattern('URL_GENERATED')
    urlCreatedHandler(@Payload() data: { originalUrl: string, code: string }) {
        this.cacheService.client.set(data.code, data.originalUrl);
    }
}