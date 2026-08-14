import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // Validar variables de entorno críticas
    const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const stripeSecret = process.env.STRIPE_SECRET_KEY

    if (!stripeSecret) {
      throw new Error("STRIPE_SECRET_KEY no está definida en las variables de entorno.")
    }

    const stripe = new Stripe(stripeSecret, {
      apiVersion: '2023-10-16' as Stripe.LatestApiVersion,
    })

    const body = await request.json()
    const { nombreAutor, email, telefono, institucion, tituloArticulo, resumen, pdfUrl } = body

    if (!nombreAutor || !email || !telefono || !institucion || !tituloArticulo || !resumen || !pdfUrl) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Insertar en la tabla articulos_investigacion con estatus_pago = 'pendiente'
    // Tipado dinámico para tabla personalizada
    const typedSupabase = supabase as unknown as {
      from: (table: string) => {
        insert: (data: Record<string, unknown>) => {
          select: () => {
            single: () => Promise<{ data: { id: string } | null; error: Error | null }>
          }
        }
        update: (data: Record<string, unknown>) => {
          eq: (column: string, value: unknown) => Promise<{ error: Error | null }>
        }
      }
    }

    const { data: articulo, error: insertError } = await typedSupabase
      .from('articulos_investigacion')
      .insert({
        nombre_autor: nombreAutor,
        email,
        telefono,
        institucion,
        titulo_articulo: tituloArticulo,
        resumen,
        pdf_url: pdfUrl,
        estatus_pago: 'pendiente',
      })
      .select()
      .single()

    if (insertError || !articulo) {
      console.error('Error insertando artículo:', insertError)
      return NextResponse.json(
        { error: 'Error al registrar el artículo' },
        { status: 500 }
      )
    }

    // Crear sesión de Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'mxn',
            product_data: {
              name: 'Publicación de Artículo de Investigación',
              description: tituloArticulo,
            },
            unit_amount: 60000, // $600.00 MXN
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/investigacion?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/investigacion?status=cancelled`,
      metadata: {
        articulo_id: articulo.id,
        nombre_autor: nombreAutor,
        email: email,
      },
    })

    // Actualizar el artículo con el session_id de Stripe
    const { error: updateError } = await typedSupabase
      .from('articulos_investigacion')
      .update({ stripe_session_id: session.id })
      .eq('id', articulo.id)

    if (updateError) {
      console.error('Error actualizando artículo con session_id:', updateError)
    }

    return NextResponse.json({ url: session.url })
  } catch (error: unknown) {
    console.error("❌ ERROR DETALLADO EN CHECKOUT API:", error)
    const errorMessage = error instanceof Error ? error.message : "Error interno del servidor"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
