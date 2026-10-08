import { BadRequestException, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TeamRole } from '../enums/team-role.enum';
import { TeamMemberGuard, TeamScopedRequest } from './team-member.guard';

describe('TeamMemberGuard BDR authorization', () => {
  const membershipRepo = { findOneBy: jest.fn() };
  const reflector = { getAllAndOverride: jest.fn() } as unknown as Reflector;
  const guard = new TeamMemberGuard(membershipRepo as never, reflector);

  const contextFor = (request: Partial<TeamScopedRequest>): ExecutionContext =>
    ({
      switchToHttp: () => ({ getRequest: () => request }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    }) as unknown as ExecutionContext;

  beforeEach(() => jest.clearAllMocks());

  it('passes non-team-scoped routes through', async () => {
    await expect(
      guard.canActivate(contextFor({ params: {}, user: { id: 'user-1' } as never })),
    ).resolves.toBe(true);
    expect(membershipRepo.findOneBy).not.toHaveBeenCalled();
  });

  it('rejects malformed team IDs', async () => {
    await expect(
      guard.canActivate(
        contextFor({ params: { teamId: 'not-a-uuid' }, user: { id: 'user-1' } as never }),
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects IDOR access by a non-member', async () => {
    membershipRepo.findOneBy.mockResolvedValue(null);

    await expect(
      guard.canActivate(
        contextFor({
          params: { teamId: '00000000-0000-4000-8000-000000000001' },
          user: { id: 'outsider' } as never,
        }),
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('rejects a member whose role is not allowed and records allowed membership context', async () => {
    membershipRepo.findOneBy.mockResolvedValue({ role: TeamRole.PLAYER, teamId: 'team-1' });
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([TeamRole.COACH]);
    const request = {
      params: { teamId: '00000000-0000-4000-8000-000000000001' },
      user: { id: 'player-1' },
    } as unknown as TeamScopedRequest;

    await expect(guard.canActivate(contextFor(request))).rejects.toThrow(ForbiddenException);
    expect(request.teamRole).toBe(TeamRole.PLAYER);
    expect(request.membership?.role).toBe(TeamRole.PLAYER);
  });
});
