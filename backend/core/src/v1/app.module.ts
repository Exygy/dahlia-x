import { DynamicModule, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { UserModule } from "./user/user.module"
// Use require because of the CommonJS/AMD style export.
// See https://www.typescriptlang.org/docs/handbook/modules.html#export--and-import--require
import { AuthModule } from "./auth/auth.module"

import { ListingsModule } from "./listings/listings.module"
import { ApplicationsModule } from "./applications/applications.module"
import { PreferencesModule } from "./preferences/preferences.module"
import { UnitsModule } from "./units/units.module"
import { PropertyGroupsModule } from "./property-groups/property-groups.module"
import { PropertiesModule } from "./property/properties.module"
import { AmiChartsModule } from "./ami-charts/ami-charts.module"
import { ApplicationFlaggedSetsModule } from "./application-flagged-sets/application-flagged-sets.module"
import { ThrottlerModule } from "@nestjs/throttler"
import { ThrottlerStorageRedisService } from "nestjs-throttler-storage-redis"
import Redis from "ioredis"
import { SharedModule } from "../shared/shared.module"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { TranslationsModule } from "./translations/translations.module"

@Module({
  imports: [ApplicationFlaggedSetsModule],
})
export class AppModule {
  static register(dbOptions): DynamicModule {
    /**
     * DEV NOTE:
     * This configuration is required due to issues with
     * self signed certificates in Redis 6.
     *
     * { rejectUnauthorized: false } option is intentional and required
     *
     * Read more:
     * https://help.heroku.com/HC0F8CUS/redis-connection-issues
     * https://devcenter.heroku.com/articles/heroku-redis#ioredis-module
     */
    const redis =
      "0" === process.env.REDIS_USE_TLS
        ? new Redis(process.env.REDIS_URL)
        : new Redis(process.env.REDIS_TLS_URL, {
            tls: {
              rejectUnauthorized: false,
            },
          })

    return {
      module: AppModule,
      imports: [
        TypeOrmModule.forRoot({
          ...dbOptions,
          autoLoadEntities: true,
        }),
        ThrottlerModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (config: ConfigService) => ({
            ttl: config.get("THROTTLE_TTL"),
            limit: config.get("THROTTLE_LIMIT"),
            storage: new ThrottlerStorageRedisService(redis),
          }),
        }),
        UserModule,
        AuthModule,
        ListingsModule,
        ApplicationsModule,
        PreferencesModule,
        UnitsModule,
        PropertiesModule,
        PropertyGroupsModule,
        AmiChartsModule,
        SharedModule,
        TranslationsModule,
      ],
    }
  }
}
