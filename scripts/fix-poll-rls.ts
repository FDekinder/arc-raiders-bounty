import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://jixqdgldndtbbcqzenxl.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppeHFkZ2xkbmR0YmJjcXplbnhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5NzU1NzgsImV4cCI6MjA4MDU1MTU3OH0.XUSyBaztNPmCK_v6ZhEg1lAkCU-DbHdVO9cFMYNhBcw'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixRLS() {
  console.log('Fixing RLS policies for role_poll_votes...')

  try {
    // Drop old policies
    console.log('Dropping old policies...')

    const dropQueries = [
      'DROP POLICY IF EXISTS "Users can insert their own vote" ON public.role_poll_votes',
      'DROP POLICY IF EXISTS "Users can update their own vote" ON public.role_poll_votes',
    ]

    for (const query of dropQueries) {
      const { error } = await supabase.rpc('exec_sql', { sql: query })
      if (error) {
        console.log(`Note: ${error.message}`)
      }
    }

    // Create new policies
    console.log('Creating new policies...')

    const createQueries = [
      `CREATE POLICY "Anyone can insert votes" ON public.role_poll_votes FOR INSERT TO public WITH CHECK (true)`,
      `CREATE POLICY "Anyone can update votes" ON public.role_poll_votes FOR UPDATE TO public USING (true) WITH CHECK (true)`,
    ]

    for (const query of createQueries) {
      const { error } = await supabase.rpc('exec_sql', { sql: query })
      if (error) {
        console.error(`Error: ${error.message}`)
      }
    }

    console.log('✅ RLS policies updated successfully!')
  } catch (error) {
    console.error('Error:', error)
  }
}

fixRLS()
