import { NextResponse } from 'next/server';
import { runImport } from '@/lib/importer';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let csvText = body.csvText;

    if (!csvText) {
      // If no text provided, try to read the file locally (for the assignment ease)
      const filePath = path.join(process.cwd(), 'expenses_export.csv');
      if (fs.existsSync(filePath)) {
        csvText = fs.readFileSync(filePath, 'utf-8');
      } else {
        return NextResponse.json({ error: "No CSV content provided and local file not found." }, { status: 400 });
      }
    }

    const logs = await runImport(csvText);
    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    console.error("Import Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
