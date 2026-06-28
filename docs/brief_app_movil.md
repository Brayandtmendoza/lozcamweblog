# BRIEF TÉCNICO — APP MÓVIL DE ASISTENCIA GPS
## Grupo Lozcam S.A.C. — Sistema de Gestión

Este documento describe TODO lo que el backend ya tiene listo para que la app
móvil de asistencia funcione. El backend (base de datos, validación GPS, seguridad)
ya está construido y probado. La app móvil solo debe conectarse y consumirlo.

---

## 1. CONTEXTO GENERAL

La app móvil sirve para que el **personal de campo** de una constructora marque su
**asistencia (entrada y salida)** validada por GPS: solo puede marcar si está
físicamente dentro de un radio configurable alrededor de la obra.

- La app reutiliza el MISMO backend que el sistema web: **Supabase**
  (PostgreSQL + Auth + RLS). No hay un backend separado.
- Mismo proyecto de Supabase, misma autenticación. Un usuario que existe en el
  sistema web puede loguearse en la app móvil con las mismas credenciales.

---

## 2. CREDENCIALES Y CONEXIÓN A SUPABASE

La app debe usar el SDK oficial de Supabase para Flutter: **`supabase_flutter`**.

```yaml
# pubspec.yaml
dependencies:
  supabase_flutter: ^2.x
  geolocator: ^12.x        # para obtener el GPS del dispositivo
  image_picker: ^1.x       # opcional, para la foto de evidencia
```

Datos de conexión (pedirlos al dueño del proyecto, NO hardcodear en repos públicos):
- **SUPABASE_URL:** `https://dnhagzhimzhijzlozyzs.supabase.co`
- **SUPABASE_ANON_KEY:** (la anon/public key del proyecto — pedirla; es la pública,
  no la service_role).

```dart
await Supabase.initialize(
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,
);
final supabase = Supabase.instance.client;
```

---

## 3. LOGIN (ya funciona, solo consumir)

La autenticación es por **email + contraseña** con Supabase Auth.

```dart
final res = await supabase.auth.signInWithPassword(
  email: email,
  password: password,
);
```

Tras el login, para saber el ROL del usuario (y mostrar/ocultar pantallas), se
consulta la tabla `profiles`:

```dart
final perfil = await supabase
  .from('profiles')
  .select('id, nombre, apellidos, rol, activo')
  .eq('id', supabase.auth.currentUser!.id)
  .single();
```

**Roles que pueden marcar asistencia:** únicamente `personal_obra` y `maestro_obra`.
Si el usuario tiene otro rol, la app debe indicar que no le corresponde marcar
asistencia (de todas formas el backend lo rechaza).

---

## 4. LO QUE YA EXISTE EN EL BACKEND (NO hay que crear nada de esto)

### 4.1 Tabla `obras`
Cada obra tiene ubicación GPS y radio:
- `id` (bigint)
- `nombre` (text)
- `latitud` (numeric) — coordenada de la obra
- `longitud` (numeric) — coordenada de la obra
- `radio_metros` (integer, default 200) — radio permitido para marcar
- `estado`, `activo`, etc.

> Las coordenadas de la obra las define el ingeniero/admin desde el sistema web
> (con un mapa). La app NO define la ubicación de la obra, solo la lee.

### 4.2 Tabla `asistencias`
Una fila por trabajador, obra y día (entrada y salida en la misma fila):
- `id` (bigint)
- `obra_id` (bigint, FK → obras)
- `perfil_id` (uuid, FK → profiles) — el trabajador
- `fecha` (date)
- `hora_entrada` (timestamptz)
- `lat_entrada`, `lng_entrada` (numeric) — dónde marcó entrada
- `foto_entrada_url` (text, opcional)
- `hora_salida` (timestamptz)
- `lat_salida`, `lng_salida` (numeric) — dónde marcó salida
- `foto_salida_url` (text, opcional)

> La app NO inserta directamente en esta tabla. Todo pasa por el RPC (ver 4.3).

### 4.3 RPC `marcar_asistencia` ← ESTO ES LO QUE LA APP LLAMA
Función del backend que valida el GPS y registra la marca. Hace toda la lógica:
valida que el usuario sea personal de campo, lee las coordenadas y el radio de la
obra, calcula la distancia (fórmula Haversine), y si está dentro del radio registra
la entrada o salida. Si está fuera, la rechaza.

**Firma:**
```
marcar_asistencia(
  p_obra_id  bigint,        -- id de la obra
  p_lat      double precision,  -- latitud actual del trabajador (del GPS)
  p_lng      double precision,  -- longitud actual del trabajador (del GPS)
  p_tipo     text,          -- 'entrada' o 'salida'
  p_foto_url text           -- URL de la foto (opcional, puede ir null)
) returns jsonb
```

**Cómo llamarlo desde Flutter:**
```dart
final result = await supabase.rpc('marcar_asistencia', params: {
  'p_obra_id': obraId,
  'p_lat': posicion.latitude,
  'p_lng': posicion.longitude,
  'p_tipo': 'entrada',   // o 'salida'
  'p_foto_url': fotoUrl, // o null
});
```

**Qué devuelve (jsonb):**
```json
// Éxito:
{ "ok": true, "mensaje": "Entrada registrada", "asistencia_id": 12, "distancia_metros": 45 }

// Fuera de rango:
{ "ok": false, "mensaje": "Estás fuera del rango de la obra (350m de 200m)", "distancia_metros": 350 }

// Otros errores posibles (mostrar el "mensaje" al usuario):
{ "ok": false, "mensaje": "Ya marcaste entrada hoy" }
{ "ok": false, "mensaje": "No has marcado entrada hoy" }   // al intentar salida sin entrada
{ "ok": false, "mensaje": "La obra no tiene ubicación GPS configurada" }
{ "ok": false, "mensaje": "Tu rol no registra asistencia de campo" }
```

> La app solo necesita leer `ok` y `mensaje`. Si `ok` es true, mostrar confirmación
> (verde). Si es false, mostrar el `mensaje` tal cual (ya viene en español, listo
> para el usuario).

---

## 5. FLUJO QUE DEBE IMPLEMENTAR LA APP

```
1. Login (email + contraseña) → Supabase Auth
2. Leer perfil → confirmar rol personal_obra o maestro_obra
3. Mostrar la(s) obra(s) donde el trabajador puede marcar
   → consultar obras activas (idealmente las asignadas; ver nota abajo)
4. Pantalla de marcar:
   a. Botón "Marcar entrada" / "Marcar salida"
   b. Al pulsar: pedir permiso de ubicación y obtener GPS actual (geolocator)
   c. (Opcional) tomar foto de evidencia y subirla a Supabase Storage
   d. Llamar a supabase.rpc('marcar_asistencia', {...})
   e. Mostrar el resultado: verde si ok, rojo con el mensaje si no
5. (Opcional) Mostrar el historial de asistencias del trabajador
   → select de asistencias where perfil_id = mi id
```

### Obtener el GPS en Flutter (geolocator):
```dart
LocationPermission permiso = await Geolocator.requestPermission();
Position pos = await Geolocator.getCurrentPosition(
  desiredAccuracy: LocationAccuracy.high,
);
// pos.latitude, pos.longitude
```

> IMPORTANTE: pedir permisos de ubicación en Android (AndroidManifest.xml:
> ACCESS_FINE_LOCATION) e iOS (Info.plist: NSLocationWhenInUseUsageDescription).

---

## 6. FOTO DE EVIDENCIA (opcional)

La foto NO es obligatoria (el GPS ya valida). Si se implementa:
1. Tomar foto con `image_picker`.
2. Subirla a **Supabase Storage** (crear un bucket, ej. "evidencias-asistencia").
3. Obtener la URL pública/firmada.
4. Pasar esa URL como `p_foto_url` al RPC.

Si no se toma foto, pasar `p_foto_url: null`. El sistema funciona igual.

---

## 7. SEGURIDAD (ya está, solo para que lo entienda)

- La app usa la **anon key** (pública), nunca la service_role.
- La tabla `asistencias` tiene RLS: el personal solo ve SUS propias asistencias;
  gerencia/ingeniero/maestro ven todas. Esto ya está aplicado en el backend.
- El RPC `marcar_asistencia` valida internamente el rol y la distancia, así que
  aunque alguien intente llamarlo con datos falsos, el backend lo controla.
- NUNCA poner la service_role key en la app móvil.

---

## 8. LO QUE NO EXISTE TODAVÍA (Fase 2 — futuro)

Estas tablas están planificadas pero NO creadas aún. La app de asistencia NO las
necesita por ahora:
- `tareas` (asignación de tareas a la cuadrilla)
- `horarios` (horarios de trabajo)
- `notificaciones`

Si la app las va a usar en el futuro, coordinar con el equipo del backend ANTES,
porque hay que crearlas con cuidado en la base.

---

## 9. RESUMEN PARA EMPEZAR YA

Lo mínimo para una app funcional de asistencia:
1. Conectar a Supabase (url + anon key).
2. Pantalla de login (signInWithPassword).
3. Pantalla principal: elegir obra + botón entrada/salida.
4. Obtener GPS (geolocator) y llamar a `marcar_asistencia`.
5. Mostrar el mensaje de respuesta.

Todo el cálculo de distancia, validación de radio, control de duplicados y
seguridad YA está en el backend. La app solo captura el GPS y llama al RPC.

---
Documento generado para el desarrollo de la app móvil — Grupo Lozcam S.A.C.
Backend: Supabase (proyecto dnhagzhimzhijzlozyzs). Fase 1 de asistencia completa.
