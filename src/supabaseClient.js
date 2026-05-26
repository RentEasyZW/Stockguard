import { createClient } from '@supabase/supabase-js'
const supabaseUrl = "https://gajykjeeguixknjjnohw.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhanlramVlZ3VpeGtuampub2h3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyNTYyODQsImV4cCI6MjA5NDgzMjI4NH0.a36zSBXGJitvQmAlhPboKr-lxEal0COBByK8mxBehWc"
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
