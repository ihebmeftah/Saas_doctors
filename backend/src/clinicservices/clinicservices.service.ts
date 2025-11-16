import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClinicService } from './entities/clinicservice.entity';
import { Clinique } from 'src/clinique/entities/clinique.entity';
import { CreateClinicServiceDto } from './dto/create-clinicservice.dto';
import { UpdateClinicServiceDto } from './dto/update-clinicservice.dto';

@Injectable()
export class ClinicServicesService {
    constructor(
        @InjectRepository(ClinicService)
        private readonly clinicServiceRepository: Repository<ClinicService>,
        @InjectRepository(Clinique)
        private readonly cliniqueRepository: Repository<Clinique>,
    ) {}

    async create(createClinicServiceDto: CreateClinicServiceDto): Promise<ClinicService> {
        const clinique = await this.cliniqueRepository.findOne({
            where: { id: createClinicServiceDto.cliniqueId },
        });

        if (!clinique) {
            throw new NotFoundException('Clinique not found');
        }

        const service = this.clinicServiceRepository.create({
            ...createClinicServiceDto,
            clinique,
        });

        return this.clinicServiceRepository.save(service);
    }

    async findAll(cliniqueId?: string): Promise<ClinicService[]> {
        const query = this.clinicServiceRepository.createQueryBuilder('service');

        if (cliniqueId) {
            query.where('service.clinique.id = :cliniqueId', { cliniqueId });
        }

        return query.leftJoinAndSelect('service.clinique', 'clinique').getMany();
    }

    async findOne(id: string): Promise<ClinicService> {
        const service = await this.clinicServiceRepository.findOne({
            where: { id },
            relations: ['clinique'],
        });

        if (!service) {
            throw new NotFoundException(`Service with ID ${id} not found`);
        }

        return service;
    }

    async findByClinicId(cliniqueId: string): Promise<ClinicService[]> {
        const clinique = await this.cliniqueRepository.findOne({
            where: { id: cliniqueId },
        });

        if (!clinique) {
            throw new NotFoundException('Clinique not found');
        }

        return this.clinicServiceRepository.find({
            where: { clinique: { id: cliniqueId } },
            relations: ['clinique'],
        });
    }

    async update(id: string, updateClinicServiceDto: UpdateClinicServiceDto): Promise<ClinicService> {
        const service = await this.findOne(id);

        if (updateClinicServiceDto.cliniqueId) {
            const clinique = await this.cliniqueRepository.findOne({
                where: { id: updateClinicServiceDto.cliniqueId },
            });

            if (!clinique) {
                throw new NotFoundException('Clinique not found');
            }

            service.clinique = clinique;
        }

        Object.assign(service, updateClinicServiceDto);
        return this.clinicServiceRepository.save(service);
    }

    async remove(id: string): Promise<void> {
        const service = await this.findOne(id);
        await this.clinicServiceRepository.remove(service);
    }

    async getServicesByClinic(cliniqueId: string): Promise<ClinicService[]> {
        return this.findByClinicId(cliniqueId);
    }
}
