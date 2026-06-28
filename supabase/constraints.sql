-- ============================================================================
-- CONSTRAINTS DE VALIDACIÓN (CHECK) — GRUPO LOZCAM S.A.C.
-- ============================================================================
-- Validación de integridad de datos a nivel de base de datos.
-- Estos constraints rechazan datos inválidos sin importar el origen de la
-- petición (formulario web, app móvil, API, SQL directo). Es validación de
-- servidor real, complementaria a la RLS (que controla ACCESO por rol).
--
-- Proyecto Supabase: dnhagzhimzhijzlozyzs (schema public).
-- Total: 15 constraints CHECK en 5 tablas.
--
-- NOTA: si se re-aplican sobre una base que ya los tiene, dará error
--       "constraint already exists" (inofensivo). Para re-aplicar limpio,
--       hacer DROP CONSTRAINT IF EXISTS antes de cada ADD.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- OBRAS (6 constraints)
-- ----------------------------------------------------------------------------
-- Monto de contrato no negativo
alter table obras add constraint chk_obras_monto_no_negativo
  check (monto_contrato >= 0);

-- Área en m2 no negativa (opcional, permite null)
alter table obras add constraint chk_obras_area_no_negativa
  check (area_m2 is null or area_m2 >= 0);

-- Pisos mínimo 1 (opcional, permite null)
alter table obras add constraint chk_obras_pisos_positivo
  check (pisos is null or pisos >= 1);

-- Radio de asistencia entre 50m y 5000m (evita radios absurdos)
alter table obras add constraint chk_obras_radio_valido
  check (radio_metros between 50 and 5000);

-- Latitud GPS dentro del rango físico (-90 a 90)
alter table obras add constraint chk_obras_lat_valida
  check (latitud is null or latitud between -90 and 90);

-- Longitud GPS dentro del rango físico (-180 a 180)
alter table obras add constraint chk_obras_lng_valida
  check (longitud is null or longitud between -180 and 180);


-- ----------------------------------------------------------------------------
-- PAGOS_CLIENTES (1 constraint)
-- ----------------------------------------------------------------------------
-- El monto de un pago debe ser positivo (no 0 ni negativo)
alter table pagos_clientes add constraint chk_pagos_monto_positivo
  check (monto > 0);


-- ----------------------------------------------------------------------------
-- PRESUPUESTOS (2 constraints)
-- ----------------------------------------------------------------------------
-- Total no negativo
alter table presupuestos add constraint chk_presup_total_no_neg
  check (total >= 0);

-- Componentes del presupuesto no negativos
alter table presupuestos add constraint chk_presup_componentes_no_neg
  check (total_directo >= 0 and gastos_generales >= 0 and utilidad >= 0 and igv >= 0);


-- ----------------------------------------------------------------------------
-- AVANCE_OBRA (1 constraint)
-- ----------------------------------------------------------------------------
-- Porcentaje de avance entre 0 y 100 (alimenta dashboards y cálculos)
alter table avance_obra add constraint chk_avance_porcentaje_valido
  check (porcentaje >= 0 and porcentaje <= 100);


-- ----------------------------------------------------------------------------
-- ASISTENCIAS (5 constraints)
-- ----------------------------------------------------------------------------
-- Coordenadas GPS válidas (entrada)
alter table asistencias add constraint chk_asist_lat_entrada
  check (lat_entrada is null or lat_entrada between -90 and 90);
alter table asistencias add constraint chk_asist_lng_entrada
  check (lng_entrada is null or lng_entrada between -180 and 180);

-- Coordenadas GPS válidas (salida)
alter table asistencias add constraint chk_asist_lat_salida
  check (lat_salida is null or lat_salida between -90 and 90);
alter table asistencias add constraint chk_asist_lng_salida
  check (lng_salida is null or lng_salida between -180 and 180);

-- La hora de salida no puede ser anterior a la de entrada
alter table asistencias add constraint chk_asist_salida_despues_entrada
  check (hora_salida is null or hora_entrada is null or hora_salida >= hora_entrada);


-- ============================================================================
-- VERIFICACIÓN (consulta de control, no modifica nada)
-- ============================================================================
-- select conrelid::regclass as tabla, conname
-- from pg_constraint
-- where contype = 'c' and conname like 'chk_%'
-- order by tabla, conname;
-- -> debe devolver 15 filas.
-- ============================================================================
