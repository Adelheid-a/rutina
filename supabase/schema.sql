-- Rutina: sincronización del registro con Supabase.
-- La app sigue guardando todo en el teléfono; esto es la copia en la nube.

-- un registro por día, tal como lo guarda la app: { ejercicio: [{ w, r, done }], _cardio: bool, _extra: bool }
create table if not exists public.dias (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  fecha date not null,
  log jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, fecha)
);

-- ajustes de la app: fecha de inicio y semana de descarga
create table if not exists public.ajustes (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  start date not null,
  deload boolean not null default false,
  updated_at timestamptz not null default now()
);

-- cada quien solo ve y escribe lo suyo
alter table public.dias enable row level security;
alter table public.ajustes enable row level security;

drop policy if exists "dias propios" on public.dias;
create policy "dias propios" on public.dias for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "ajustes propios" on public.ajustes;
create policy "ajustes propios" on public.ajustes for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.dias, public.ajustes to authenticated;
grant all on public.dias, public.ajustes to service_role;
revoke all on public.dias, public.ajustes from anon;

-- una fila por serie, para consultar progreso
create or replace view public.series with (security_invoker = true) as
select
  d.user_id,
  d.fecha,
  e.key as ejercicio,
  s.ord - 1 as serie,
  nullif(s.v ->> 'w', '')::numeric as peso,
  nullif(s.v ->> 'r', '')::numeric as reps,
  coalesce((s.v ->> 'done')::boolean, false) as hecha
from public.dias d
cross join lateral jsonb_each(d.log) e
cross join lateral jsonb_array_elements(
  case when jsonb_typeof(e.value) = 'array' then e.value else '[]'::jsonb end
) with ordinality s(v, ord)
where jsonb_typeof(s.v) = 'object';

grant select on public.series to authenticated, service_role;
revoke all on public.series from anon;
