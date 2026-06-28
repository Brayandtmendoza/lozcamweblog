-- ============================================================================
-- ASISTENCIA GPS — FASE 1  (GRUPO LOZCAM S.A.C.)
-- ============================================================================
-- ⚠️  ESTE SCRIPT ES PARA REVISIÓN. NO EJECUTAR TODAVÍA.
--     Se ejecutará por partes, con BEGIN;...COMMIT;, tras verificar que nada
--     exista previamente. Ver instrucciones al final.
--
-- Alcance Fase 1: control de asistencia por GPS del personal de campo.
--   - Columna radio_metros en obras (radio de validación, default 200m).
--   - Tabla asistencias (1 fila por trabajador/obra/día; entrada y salida).
--   - RPC marcar_asistencia (valida radio por Haversine, registra entrada/salida).
--   - RLS de la tabla asistencias.
--
-- NO incluye (Fase 2, después): tablas tareas, horarios, notificaciones.
--
-- Roles que MARCAN asistencia: personal_obra, maestro_obra (personal de campo).
-- Roles que VEN asistencia: gerencia + ingeniero_residente + maestro_obra.
-- Los enum de rol viven en el schema 'constructora'. Tablas en 'public'.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- PARTE 1 — Columna radio_metros en obras
-- ----------------------------------------------------------------------------
-- Radio (en metros) dentro del cual el personal puede marcar asistencia.
-- Default 200. Configurable por obra (obras grandes/chicas).
alter table obras
  add column if not exists radio_metros integer not null default 200;


-- ----------------------------------------------------------------------------
-- PARTE 2 — Tabla asistencias
-- ----------------------------------------------------------------------------
create table if not exists asistencias (
  id              bigint generated always as identity primary key,
  obra_id         bigint not null references obras(id) on delete cascade,
  perfil_id       uuid   not null references profiles(id) on delete cascade,
  fecha           date   not null default current_date,

  -- Entrada
  hora_entrada    timestamptz,
  lat_entrada     double precision,
  lng_entrada     double precision,
  foto_entrada_url text,

  -- Salida
  hora_salida     timestamptz,
  lat_salida      double precision,
  lng_salida      double precision,
  foto_salida_url text,

  created_at      timestamptz not null default now(),

  -- Una sola fila por trabajador, obra y día (evita entradas duplicadas)
  constraint asistencia_unica_por_dia unique (perfil_id, obra_id, fecha)
);

-- Índices para consultas frecuentes (por obra, por trabajador, por fecha)
create index if not exists idx_asistencias_obra   on asistencias(obra_id);
create index if not exists idx_asistencias_perfil on asistencias(perfil_id);
create index if not exists idx_asistencias_fecha  on asistencias(fecha);


-- ----------------------------------------------------------------------------
-- PARTE 3 — Función auxiliar: distancia Haversine (metros) entre dos puntos
-- ----------------------------------------------------------------------------
-- Devuelve la distancia en metros entre (lat1,lng1) y (lat2,lng2).
create or replace function distancia_haversine_metros(
  lat1 double precision, lng1 double precision,
  lat2 double precision, lng2 double precision
) returns double precision
language plpgsql
immutable
as $$
declare
  r constant double precision := 6371000; -- radio de la Tierra en metros
  dlat double precision;
  dlng double precision;
  a    double precision;
begin
  if lat1 is null or lng1 is null or lat2 is null or lng2 is null then
    return null;
  end if;
  dlat := radians(lat2 - lat1);
  dlng := radians(lng2 - lng1);
  a := sin(dlat/2)^2
       + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlng/2)^2;
  return r * 2 * atan2(sqrt(a), sqrt(1 - a));
end;
$$;


-- ----------------------------------------------------------------------------
-- PARTE 4 — RPC marcar_asistencia
-- ----------------------------------------------------------------------------
-- Marca entrada o salida del usuario actual (auth.uid()) en una obra,
-- validando que esté dentro del radio de la obra (Haversine).
--
-- Parámetros:
--   p_obra_id : obra donde marca
--   p_lat, p_lng : ubicación GPS actual del trabajador
--   p_tipo : 'entrada' o 'salida'
--   p_foto_url : URL de foto de evidencia (opcional, puede ser null)
--
-- Devuelve: jsonb con { ok, mensaje, asistencia_id, distancia_metros }
-- SECURITY DEFINER para poder leer obras/profiles y escribir asistencias
-- de forma controlada, validando internamente el rol del que llama.
create or replace function marcar_asistencia(
  p_obra_id bigint,
  p_lat     double precision,
  p_lng     double precision,
  p_tipo    text,
  p_foto_url text default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid        uuid := auth.uid();
  v_rol        constructora.rol_sistema;
  v_activo     boolean;
  v_obra_lat   double precision;
  v_obra_lng   double precision;
  v_radio      integer;
  v_distancia  double precision;
  v_asistencia asistencias%rowtype;
begin
  -- 1. Usuario autenticado
  if v_uid is null then
    return jsonb_build_object('ok', false, 'mensaje', 'No autenticado');
  end if;

  -- 2. Validar tipo
  if p_tipo not in ('entrada', 'salida') then
    return jsonb_build_object('ok', false, 'mensaje', 'Tipo inválido (use entrada o salida)');
  end if;

  -- 3. Obtener rol y estado del usuario; solo personal de campo marca
  select rol, activo into v_rol, v_activo
  from profiles where id = v_uid;

  if v_activo is not true then
    return jsonb_build_object('ok', false, 'mensaje', 'Usuario inactivo');
  end if;

  if v_rol not in ('personal_obra'::constructora.rol_sistema,
                   'maestro_obra'::constructora.rol_sistema) then
    return jsonb_build_object('ok', false, 'mensaje', 'Tu rol no registra asistencia de campo');
  end if;

  -- 4. Obtener coordenadas y radio de la obra
  select latitud, longitud, radio_metros
    into v_obra_lat, v_obra_lng, v_radio
  from obras where id = p_obra_id and activo = true;

  if not found then
    return jsonb_build_object('ok', false, 'mensaje', 'Obra no encontrada');
  end if;

  if v_obra_lat is null or v_obra_lng is null then
    return jsonb_build_object('ok', false, 'mensaje', 'La obra no tiene ubicación GPS configurada');
  end if;

  -- 5. Validar radio (Haversine)
  v_distancia := distancia_haversine_metros(p_lat, p_lng, v_obra_lat, v_obra_lng);

  if v_distancia is null then
    return jsonb_build_object('ok', false, 'mensaje', 'Ubicación inválida');
  end if;

  if v_distancia > v_radio then
    return jsonb_build_object(
      'ok', false,
      'mensaje', 'Estás fuera del rango de la obra (' || round(v_distancia)::text || 'm de ' || v_radio::text || 'm)',
      'distancia_metros', round(v_distancia)
    );
  end if;

  -- 6. Buscar la asistencia de hoy de este usuario en esta obra
  select * into v_asistencia
  from asistencias
  where perfil_id = v_uid and obra_id = p_obra_id and fecha = current_date;

  -- 7a. ENTRADA
  if p_tipo = 'entrada' then
    if found and v_asistencia.hora_entrada is not null then
      return jsonb_build_object('ok', false, 'mensaje', 'Ya marcaste entrada hoy');
    end if;

    insert into asistencias (obra_id, perfil_id, fecha, hora_entrada, lat_entrada, lng_entrada, foto_entrada_url)
    values (p_obra_id, v_uid, current_date, now(), p_lat, p_lng, p_foto_url)
    on conflict (perfil_id, obra_id, fecha)
    do update set hora_entrada = now(), lat_entrada = p_lat, lng_entrada = p_lng, foto_entrada_url = p_foto_url
    returning * into v_asistencia;

    return jsonb_build_object('ok', true, 'mensaje', 'Entrada registrada',
                              'asistencia_id', v_asistencia.id, 'distancia_metros', round(v_distancia));

  -- 7b. SALIDA
  else
    if not found or v_asistencia.hora_entrada is null then
      return jsonb_build_object('ok', false, 'mensaje', 'No has marcado entrada hoy');
    end if;
    if v_asistencia.hora_salida is not null then
      return jsonb_build_object('ok', false, 'mensaje', 'Ya marcaste salida hoy');
    end if;

    update asistencias
      set hora_salida = now(), lat_salida = p_lat, lng_salida = p_lng, foto_salida_url = p_foto_url
    where id = v_asistencia.id
    returning * into v_asistencia;

    return jsonb_build_object('ok', true, 'mensaje', 'Salida registrada',
                              'asistencia_id', v_asistencia.id, 'distancia_metros', round(v_distancia));
  end if;
end;
$$;


-- ----------------------------------------------------------------------------
-- PARTE 5 — RLS de la tabla asistencias
-- ----------------------------------------------------------------------------
alter table asistencias enable row level security;

-- El personal de campo VE sus propias asistencias
create policy "personal_ve_sus_asistencias" on asistencias for select
using (perfil_id = (select auth.uid()));

-- Gerencia + ingeniero + maestro VEN/gestionan las asistencias (supervisión)
create policy "supervision_ve_asistencias" on asistencias for all
using (
  exists (select 1 from profiles p
    where p.id = (select auth.uid()) and p.activo = true
      and p.rol = any (array[
        'gerente_general'::constructora.rol_sistema,
        'subgerente'::constructora.rol_sistema,
        'administrador'::constructora.rol_sistema,
        'ingeniero_residente'::constructora.rol_sistema,
        'maestro_obra'::constructora.rol_sistema]))
);

-- NOTA: el INSERT/UPDATE real de asistencias ocurre vía el RPC marcar_asistencia
-- (security definer), que valida el rol internamente. Estas policies cubren
-- la lectura directa desde la app.


-- ============================================================================
-- INSTRUCCIONES DE EJECUCIÓN SEGURA (cuando se apruebe esta revisión)
-- ============================================================================
-- PASO 0 — Verificar que NADA exista ya (correr ANTES, por separado):
--   select column_name from information_schema.columns
--     where table_name='obras' and column_name='radio_metros';
--   select table_name from information_schema.tables
--     where table_schema='public' and table_name='asistencias';
--   select routine_name from information_schema.routines
--     where routine_name in ('marcar_asistencia','distancia_haversine_metros');
--   -> Si las tres salen VACÍAS, no existe nada y es seguro crear.
--
-- PASO 1 — Ejecutar PARTE 1 (columna) dentro de BEGIN; ... verificar ... COMMIT;
-- PASO 2 — Ejecutar PARTE 2 (tabla + índices) en BEGIN; ... verificar ... COMMIT;
-- PASO 3 — Ejecutar PARTE 3 y 4 (funciones/RPC) en BEGIN; ... verificar ... COMMIT;
-- PASO 4 — Ejecutar PARTE 5 (RLS) en BEGIN; ... verificar ... COMMIT;
-- (Cada parte por separado; si algo falla, ROLLBACK; y revisar.)
-- ============================================================================
