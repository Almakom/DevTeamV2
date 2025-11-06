import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard, RolesGuard, TenantGuard } from './guards';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  providers: [JwtStrategy, JwtAuthGuard, RolesGuard, TenantGuard],
  exports: [JwtAuthGuard, RolesGuard, TenantGuard, PassportModule],
})
export class AuthModule {}
