/**
 * Seed script — inserta los inmuebles mock en la base de datos.
 * Ejecutar: npm run seed
 *
 * Usa inmovillaId = reference (LH-001, LH-002…) como clave de deduplicación.
 * Cuando Inmovilla esté conectado, este script ya no será necesario.
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { mockProperties } from '../src/data/mockProperties';

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log(`Conectando a: ${connectionString.replace(/:([^:@]+)@/, ':****@')}`);
  console.log(`Insertando ${mockProperties.length} propiedades...\n`);

  for (const p of mockProperties) {
    // Borrar imágenes existentes para recrearlas limpias
    const existing = await prisma.property.findUnique({
      where: { inmovillaId: p.reference },
      select: { id: true },
    });
    if (existing) {
      await prisma.propertyImage.deleteMany({ where: { propertyId: existing.id } });
    }

    const property = await prisma.property.upsert({
      where: { inmovillaId: p.reference },
      create: {
        inmovillaId: p.reference,
        reference: p.reference,
        title: p.title,
        description: p.description,
        type: p.type,
        operation: p.operation,
        status: p.status,
        price: p.price,
        pricePerM2: p.pricePerM2 ?? null,
        isFeatured: p.isFeatured,
        isNewDevelopment: p.isNewDevelopment,
        publishedAt: new Date(p.publishedAt),
        features: {
          create: {
            bedrooms: p.features.bedrooms,
            bathrooms: p.features.bathrooms,
            area: p.features.area,
            plotArea: p.features.plotArea ?? null,
            floor: p.features.floor ?? null,
            hasGarage: p.features.hasGarage,
            hasPool: p.features.hasPool,
            hasTerrace: p.features.hasTerrace,
            hasGarden: p.features.hasGarden,
            hasElevator: p.features.hasElevator,
            hasAirConditioning: p.features.hasAirConditioning,
            hasHeating: p.features.hasHeating,
            hasStorageRoom: p.features.hasStorageRoom,
            orientation: p.features.orientation ?? null,
            energyCertificate: p.features.energyCertificate ?? null,
          },
        },
        location: {
          create: {
            address: p.location.address,
            city: p.location.city,
            province: p.location.province,
            postalCode: p.location.postalCode,
            neighborhood: p.location.neighborhood ?? null,
            lat: p.location.lat ?? null,
            lng: p.location.lng ?? null,
          },
        },
      },
      update: {
        reference: p.reference,
        title: p.title,
        description: p.description,
        type: p.type,
        operation: p.operation,
        status: p.status,
        price: p.price,
        pricePerM2: p.pricePerM2 ?? null,
        isFeatured: p.isFeatured,
        isNewDevelopment: p.isNewDevelopment,
        publishedAt: new Date(p.publishedAt),
        features: {
          upsert: {
            create: {
              bedrooms: p.features.bedrooms,
              bathrooms: p.features.bathrooms,
              area: p.features.area,
              plotArea: p.features.plotArea ?? null,
              floor: p.features.floor ?? null,
              hasGarage: p.features.hasGarage,
              hasPool: p.features.hasPool,
              hasTerrace: p.features.hasTerrace,
              hasGarden: p.features.hasGarden,
              hasElevator: p.features.hasElevator,
              hasAirConditioning: p.features.hasAirConditioning,
              hasHeating: p.features.hasHeating,
              hasStorageRoom: p.features.hasStorageRoom,
              orientation: p.features.orientation ?? null,
              energyCertificate: p.features.energyCertificate ?? null,
            },
            update: {
              bedrooms: p.features.bedrooms,
              bathrooms: p.features.bathrooms,
              area: p.features.area,
              plotArea: p.features.plotArea ?? null,
              floor: p.features.floor ?? null,
              hasGarage: p.features.hasGarage,
              hasPool: p.features.hasPool,
              hasTerrace: p.features.hasTerrace,
              hasGarden: p.features.hasGarden,
              hasElevator: p.features.hasElevator,
              hasAirConditioning: p.features.hasAirConditioning,
              hasHeating: p.features.hasHeating,
              hasStorageRoom: p.features.hasStorageRoom,
              orientation: p.features.orientation ?? null,
              energyCertificate: p.features.energyCertificate ?? null,
            },
          },
        },
        location: {
          upsert: {
            create: {
              address: p.location.address,
              city: p.location.city,
              province: p.location.province,
              postalCode: p.location.postalCode,
              neighborhood: p.location.neighborhood ?? null,
              lat: p.location.lat ?? null,
              lng: p.location.lng ?? null,
            },
            update: {
              address: p.location.address,
              city: p.location.city,
              province: p.location.province,
              postalCode: p.location.postalCode,
              neighborhood: p.location.neighborhood ?? null,
              lat: p.location.lat ?? null,
              lng: p.location.lng ?? null,
            },
          },
        },
      },
      select: { id: true },
    });

    // Imágenes
    for (let i = 0; i < p.images.length; i++) {
      const img = p.images[i];
      await prisma.propertyImage.create({
        data: {
          propertyId: property.id,
          url: img.url,
          alt: img.alt,
          isPrimary: img.isPrimary,
          order: i,
        },
      });
    }

    console.log(`  ✓  ${p.reference}  ${p.title}`);
  }

  console.log(`\nSeed completado: ${mockProperties.length} propiedades insertadas/actualizadas.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
