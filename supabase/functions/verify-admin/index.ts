// Edge Function: verify-admin
// Securely verifies admin password and returns a signed JWT session
// The password is stored as an environment variable, never exposed to client

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const ADMIN_PASSWORD = Deno.env.get('ADMIN_PASSWORD') ?? 'vcg2024admin'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { password, displayName } = await req.json()

    // Verify password
    if (password !== ADMIN_PASSWORD) {
      return new Response(
        JSON.stringify({ error: 'Mật khẩu không đúng' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create a Supabase admin client
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Generate a unique email for this moderator session
    const sessionId = crypto.randomUUID()
    const email = `mod_${sessionId}@vcg.local`
    const tempPassword = crypto.randomUUID()

    // Create or get user for this moderator session
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        display_name: displayName || 'Moderator',
        is_moderator: true
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Không thể tạo phiên đăng nhập' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Add user to moderators table
    const { error: modError } = await supabaseAdmin
      .from('moderators')
      .upsert({
        user_id: authData.user.id,
        display_name: displayName || 'Moderator'
      }, {
        onConflict: 'user_id'
      })

    if (modError) {
      console.error('Moderator insert error:', modError)
    }

    // Sign in as the new user to get a session token
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email,
    })

    // Create a session directly
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password: tempPassword
    })

    if (sessionError) {
      console.error('Session error:', sessionError)
      return new Response(
        JSON.stringify({ error: 'Không thể tạo phiên đăng nhập' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        session: sessionData.session,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          display_name: displayName || 'Moderator'
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Có lỗi xảy ra' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
