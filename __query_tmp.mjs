import { createClient } from '@supabase/supabase-js';
const sb = createClient('https://dnhagzhimzhijzlozyzs.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuaGFnemhpbXpoaWp6bG96eXpzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTMxMzc3MywiZXhwIjoyMDk0ODg5NzczfQ.0oJADt4h-Jyp0_YHgd-zT8pKf2wQHgohqs2pYLe96ZY', { auth: { autoRefreshToken: false, persistSession: false } });

async function main() {
  const { data: p } = await sb.from('pagos_clientes').select('*').limit(1);
  if(p && p[0]) {
    console.log('COLUMNAS (keys):', Object.keys(p[0]).join(', '));
    console.log('TIPOS por valor:');
    for(const [k,v] of Object.entries(p[0])) {
      console.log('  ' + k + ': ' + (v===null?'null':typeof v) + ' = ' + JSON.stringify(v));
    }
  }

  const { data: comp, error: ec } = await sb.from('comprobantes_fiscales').select('*').limit(2);
  console.log('comprobantes_fiscales:', ec ? ('ERROR: '+ec.message) : JSON.stringify(comp));

  // Clientes con id para asociar pagos
  const { data: clientes } = await sb.from('clientes').select('id, nombres, apellidos, razon_social, tipo_persona').order('id').limit(20);
  console.log('CLIENTES:', JSON.stringify(clientes, null, 2));
}
main().catch(e => console.error('FATAL:', e.message));
