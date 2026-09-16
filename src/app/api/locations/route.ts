import { NextResponse } from 'next/server';
import { getAllLocations } from '@/lib/propertyService';

export async function GET() {
  try {
    const locations = await getAllLocations();
    return NextResponse.json({ locations });
  } catch (err) {
    console.error('[API Locations Error]', err);
    return NextResponse.json({ locations: [] }, { status: 500 });
  }
}
