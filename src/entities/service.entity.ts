import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { Partner } from './partner.entity';
import { Subscription } from './subscription.entity';

@Entity()
export class Service {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  serviceName: string;

  @Column({ unique: true })
  serviceCode: string;

  @ManyToOne(() => Partner, (partner) => partner.services)
  @JoinColumn({ name: 'partnerId' })
  partner: Partner;

  @OneToMany(() => Subscription, (subscription) => subscription.service)
  subscriptions: Subscription[];

  @CreateDateColumn()
  createdAt: Date;
}
