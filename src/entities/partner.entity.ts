import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { Service } from './service.entity';

@Entity()
export class Partner {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  partnerName: string;

  @Column({ unique: true })
  partnerCode: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Service, (service) => service.partner)
  services: Service[];
}
