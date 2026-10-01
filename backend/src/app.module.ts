import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration, { AppConfig } from './config/configuration';
import { AppController } from './app.controller';
import { CustomersModule } from './modules/customers/customers.module';
import { OrdersModule } from './modules/orders/orders.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { ExpensesModule } from './modules/expenses/expenses.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig, true>) => ({
        type: 'postgres',
        url: configService.get('databaseUrl', { infer: true }),
        ssl: configService.get('databaseSsl', { infer: true }) ? { rejectUnauthorized: false } : false,
        autoLoadEntities: true,
        synchronize: false,
        logging: configService.get('nodeEnv', { infer: true }) === 'development',
      }),
    }),
    CustomersModule,
    OrdersModule,
    InventoryModule,
    ExpensesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
