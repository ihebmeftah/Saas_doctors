import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Admin } from '../users/entities/admin.entity';
import { Doctor } from '../users/entities/doctor.entity';
import { Patient } from '../users/entities/patient.entity';
import { Receptionist } from '../users/entities/receptioniste.entity';
import { Clinique } from '../clinique/entities/clinique.entity';
import { ClinicService } from '../clinicservices/entities/clinicservice.entity';
import { Rdv, rdvStatus } from '../rdv/entities/rdv.entity';
import { userRole } from '../users/entities/user.entity';
import { Facturation, FacturationStatus } from '../facturation/entities/facturation.entity';
import { Payment, PaymentMethod, PaymentStatus } from '../payment/entities/payment.entity';

@Injectable()
export class SeedService {
    constructor(
        @InjectRepository(Admin)
        private adminRepository: Repository<Admin>,
        @InjectRepository(Doctor)
        private doctorRepository: Repository<Doctor>,
        @InjectRepository(Patient)
        private patientRepository: Repository<Patient>,
        @InjectRepository(Receptionist)
        private receptionistRepository: Repository<Receptionist>,
        @InjectRepository(Clinique)
        private cliniqueRepository: Repository<Clinique>,
        @InjectRepository(ClinicService)
        private clinicServiceRepository: Repository<ClinicService>,
        @InjectRepository(Rdv)
        private rdvRepository: Repository<Rdv>,
        @InjectRepository(Facturation)
        private facturationRepository: Repository<Facturation>,
        @InjectRepository(Payment)
        private paymentRepository: Repository<Payment>,
    ) { }

    async seed() {
        console.log('🌱 Starting database seeding...');

        // Clear existing data
        await this.clearDatabase();

        // Seed data in order
        const admin = await this.seedAdmin();
        const clinics = await this.seedClinics(admin);
        const doctors = await this.seedDoctors(clinics);
        const receptionists = await this.seedReceptionists(clinics);
        const patients = await this.seedPatients();
        await this.seedClinicServices(clinics);
        const appointments = await this.seedAppointments(clinics, doctors, patients, receptionists);
        await this.seedFacturationsAndPayments(appointments, patients, clinics);

        console.log('✅ Database seeding completed successfully!');
    }

    private async clearDatabase() {
        console.log('🧹 Clearing existing data...');
        // Use query builder to truncate or delete all with proper conditions
        await this.paymentRepository.createQueryBuilder().delete().execute();
        await this.facturationRepository.createQueryBuilder().delete().execute();
        await this.rdvRepository.createQueryBuilder().delete().execute();
        await this.clinicServiceRepository.createQueryBuilder().delete().execute();
        await this.receptionistRepository.createQueryBuilder().delete().execute();
        await this.doctorRepository.createQueryBuilder().delete().execute();
        await this.patientRepository.createQueryBuilder().delete().execute();
        await this.cliniqueRepository.createQueryBuilder().delete().execute();
        await this.adminRepository.createQueryBuilder().delete().execute();
        console.log('✓ Database cleared');
    }

    private async seedAdmin(): Promise<Admin> {
        console.log('👤 Seeding admin...');
        const hashedPassword = await bcrypt.hash('Admin@123', 10);

        const admin = this.adminRepository.create({
            firstName: 'Super',
            lastName: 'Admin',
            email: 'admin@medclinic.com',
            phone: 12345678,
            password: hashedPassword,
            role: userRole.SUPER_ADMIN,
        });

        const savedAdmin = await this.adminRepository.save(admin);
        console.log('✓ Admin created:', savedAdmin.email);
        return savedAdmin;
    }

    private async seedClinics(admin: Admin): Promise<Clinique[]> {
        console.log('🏥 Seeding clinics...');
        const clinicsData = [
            {
                name: 'Clinique du Centre',
                address: '123 Avenue Habib Bourguiba, Tunis 1000',
                phone: '71234567',
                email: 'contact@cliniquecentre.tn',
            },
            {
                name: 'Clinique La Marsa',
                address: '45 Route de la Corniche, La Marsa 2078',
                phone: '71745678',
                email: 'info@cliniquelamarsa.tn',
            },
            {
                name: 'Clinique Sousse Medical',
                address: '78 Avenue Léopold Sédar Senghor, Sousse 4000',
                phone: '73220456',
                email: 'contact@soussemed.tn',
            },
        ];

        const clinics: Clinique[] = [];
        for (const clinicData of clinicsData) {
            const clinic = this.cliniqueRepository.create({
                ...clinicData,
                addedby: admin,
            });
            const savedClinic = await this.cliniqueRepository.save(clinic);
            clinics.push(savedClinic);
            console.log('✓ Clinic created:', savedClinic.name);
        }

        return clinics;
    }

    private async seedDoctors(clinics: Clinique[]): Promise<Doctor[]> {
        console.log('👨‍⚕️ Seeding doctors...');
        const hashedPassword = await bcrypt.hash('Doctor@123', 10);

        const doctorsData = [
            {
                firstName: 'Ahmed',
                lastName: 'Ben Salah',
                email: 'ahmed.bensalah@medclinic.tn',
                phone: 98765432,
                specialty: 'Cardiology',
                clinic: clinics[0],
            },
            {
                firstName: 'Fatma',
                lastName: 'Trabelsi',
                email: 'fatma.trabelsi@medclinic.tn',
                phone: 97654321,
                specialty: 'Pediatrics',
                clinic: clinics[0],
            },
            {
                firstName: 'Mohamed',
                lastName: 'Khiari',
                email: 'mohamed.khiari@medclinic.tn',
                phone: 96543210,
                specialty: 'Dermatology',
                clinic: clinics[1],
            },
            {
                firstName: 'Leila',
                lastName: 'Mansouri',
                email: 'leila.mansouri@medclinic.tn',
                phone: 95432109,
                specialty: 'General Medicine',
                clinic: clinics[1],
            },
            {
                firstName: 'Karim',
                lastName: 'Jebali',
                email: 'karim.jebali@medclinic.tn',
                phone: 94321098,
                specialty: 'Orthopedics',
                clinic: clinics[2],
            },
            {
                firstName: 'Sonia',
                lastName: 'Hamdi',
                email: 'sonia.hamdi@medclinic.tn',
                phone: 93210987,
                specialty: 'Gynecology',
                clinic: clinics[2],
            },
        ];

        const doctors: Doctor[] = [];
        for (const doctorData of doctorsData) {
            const doctor = this.doctorRepository.create({
                firstName: doctorData.firstName,
                lastName: doctorData.lastName,
                email: doctorData.email,
                phone: doctorData.phone,
                password: hashedPassword,
                role: userRole.DOCTOR,
                clinique: doctorData.clinic,
            });
            const savedDoctor = await this.doctorRepository.save(doctor);
            doctors.push(savedDoctor);
            console.log(`✓ Doctor created: Dr. ${savedDoctor.firstName} ${savedDoctor.lastName}`);
        }

        return doctors;
    }

    private async seedReceptionists(clinics: Clinique[]): Promise<Receptionist[]> {
        console.log('💼 Seeding receptionists...');
        const hashedPassword = await bcrypt.hash('Recep@123', 10);

        const receptionistsData = [
            {
                firstName: 'Nadia',
                lastName: 'Bouaziz',
                email: 'nadia.bouaziz@medclinic.tn',
                phone: 92109876,
                clinic: clinics[0],
            },
            {
                firstName: 'Samia',
                lastName: 'Gharbi',
                email: 'samia.gharbi@medclinic.tn',
                phone: 91098765,
                clinic: clinics[1],
            },
            {
                firstName: 'Hanen',
                lastName: 'Zouhair',
                email: 'hanen.zouhair@medclinic.tn',
                phone: 90987654,
                clinic: clinics[2],
            },
        ];

        const receptionists: Receptionist[] = [];
        for (const recepData of receptionistsData) {
            const receptionist = this.receptionistRepository.create({
                firstName: recepData.firstName,
                lastName: recepData.lastName,
                email: recepData.email,
                phone: recepData.phone,
                password: hashedPassword,
                role: userRole.RECEP,
                clinique: recepData.clinic,
            });
            const savedReceptionist = await this.receptionistRepository.save(receptionist);
            receptionists.push(savedReceptionist);
            console.log(`✓ Receptionist created: ${savedReceptionist.firstName} ${savedReceptionist.lastName}`);
        }

        return receptionists;
    }

    private async seedPatients(): Promise<Patient[]> {
        console.log('🧑‍🤝‍🧑 Seeding patients...');
        const hashedPassword = await bcrypt.hash('Patient@123', 10);

        const patientsData = [
            {
                firstName: 'Youssef',
                lastName: 'Meddeb',
                email: 'youssef.meddeb@email.com',
                phone: 55443322,
                dateOfBirth: new Date('1985-03-15'),
                address: '12 Rue de la Liberté, Tunis',
                bloodType: 'A+',
            },
            {
                firstName: 'Amira',
                lastName: 'Chaibi',
                email: 'amira.chaibi@email.com',
                phone: 54332211,
                dateOfBirth: new Date('1990-07-22'),
                address: '34 Avenue de Carthage, Ariana',
                bloodType: 'O+',
            },
            {
                firstName: 'Mehdi',
                lastName: 'Lahmar',
                email: 'mehdi.lahmar@email.com',
                phone: 53221100,
                dateOfBirth: new Date('1978-11-08'),
                address: '56 Rue Mongi Slim, Sfax',
                bloodType: 'B+',
            },
            {
                firstName: 'Rim',
                lastName: 'Oueslati',
                email: 'rim.oueslati@email.com',
                phone: 52110099,
                dateOfBirth: new Date('1995-05-30'),
                address: '78 Avenue Bourguiba, Sousse',
                bloodType: 'AB+',
            },
            {
                firstName: 'Tarek',
                lastName: 'Zaouali',
                email: 'tarek.zaouali@email.com',
                phone: 51009988,
                dateOfBirth: new Date('1982-09-12'),
                address: '90 Rue de Palestine, Ben Arous',
                bloodType: 'O-',
            },
            {
                firstName: 'Salma',
                lastName: 'Benjemaa',
                email: 'salma.benjemaa@email.com',
                phone: 50998877,
                dateOfBirth: new Date('1988-12-25'),
                address: '23 Avenue de la République, La Marsa',
                bloodType: 'A-',
            },
            {
                firstName: 'Rami',
                lastName: 'Sellami',
                email: 'rami.sellami@email.com',
                phone: 59887766,
                dateOfBirth: new Date('1975-04-18'),
                address: '45 Rue du Parc, Monastir',
                bloodType: 'B-',
            },
            {
                firstName: 'Ines',
                lastName: 'Jrad',
                email: 'ines.jrad@email.com',
                phone: 58776655,
                dateOfBirth: new Date('1992-08-07'),
                address: '67 Avenue Habib Thameur, Nabeul',
                bloodType: 'AB-',
            },
        ];

        const patients: Patient[] = [];
        for (const patientData of patientsData) {
            const patient = this.patientRepository.create({
                ...patientData,
                password: hashedPassword,
                role: userRole.PATIENT,
            });
            const savedPatient = await this.patientRepository.save(patient);
            patients.push(savedPatient);
            console.log(`✓ Patient created: ${savedPatient.firstName} ${savedPatient.lastName}`);
        }

        return patients;
    }

    private async seedClinicServices(clinics: Clinique[]) {
        console.log('🩺 Seeding clinic services...');

        const servicesData = [
            // Services for Clinique du Centre
            {
                name: 'Consultation générale',
                description: 'Consultation médicale générale avec examen complet',
                price: 50,
                durationMinutes: 30,
                clinic: clinics[0],
            },
            {
                name: 'Électrocardiogramme (ECG)',
                description: 'Examen cardiaque pour détecter les anomalies du rythme',
                price: 75,
                durationMinutes: 20,
                clinic: clinics[0],
            },
            {
                name: 'Échographie',
                description: 'Échographie abdominale ou pelvienne',
                price: 120,
                durationMinutes: 45,
                clinic: clinics[0],
            },
            // Services for Clinique La Marsa
            {
                name: 'Consultation dermatologie',
                description: 'Consultation spécialisée en dermatologie',
                price: 80,
                durationMinutes: 30,
                clinic: clinics[1],
            },
            {
                name: 'Consultation pédiatrie',
                description: 'Consultation pour enfants et nourrissons',
                price: 60,
                durationMinutes: 30,
                clinic: clinics[1],
            },
            {
                name: 'Vaccination',
                description: 'Administration de vaccins selon le calendrier vaccinal',
                price: 40,
                durationMinutes: 15,
                clinic: clinics[1],
            },
            // Services for Clinique Sousse Medical
            {
                name: 'Consultation orthopédie',
                description: 'Consultation spécialisée pour problèmes osseux et articulaires',
                price: 90,
                durationMinutes: 40,
                clinic: clinics[2],
            },
            {
                name: 'Radiographie',
                description: 'Radiographie standard (2 clichés)',
                price: 70,
                durationMinutes: 20,
                clinic: clinics[2],
            },
            {
                name: 'Consultation gynécologie',
                description: 'Consultation gynécologique et suivi de grossesse',
                price: 85,
                durationMinutes: 35,
                clinic: clinics[2],
            },
        ];

        for (const serviceData of servicesData) {
            const service = this.clinicServiceRepository.create({
                name: serviceData.name,
                description: serviceData.description,
                price: serviceData.price,
                durationMinutes: serviceData.durationMinutes,
                isActive: true,
                clinique: serviceData.clinic,
            });
            await this.clinicServiceRepository.save(service);
            console.log(`✓ Service created: ${service.name} at ${serviceData.clinic.name}`);
        }
    }

    private async seedAppointments(
        clinics: Clinique[],
        doctors: Doctor[],
        patients: Patient[],
        receptionists: Receptionist[],
    ): Promise<Rdv[]> {
        console.log('📅 Seeding appointments...');

        const today = new Date();
        const appointmentsData = [
            // Past appointments (completed)
            {
                patient: patients[0],
                doctor: doctors[0],
                clinique: clinics[0],
                receptionist: receptionists[0],
                reason: 'Douleurs thoraciques et essoufflement',
                rdvDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
                status: rdvStatus.COMPLETED,
                amount: 50,
                consultation: {
                    examination: 'Examen cardiaque complet, auscultation pulmonaire, mesure de la pression artérielle (140/90)',
                    diagnosis: 'Hypertension artérielle légère, anxiété',
                    treatment: 'Repos, réduction du stress, suivi dans 1 mois. Prescription: Amlodipine 5mg 1x/jour',
                },
            },
            {
                patient: patients[1],
                doctor: doctors[1],
                clinique: clinics[0],
                receptionist: receptionists[0],
                reason: 'Vaccination enfant - rappel',
                rdvDate: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
                status: rdvStatus.COMPLETED,
                amount: 40,
                consultation: {
                    examination: 'Examen pédiatrique général, vérification du carnet de vaccination',
                    diagnosis: 'Enfant en bonne santé, développement normal',
                    treatment: 'Vaccination ROR (Rougeole-Oreillons-Rubéole) effectuée. Prochain rappel dans 6 mois',
                },
            },
            {
                patient: patients[2],
                doctor: doctors[2],
                clinique: clinics[1],
                receptionist: receptionists[1],
                reason: 'Problème de peau - eczéma',
                rdvDate: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
                status: rdvStatus.COMPLETED,
                amount: 80,
                consultation: {
                    examination: 'Examen dermatologique des zones affectées (bras, jambes), évaluation de la sévérité',
                    diagnosis: 'Dermatite atopique (eczéma) modérée',
                    treatment: 'Crème hydratante 2x/jour, Dermocorticoïde (Hydrocortisone 1%) pendant 7 jours, éviter les irritants',
                },
            },
            // Today's appointments
            {
                patient: patients[3],
                doctor: doctors[3],
                clinique: clinics[1],
                receptionist: receptionists[1],
                reason: 'Consultation générale - fatigue persistante',
                rdvDate: new Date(today.setHours(10, 0, 0, 0)),
                status: rdvStatus.SCHEDULED,
                amount: 50,
            },
            {
                patient: patients[4],
                doctor: doctors[4],
                clinique: clinics[2],
                receptionist: receptionists[2],
                reason: 'Douleur au genou suite à une chute',
                rdvDate: new Date(today.setHours(14, 30, 0, 0)),
                status: rdvStatus.IN_PROGRESS,
                amount: 90,
                consultation: {
                    examination: 'Examen orthopédique du genou droit, test de mobilité, palpation',
                    diagnosis: 'Contusion du genou, pas de fracture détectée',
                    treatment: 'Repos, application de glace, anti-inflammatoires (Ibuprofène 400mg 3x/jour pendant 5 jours)',
                },
            },
            // Upcoming appointments
            {
                patient: patients[5],
                doctor: doctors[5],
                clinique: clinics[2],
                receptionist: receptionists[2],
                reason: 'Suivi de grossesse - 2ème trimestre',
                rdvDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), // in 2 days
                status: rdvStatus.SCHEDULED,
                amount: 85,
            },
            {
                patient: patients[6],
                doctor: doctors[0],
                clinique: clinics[0],
                receptionist: receptionists[0],
                reason: 'Contrôle cardiaque de routine',
                rdvDate: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000), // in 4 days
                status: rdvStatus.SCHEDULED,
                amount: 75,
            },
            {
                patient: patients[7],
                doctor: doctors[1],
                clinique: clinics[0],
                receptionist: receptionists[0],
                reason: 'Fièvre et toux - enfant 5 ans',
                rdvDate: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000), // tomorrow
                status: rdvStatus.PENDING,
                amount: 60,
            },
            {
                patient: patients[0],
                doctor: doctors[2],
                clinique: clinics[1],
                receptionist: receptionists[1],
                reason: 'Consultation dermatologique - acné',
                rdvDate: new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000), // in 6 days
                status: rdvStatus.SCHEDULED,
                amount: 80,
            },
            {
                patient: patients[2],
                doctor: doctors[4],
                clinique: clinics[2],
                receptionist: receptionists[2],
                reason: 'Douleur lombaire chronique',
                rdvDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000), // in 3 days
                status: rdvStatus.SCHEDULED,
                amount: 90,
            },
        ];

        const appointments: Rdv[] = [];
        for (const rdvData of appointmentsData) {
            const rdv = this.rdvRepository.create({
                ...rdvData,
                createdBy: userRole.RECEP,
            });
            const savedRdv = await this.rdvRepository.save(rdv);
            appointments.push(savedRdv);
            console.log(`✓ Appointment created: ${rdvData.patient.firstName} with Dr. ${rdvData.doctor.firstName} on ${rdvData.rdvDate.toLocaleDateString()}`);
        }

        return appointments;
    }

    private async seedFacturationsAndPayments(appointments: Rdv[], patients: Patient[], clinics: Clinique[]) {
        console.log('💰 Seeding facturations and payments...');

        const today = new Date();
        let invoiceCounter = 1;

        // Generate facturations for completed and in-progress appointments
        const appointmentsWithFacturation = appointments.filter(
            rdv => rdv.status === rdvStatus.COMPLETED || rdv.status === rdvStatus.IN_PROGRESS
        );

        for (const rdv of appointmentsWithFacturation) {
            const invoiceNumber = `INV-${today.getFullYear()}-${String(invoiceCounter).padStart(5, '0')}`;
            invoiceCounter++;

            const totalAmount = rdv.amount;
            const taxAmount = totalAmount * 0.19; // 19% TVA
            const totalWithTax = totalAmount + taxAmount;

            // Determine facturation status based on appointment
            let status: FacturationStatus;
            let paidAmount = 0;
            const dueDate = new Date(rdv.rdvDate);
            dueDate.setDate(dueDate.getDate() + 30); // Due in 30 days

            if (rdv.status === rdvStatus.COMPLETED) {
                // Some completed appointments are fully paid, some partially, some not paid
                const paymentScenario = Math.random();
                if (paymentScenario < 0.6) {
                    status = FacturationStatus.PAID;
                    paidAmount = totalWithTax;
                } else if (paymentScenario < 0.8) {
                    status = FacturationStatus.PARTIALLY_PAID;
                    paidAmount = totalWithTax * 0.5; // 50% paid
                } else {
                    status = FacturationStatus.ISSUED;
                    paidAmount = 0;
                }
            } else {
                // In-progress appointments
                status = FacturationStatus.DRAFT;
                paidAmount = 0;
            }

            const facturation = this.facturationRepository.create({
                invoiceNumber,
                patient: rdv.patient,
                clinique: rdv.clinique,
                totalAmount: totalWithTax,
                paidAmount,
                taxAmount,
                discountAmount: 0,
                status,
                dueDate,
                description: `Consultation - ${rdv.reason}`,
                rdv,
            });

            const savedFacturation = await this.facturationRepository.save(facturation);
            console.log(`✓ Facturation created: ${invoiceNumber} - ${status} (${paidAmount}/${totalWithTax} TND)`);

            // Create payments for paid and partially paid facturations
            if (paidAmount > 0) {
                await this.createPaymentsForFacturation(savedFacturation, paidAmount, rdv.rdvDate);
            }
        }

        // Create some standalone facturations (not linked to appointments)
        await this.createStandaloneFacturations(patients, clinics, today, invoiceCounter);
    }

    private async createPaymentsForFacturation(facturation: Facturation, totalPaid: number, baseDate: Date) {
        const paymentMethods = [PaymentMethod.CASH, PaymentMethod.CREDIT_CARD, PaymentMethod.BANK_TRANSFER];
        const isFullyPaid = totalPaid >= facturation.totalAmount;

        if (isFullyPaid) {
            // Single payment for full amount
            const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
            const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

            const payment = this.paymentRepository.create({
                transactionId,
                facturation,
                amount: totalPaid,
                paymentMethod,
                status: PaymentStatus.COMPLETED,
                reference: `REF-${transactionId}`,
                notes: 'Paiement complet lors de la consultation',
                completedAt: new Date(baseDate.getTime() + 60 * 60 * 1000), // 1 hour after appointment
            });

            await this.paymentRepository.save(payment);
            console.log(`  ✓ Payment created: ${transactionId} - ${totalPaid} TND (${paymentMethod})`);
        } else {
            // Partial payment - split into multiple payments
            const firstPaymentAmount = totalPaid * 0.7; // 70% of partial payment
            const secondPaymentAmount = totalPaid * 0.3; // 30% of partial payment

            // First payment - cash
            const transactionId1 = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
            const payment1 = this.paymentRepository.create({
                transactionId: transactionId1,
                facturation,
                amount: firstPaymentAmount,
                paymentMethod: PaymentMethod.CASH,
                status: PaymentStatus.COMPLETED,
                reference: `REF-${transactionId1}`,
                notes: 'Acompte en espèces',
                completedAt: new Date(baseDate.getTime() + 60 * 60 * 1000), // 1 hour after
            });

            await this.paymentRepository.save(payment1);
            console.log(`  ✓ Payment created: ${transactionId1} - ${firstPaymentAmount.toFixed(2)} TND (CASH)`);

            // Second payment - credit card
            const transactionId2 = `TXN-${Date.now() + 1}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
            const payment2 = this.paymentRepository.create({
                transactionId: transactionId2,
                facturation,
                amount: secondPaymentAmount,
                paymentMethod: PaymentMethod.CREDIT_CARD,
                status: PaymentStatus.COMPLETED,
                reference: `REF-${transactionId2}`,
                notes: 'Paiement complémentaire par carte',
                completedAt: new Date(baseDate.getTime() + 24 * 60 * 60 * 1000), // 1 day after
            });

            await this.paymentRepository.save(payment2);
            console.log(`  ✓ Payment created: ${transactionId2} - ${secondPaymentAmount.toFixed(2)} TND (CREDIT_CARD)`);
        }
    }

    private async createStandaloneFacturations(patients: Patient[], clinics: Clinique[], today: Date, startCounter: number) {
        console.log('📄 Creating standalone facturations...');

        const standaloneFacturations = [
            {
                patient: patients[3],
                clinique: clinics[0],
                totalAmount: 250,
                description: 'Échographie abdominale complète',
                status: FacturationStatus.ISSUED,
                dueDate: new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000),
            },
            {
                patient: patients[5],
                clinique: clinics[2],
                totalAmount: 450,
                description: 'Analyses sanguines complètes + échographie',
                status: FacturationStatus.PAID,
                dueDate: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000),
                paidAmount: 450,
            },
            {
                patient: patients[6],
                clinique: clinics[1],
                totalAmount: 180,
                description: 'Radiographie thoracique + consultation',
                status: FacturationStatus.OVERDUE,
                dueDate: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000),
            },
        ];

        for (let i = 0; i < standaloneFacturations.length; i++) {
            const data = standaloneFacturations[i];
            const invoiceNumber = `INV-${today.getFullYear()}-${String(startCounter + i).padStart(5, '0')}`;
            const taxAmount = data.totalAmount * 0.19;
            const totalWithTax = data.totalAmount + taxAmount;

            const facturation = this.facturationRepository.create({
                invoiceNumber,
                patient: data.patient,
                clinique: data.clinique,
                totalAmount: totalWithTax,
                paidAmount: data.paidAmount || 0,
                taxAmount,
                discountAmount: 0,
                status: data.status,
                dueDate: data.dueDate,
                description: data.description,
            });

            const savedFacturation = await this.facturationRepository.save(facturation);
            console.log(`✓ Standalone facturation created: ${invoiceNumber} - ${data.status}`);

            // Create payment if paid
            if (data.paidAmount && data.paidAmount > 0) {
                const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
                const payment = this.paymentRepository.create({
                    transactionId,
                    facturation: savedFacturation,
                    amount: data.paidAmount,
                    paymentMethod: PaymentMethod.BANK_TRANSFER,
                    status: PaymentStatus.COMPLETED,
                    reference: `REF-${transactionId}`,
                    notes: 'Virement bancaire',
                    completedAt: new Date(data.dueDate.getTime() - 2 * 24 * 60 * 60 * 1000),
                });

                await this.paymentRepository.save(payment);
                console.log(`  ✓ Payment created for standalone facturation: ${data.paidAmount} TND`);
            }
        }
    }
}
