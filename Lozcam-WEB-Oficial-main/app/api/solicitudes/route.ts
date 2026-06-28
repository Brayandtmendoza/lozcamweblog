import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body = await request.json()
    console.log('API RECIBIO:', body)

    const { data, error } = await supabase.from('solicitudes').insert(body).select().single()

    if (error) {
      console.error('ERROR DB:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (err: any) {
    console.error('ERROR API:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

