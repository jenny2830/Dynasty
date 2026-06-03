import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import type { Json } from '@/types/database.types'

export const dynamic = 'force-dynamic'

function getAnthropic() {
  return new Anthropic()
}

const requestSchema = z.object({
  imageBase64: z.string().min(1),
  mediaType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  propertyId: z.string().uuid().optional(),
})

export async function POST(request: NextRequest) {
  // Verify authentication
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Parse and validate request body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { imageBase64, mediaType, propertyId } = parsed.data

  // Call Claude — image is processed here and NEVER stored
  const anthropic = getAnthropic()
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: imageBase64,
            },
          },
          {
            type: 'text',
            text: `Extract data from this receipt and return ONLY a valid JSON object with no markdown, no preamble. Fields:
{
  "vendor_name": string or null,
  "amount": number or null,
  "receipt_date": "YYYY-MM-DD" or null,
  "category": one of [Maintenance, Taxes, Water, Garbage pickup, Cleaning, Management fee, Accounting, Insurance, Condo fee, Strata fee, Repairs, Utilities, Landscaping, Legal fees, Advertising, Other expense] or null,
  "description": string (one sentence summary) or null,
  "confidence": number between 0 and 1
}`,
          },
        ],
      },
    ],
  })

  const textContent = response.content.find((c) => c.type === 'text')
  if (!textContent || textContent.type !== 'text') {
    return NextResponse.json({ error: 'No response from AI' }, { status: 500 })
  }

  let extracted: {
    vendor_name: string | null
    amount: number | null
    receipt_date: string | null
    category: string | null
    description: string | null
    confidence: number
  }

  try {
    extracted = JSON.parse(textContent.text)
  } catch {
    return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
  }

  // Get landlord ID
  const { data: landlord } = await supabase
    .from('landlords')
    .select('id')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (!landlord) {
    return NextResponse.json({ error: 'Landlord profile not found' }, { status: 404 })
  }

  // Save extracted data to receipts table (image is NOT stored — only extracted data)
  const { data: receipt, error: insertError } = await supabase
    .from('receipts')
    .insert({
      landlord_id: landlord.id,
      property_id: propertyId ?? null,
      vendor_name: extracted.vendor_name,
      amount: extracted.amount,
      receipt_date: extracted.receipt_date,
      category: extracted.category,
      description: extracted.description,
      ai_raw_json: extracted as unknown as Json,
      ai_confidence: extracted.confidence,
      status: 'pending',
    })
    .select()
    .single()

  if (insertError) {
    return NextResponse.json({ error: 'Failed to save receipt data' }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    data: extracted,
    receiptId: receipt.id,
  })
}
