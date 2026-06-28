-- ============================================================================
-- POLÍTICAS RLS (Row Level Security) — GRUPO LOZCAM S.A.C.
-- ============================================================================
-- Respaldo / documentación de las políticas de seguridad por rol del sistema.
-- Proyecto Supabase: dnhagzhimzhijzlozyzs (schema public).
--
-- Los tipos enum (rol_sistema, estado_*) viven en el schema 'constructora'.
-- Las tablas viven en el schema 'public'.
--
-- CRITERIO DE DISEÑO:
--   - FINANCIERAS (pagos, presupuestos, comprobantes, costos, partidas):
--       solo gerencia + contador. El cliente ve SOLO lo suyo donde aplica.
--   - OPERATIVAS (reportes, incidencias, materiales, avances, fases):
--       gerencia + roles de obra (sin contador ni vendedor).
--       El cliente ve SOLO el avance/fases de SU obra.
--   - TRANSVERSALES (clientes, solicitudes, obras, asignaciones, documentos):
--       acceso amplio de staff autenticado (pendiente de afinar en 2da ronda).
--
-- USO: este archivo recrea las políticas. Para aplicarlo en una base limpia,
--      primero asegúrate de que las tablas y el schema 'constructora' existan.
--      Cada bloque activa RLS en la tabla y (re)crea sus políticas.
--
-- NOTA: para re-aplicar sobre una base que YA tiene políticas, descomenta los
--       'drop policy if exists' correspondientes antes de cada 'create policy'.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- ACTIVAR RLS EN TODAS LAS TABLAS
-- ----------------------------------------------------------------------------
alter table asignaciones        enable row level security;
alter table avance_obra         enable row level security;
alter table citas               enable row level security;
alter table clientes            enable row level security;
alter table comprobantes        enable row level security;
alter table costos_reales       enable row level security;
alter table documentos          enable row level security;
alter table fases_obra          enable row level security;
alter table incidencias         enable row level security;
alter table materiales_usados   enable row level security;
alter table obras               enable row level security;
alter table pagos_clientes      enable row level security;
alter table partidas            enable row level security;
alter table presupuestos        enable row level security;
alter table profiles            enable row level security;
alter table reportes_diarios    enable row level security;
alter table solicitudes         enable row level security;
alter table versiones_documento enable row level security;


-- ============================================================================
-- ASIGNACIONES  (transversal — pendiente de afinar)
-- ============================================================================
create policy "auth_asignaciones" on asignaciones for all
using ((auth.uid() IS NOT NULL));


-- ============================================================================
-- AVANCE_OBRA  (operativa — gerencia + roles de obra; cliente ve su avance)
-- ============================================================================
create policy "cliente_lee_sus_avances" on avance_obra for select
using ((EXISTS ( SELECT 1
   FROM (obras o
     JOIN profiles p ON ((p.id = ( SELECT auth.uid() AS uid))))
  WHERE ((o.id = avance_obra.obra_id) AND (p.activo = true) AND (p.rol = 'cliente'::constructora.rol_sistema) AND (p.cliente_id = o.cliente_id)))));

create policy "obra_gestiona_avance" on avance_obra for all
using ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = ( SELECT auth.uid() AS uid)) AND (p.activo = true) AND (p.rol = ANY (ARRAY['gerente_general'::constructora.rol_sistema, 'subgerente'::constructora.rol_sistema, 'administrador'::constructora.rol_sistema, 'ingeniero_residente'::constructora.rol_sistema, 'arquitecto'::constructora.rol_sistema, 'tecnico_autocad'::constructora.rol_sistema, 'topografo'::constructora.rol_sistema, 'maestro_obra'::constructora.rol_sistema, 'personal_obra'::constructora.rol_sistema]))))));

create policy "personal_registra_avance" on avance_obra for insert
with check ((auth.uid() IS NOT NULL));


-- ============================================================================
-- CITAS  (transversal — staff)
-- ============================================================================
create policy "staff_gestiona_citas" on citas for all
using ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = ( SELECT auth.uid() AS uid)) AND (p.activo = true) AND (p.rol = ANY (ARRAY['gerente_general'::constructora.rol_sistema, 'subgerente'::constructora.rol_sistema, 'administrador'::constructora.rol_sistema, 'ingeniero_residente'::constructora.rol_sistema, 'arquitecto'::constructora.rol_sistema, 'tecnico_autocad'::constructora.rol_sistema, 'topografo'::constructora.rol_sistema, 'maestro_obra'::constructora.rol_sistema, 'personal_obra'::constructora.rol_sistema, 'contador'::constructora.rol_sistema, 'vendedor'::constructora.rol_sistema]))))));


-- ============================================================================
-- CLIENTES  (transversal — pendiente de afinar)
-- ============================================================================
create policy "autenticados_ven_clientes" on clientes for select
using ((auth.uid() IS NOT NULL));

create policy "auth_clientes" on clientes for all
using ((auth.uid() IS NOT NULL));

create policy "gerencia_gestiona_clientes" on clientes for all
using ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.rol = ANY (ARRAY['gerente_general'::constructora.rol_sistema, 'subgerente'::constructora.rol_sistema, 'administrador'::constructora.rol_sistema, 'vendedor'::constructora.rol_sistema]))))));


-- ============================================================================
-- COMPROBANTES  (financiera — gerencia + contador; cliente ve los suyos)
-- ============================================================================
create policy "cliente_lee_sus_comprobantes" on comprobantes for select
using ((EXISTS ( SELECT 1
   FROM (obras o
     JOIN profiles p ON ((p.id = ( SELECT auth.uid() AS uid))))
  WHERE ((o.id = comprobantes.obra_id) AND (p.activo = true) AND (p.rol = 'cliente'::constructora.rol_sistema) AND (p.cliente_id = o.cliente_id)))));

create policy "gerencia_contador_gestiona_comprobantes" on comprobantes for all
using ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = ( SELECT auth.uid() AS uid)) AND (p.activo = true) AND (p.rol = ANY (ARRAY['gerente_general'::constructora.rol_sistema, 'subgerente'::constructora.rol_sistema, 'administrador'::constructora.rol_sistema, 'contador'::constructora.rol_sistema]))))));


-- ============================================================================
-- COSTOS_REALES  (financiera — gerencia + contador)
-- ============================================================================
create policy "gerencia_contador_gestiona_costos" on costos_reales for all
using ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = ( SELECT auth.uid() AS uid)) AND (p.activo = true) AND (p.rol = ANY (ARRAY['gerente_general'::constructora.rol_sistema, 'subgerente'::constructora.rol_sistema, 'administrador'::constructora.rol_sistema, 'contador'::constructora.rol_sistema]))))));


-- ============================================================================
-- DOCUMENTOS  (transversal — pendiente de afinar: planos vs vouchers)
-- ============================================================================
create policy "auth_documentos" on documentos for all
using ((auth.uid() IS NOT NULL));


-- ============================================================================
-- FASES_OBRA  (operativa — gerencia + roles de obra; cliente ve sus fases)
-- ============================================================================
create policy "cliente_lee_sus_fases" on fases_obra for select
using ((EXISTS ( SELECT 1
   FROM (obras o
     JOIN profiles p ON ((p.id = ( SELECT auth.uid() AS uid))))
  WHERE ((o.id = fases_obra.obra_id) AND (p.activo = true) AND (p.rol = 'cliente'::constructora.rol_sistema) AND (p.cliente_id = o.cliente_id)))));

create policy "obra_gestiona_fases_nueva" on fases_obra for all
using ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = ( SELECT auth.uid() AS uid)) AND (p.activo = true) AND (p.rol = ANY (ARRAY['gerente_general'::constructora.rol_sistema, 'subgerente'::constructora.rol_sistema, 'administrador'::constructora.rol_sistema, 'ingeniero_residente'::constructora.rol_sistema, 'arquitecto'::constructora.rol_sistema, 'tecnico_autocad'::constructora.rol_sistema, 'topografo'::constructora.rol_sistema, 'maestro_obra'::constructora.rol_sistema, 'personal_obra'::constructora.rol_sistema]))))));


-- ============================================================================
-- INCIDENCIAS  (operativa — gerencia + roles de obra)
-- ============================================================================
create policy "obra_gestiona_incidencias" on incidencias for all
using ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = ( SELECT auth.uid() AS uid)) AND (p.activo = true) AND (p.rol = ANY (ARRAY['gerente_general'::constructora.rol_sistema, 'subgerente'::constructora.rol_sistema, 'administrador'::constructora.rol_sistema, 'ingeniero_residente'::constructora.rol_sistema, 'arquitecto'::constructora.rol_sistema, 'tecnico_autocad'::constructora.rol_sistema, 'topografo'::constructora.rol_sistema, 'maestro_obra'::constructora.rol_sistema, 'personal_obra'::constructora.rol_sistema]))))));


-- ============================================================================
-- MATERIALES_USADOS  (operativa — gerencia + roles de obra)
-- ============================================================================
create policy "obra_gestiona_materiales" on materiales_usados for all
using ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = ( SELECT auth.uid() AS uid)) AND (p.activo = true) AND (p.rol = ANY (ARRAY['gerente_general'::constructora.rol_sistema, 'subgerente'::constructora.rol_sistema, 'administrador'::constructora.rol_sistema, 'ingeniero_residente'::constructora.rol_sistema, 'arquitecto'::constructora.rol_sistema, 'tecnico_autocad'::constructora.rol_sistema, 'topografo'::constructora.rol_sistema, 'maestro_obra'::constructora.rol_sistema, 'personal_obra'::constructora.rol_sistema]))))));


-- ============================================================================
-- OBRAS  (transversal — staff; gerencia gestiona; cliente ve sus obras)
-- ============================================================================
create policy "cliente_lee_sus_obras" on obras for select
using ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = ( SELECT auth.uid() AS uid)) AND (p.activo = true) AND (p.rol = 'cliente'::constructora.rol_sistema) AND (p.cliente_id = obras.cliente_id)))));

create policy "gerencia_gestiona_obras" on obras for all
using ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.rol = ANY (ARRAY['gerente_general'::constructora.rol_sistema, 'subgerente'::constructora.rol_sistema, 'administrador'::constructora.rol_sistema]))))));

create policy "staff_gestiona_obras" on obras for all
using ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = ( SELECT auth.uid() AS uid)) AND (p.activo = true) AND (p.rol = ANY (ARRAY['gerente_general'::constructora.rol_sistema, 'subgerente'::constructora.rol_sistema, 'administrador'::constructora.rol_sistema, 'ingeniero_residente'::constructora.rol_sistema, 'arquitecto'::constructora.rol_sistema, 'tecnico_autocad'::constructora.rol_sistema, 'topografo'::constructora.rol_sistema, 'maestro_obra'::constructora.rol_sistema, 'personal_obra'::constructora.rol_sistema, 'contador'::constructora.rol_sistema, 'vendedor'::constructora.rol_sistema]))))));


-- ============================================================================
-- PAGOS_CLIENTES  (financiera — gerencia + contador; cliente ve los suyos)
-- ============================================================================
create policy "cliente_lee_sus_pagos" on pagos_clientes for select
using ((EXISTS ( SELECT 1
   FROM (obras o
     JOIN profiles p ON ((p.id = ( SELECT auth.uid() AS uid))))
  WHERE ((o.id = pagos_clientes.obra_id) AND (p.activo = true) AND (p.rol = 'cliente'::constructora.rol_sistema) AND (p.cliente_id = o.cliente_id)))));

create policy "gerencia_contador_gestiona_pagos" on pagos_clientes for all
using ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = ( SELECT auth.uid() AS uid)) AND (p.activo = true) AND (p.rol = ANY (ARRAY['gerente_general'::constructora.rol_sistema, 'subgerente'::constructora.rol_sistema, 'administrador'::constructora.rol_sistema, 'contador'::constructora.rol_sistema]))))));


-- ============================================================================
-- PARTIDAS  (financiera — gerencia + contador)
-- ============================================================================
create policy "gerencia_contador_gestiona_partidas" on partidas for all
using ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = ( SELECT auth.uid() AS uid)) AND (p.activo = true) AND (p.rol = ANY (ARRAY['gerente_general'::constructora.rol_sistema, 'subgerente'::constructora.rol_sistema, 'administrador'::constructora.rol_sistema, 'contador'::constructora.rol_sistema]))))));


-- ============================================================================
-- PRESUPUESTOS  (financiera — gerencia + contador; cliente NO ve)
-- ============================================================================
create policy "gerencia_contador_gestiona_presupuestos" on presupuestos for all
using ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = ( SELECT auth.uid() AS uid)) AND (p.activo = true) AND (p.rol = ANY (ARRAY['gerente_general'::constructora.rol_sistema, 'subgerente'::constructora.rol_sistema, 'administrador'::constructora.rol_sistema, 'contador'::constructora.rol_sistema]))))));


-- ============================================================================
-- PROFILES  (cada uno ve/edita su perfil; gerencia ve/edita staff)
-- ============================================================================
create policy "ve_su_perfil" on profiles for select
using ((id = auth.uid()));

create policy "edita_su_perfil" on profiles for update
using ((id = auth.uid())) with check ((id = auth.uid()));

create policy "gerencia_ve_todos_perfiles" on profiles for select
using (es_gerencia());

create policy "gerencia_edita_staff" on profiles for update
using (es_gerencia()) with check (es_gerencia());


-- ============================================================================
-- REPORTES_DIARIOS  (operativa — gerencia + roles de obra)
-- ============================================================================
create policy "obra_gestiona_reportes" on reportes_diarios for all
using ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = ( SELECT auth.uid() AS uid)) AND (p.activo = true) AND (p.rol = ANY (ARRAY['gerente_general'::constructora.rol_sistema, 'subgerente'::constructora.rol_sistema, 'administrador'::constructora.rol_sistema, 'ingeniero_residente'::constructora.rol_sistema, 'arquitecto'::constructora.rol_sistema, 'tecnico_autocad'::constructora.rol_sistema, 'topografo'::constructora.rol_sistema, 'maestro_obra'::constructora.rol_sistema, 'personal_obra'::constructora.rol_sistema]))))));


-- ============================================================================
-- SOLICITUDES  (transversal — staff; cliente crea/lee las suyas)
-- ============================================================================
create policy "cliente_crea_sus_solicitudes" on solicitudes for insert
with check ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = ( SELECT auth.uid() AS uid)) AND (p.activo = true) AND (p.rol = 'cliente'::constructora.rol_sistema) AND (p.cliente_id = solicitudes.cliente_id)))));

create policy "cliente_lee_sus_solicitudes" on solicitudes for select
using ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = ( SELECT auth.uid() AS uid)) AND (p.activo = true) AND (p.rol = 'cliente'::constructora.rol_sistema) AND (p.cliente_id = solicitudes.cliente_id)))));

create policy "staff_gestiona_solicitudes" on solicitudes for all
using ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = ( SELECT auth.uid() AS uid)) AND (p.activo = true) AND (p.rol = ANY (ARRAY['gerente_general'::constructora.rol_sistema, 'subgerente'::constructora.rol_sistema, 'administrador'::constructora.rol_sistema, 'ingeniero_residente'::constructora.rol_sistema, 'arquitecto'::constructora.rol_sistema, 'tecnico_autocad'::constructora.rol_sistema, 'topografo'::constructora.rol_sistema, 'maestro_obra'::constructora.rol_sistema, 'personal_obra'::constructora.rol_sistema, 'contador'::constructora.rol_sistema, 'vendedor'::constructora.rol_sistema]))))));


-- ============================================================================
-- VERSIONES_DOCUMENTO  (transversal — pendiente de afinar)
-- ============================================================================
create policy "auth_versiones" on versiones_documento for all
using ((auth.uid() IS NOT NULL));


-- ============================================================================
-- FIN DEL RESPALDO
-- Total: 18 tablas con RLS, 30 políticas.
-- Última actualización: junio 2026 (1ra ronda: financieras + operativas).
-- Pendiente 2da ronda: afinar transversales (asignaciones, documentos,
--   versiones_documento, clientes, solicitudes).
-- ============================================================================
