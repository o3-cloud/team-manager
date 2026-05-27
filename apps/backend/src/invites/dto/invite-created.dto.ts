import { InviteEntity } from '../entities/invite.entity';
import { InvitePublicDto } from './invite-public.dto';

export class InviteCreatedDto extends InvitePublicDto {
  token: string;

  static fromWithToken(invite: InviteEntity, rawToken: string): InviteCreatedDto {
    return { ...InvitePublicDto.from(invite), token: rawToken };
  }
}
