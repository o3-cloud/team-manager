import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamRole } from '../common/enums/team-role.enum';
import { EventEntity, EventStatus } from '../events/entities/event.entity';
import { RosterEntryEntity } from '../roster/entities/roster-entry.entity';
import { UpsertAttendanceDto } from './dto/upsert-attendance.dto';
import { AttendanceRecordEntity } from './entities/attendance-record.entity';

const MARK_ROLES = [
  TeamRole.COACH,
  TeamRole.ASSISTANT_COACH,
  TeamRole.TEAM_MANAGER,
  TeamRole.SCOREKEEPER,
];

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceRecordEntity)
    private readonly attendanceRepo: Repository<AttendanceRecordEntity>,
    @InjectRepository(EventEntity)
    private readonly eventRepo: Repository<EventEntity>,
    @InjectRepository(RosterEntryEntity)
    private readonly rosterRepo: Repository<RosterEntryEntity>,
  ) {}

  async upsert(
    teamId: string,
    eventId: string,
    actorRole: TeamRole,
    dto: UpsertAttendanceDto,
  ): Promise<AttendanceRecordEntity> {
    if (!MARK_ROLES.includes(actorRole)) {
      throw new ForbiddenException('Insufficient role to mark attendance');
    }

    const event = await this.eventRepo.findOneBy({ id: eventId, teamId });
    if (!event) throw new NotFoundException('Event not found');
    if (event.status === EventStatus.CANCELLED) {
      throw new UnprocessableEntityException('Cannot mark attendance for a cancelled event');
    }
    if (new Date(event.startsAt) > new Date()) {
      throw new UnprocessableEntityException('Cannot mark attendance for a future event');
    }

    const entry = await this.rosterRepo.findOneBy({ id: dto.rosterEntryId, teamId });
    if (!entry) throw new NotFoundException('Roster entry not found');

    const existing = await this.attendanceRepo.findOneBy({
      eventId,
      rosterEntryId: dto.rosterEntryId,
    });
    if (existing) {
      existing.mark = dto.mark;
      return this.attendanceRepo.save(existing);
    }

    const record = this.attendanceRepo.create({
      eventId,
      rosterEntryId: dto.rosterEntryId,
      mark: dto.mark,
    });
    return this.attendanceRepo.save(record);
  }

  async findByEvent(teamId: string, eventId: string): Promise<AttendanceRecordEntity[]> {
    const event = await this.eventRepo.findOneBy({ id: eventId, teamId });
    if (!event) throw new NotFoundException('Event not found');
    return this.attendanceRepo.findBy({ eventId });
  }
}
