import { Column, Entity, JoinColumn, ManyToOne } from "typeorm"
import { Expose, Type } from "class-transformer"
import { IsString } from "class-validator"
import { ValidationsGroupsEnum } from "../../shared/types/validations-groups-enum"
import { AbstractEntity } from "../../shared/entities/abstract.entity"
import { User } from "../../auth/entities/user.entity"

@Entity({ name: "activity_logs" })
export class ActivityLog extends AbstractEntity {
  @Column()
  @Expose()
  module: string

  @Column("uuid")
  @Expose()
  recordId: string

  @Column()
  @Expose()
  action: string

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn()
  @Expose()
  @Type(() => User)
  user: User

  @Column({ nullable: true })
  @Expose()
  metadata?: string
}
