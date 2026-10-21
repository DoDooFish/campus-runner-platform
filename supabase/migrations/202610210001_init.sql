-- Campus Runner 3.0: persistent schema + row-level security + atomic workflows.
create extension if not exists pgcrypto;
create type public.task_category as enum ('快递','代买','占座','资料','其他');
create type public.task_status as enum ('open','accepted','completed','cancelled');
create type public.app_role as enum ('user','admin');
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null default '校园同学' check(char_length(display_name) between 2 and 30),
 campus text, avatar_url text, credit_score integer not null default 100 check(credit_score between 0 and 100),
 mutual_points integer not null default 0 check(mutual_points>=0), completed_count integer not null default 0 check(completed_count>=0),
 role public.app_role not null default 'user', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.tasks (
 id uuid primary key default gen_random_uuid(), publisher_id uuid not null references public.profiles(id) on delete restrict,
 accepted_by uuid references public.profiles(id) on delete restrict,
 title text not null check(char_length(title) between 4 and 80), description text not null check(char_length(description) between 1 and 1000),
 category public.task_category not null default '其他', pickup_location text not null check(char_length(pickup_location) between 1 and 160),
 destination text not null check(char_length(destination) between 1 and 160), reward numeric(8,2) not null check(reward>0 and reward<=500),
 deadline timestamptz, distance_m integer check(distance_m is null or distance_m>=0), status public.task_status not null default 'open',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), completed_at timestamptz,
 check(accepted_by is null or accepted_by<>publisher_id)
);
create index tasks_status_created_idx on public.tasks(status,created_at desc);
create index tasks_publisher_idx on public.tasks(publisher_id);
create index tasks_runner_idx on public.tasks(accepted_by);
create table public.reviews (
 id uuid primary key default gen_random_uuid(), task_id uuid not null references public.tasks(id) on delete cascade,
 reviewer_id uuid not null references public.profiles(id) on delete cascade, reviewee_id uuid not null references public.profiles(id) on delete cascade,
 rating integer not null check(rating between 1 and 5), comment text check(comment is null or char_length(comment)<=500),
 created_at timestamptz not null default now(), unique(task_id,reviewer_id), check(reviewer_id<>reviewee_id)
);
create index reviews_reviewee_idx on public.reviews(reviewee_id,created_at desc);
create or replace function public.set_updated_at() returns trigger language plpgsql set search_path='' as $$ begin new.updated_at=now(); return new; end; $$;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger tasks_updated_at before update on public.tasks for each row execute function public.set_updated_at();
-- Prevent profile owners from promoting themselves to admin through the public API.
create or replace function public.protect_profile_role() returns trigger language plpgsql set search_path='' as $$
begin if auth.uid() is not null and new.role is distinct from old.role then raise exception 'Role changes require a trusted administrator'; end if; return new; end; $$;
create trigger profile_role_guard before update on public.profiles for each row execute function public.protect_profile_role();
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$
begin insert into public.profiles(id,display_name,campus) values(new.id,coalesce(nullif(new.raw_user_meta_data->>'display_name',''),'校园同学'),nullif(new.raw_user_meta_data->>'campus','')); return new; end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.reviews enable row level security;
create policy "authenticated profiles readable" on public.profiles for select to authenticated using(true);
create policy "users update own profile" on public.profiles for update to authenticated using(auth.uid()=id) with check(auth.uid()=id);
create policy "authenticated tasks readable" on public.tasks for select to authenticated using(true);
create policy "users create own tasks" on public.tasks for insert to authenticated with check(auth.uid()=publisher_id and accepted_by is null and status='open');
-- No direct UPDATE policy on tasks. Status changes must go through locked SECURITY DEFINER RPCs.
create policy "reviews readable by authenticated users" on public.reviews for select to authenticated using(true);
create policy "participants review completed tasks" on public.reviews for insert to authenticated with check(
 auth.uid()=reviewer_id and exists(select 1 from public.tasks t where t.id=task_id and t.status='completed'
 and (t.publisher_id=auth.uid() or t.accepted_by=auth.uid()) and (t.publisher_id=reviewee_id or t.accepted_by=reviewee_id))
);
create or replace function public.accept_task(p_task_id uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare v_uid uuid:=auth.uid(); v_task public.tasks%rowtype;
begin if v_uid is null then raise exception '请先登录后再接单'; end if; select * into v_task from public.tasks where id=p_task_id for update;
if not found then raise exception '任务不存在'; end if; if v_task.status<>'open' then raise exception '任务已被接取或已关闭'; end if;
if v_task.publisher_id=v_uid then raise exception '不能接取自己发布的任务'; end if;
update public.tasks set status='accepted',accepted_by=v_uid where id=p_task_id; return p_task_id; end; $$;
create or replace function public.complete_task(p_task_id uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare v_uid uuid:=auth.uid(); v_task public.tasks%rowtype;
begin if v_uid is null then raise exception '请先登录'; end if; select * into v_task from public.tasks where id=p_task_id for update;
if not found then raise exception '任务不存在'; end if; if v_task.accepted_by is distinct from v_uid then raise exception '只有接单人可以确认完成'; end if;
if v_task.status<>'accepted' then raise exception '当前任务状态不允许完成'; end if;
update public.tasks set status='completed',completed_at=now() where id=p_task_id;
update public.profiles set mutual_points=mutual_points+10,completed_count=completed_count+1 where id=v_uid; return p_task_id; end; $$;
create or replace function public.cancel_task(p_task_id uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare v_uid uuid:=auth.uid(); v_task public.tasks%rowtype;
begin if v_uid is null then raise exception '请先登录'; end if; select * into v_task from public.tasks where id=p_task_id for update;
if not found then raise exception '任务不存在'; end if; if v_task.publisher_id<>v_uid then raise exception '只有发布者可以取消任务'; end if;
if v_task.status not in ('open','accepted') then raise exception '当前任务无法取消'; end if;
update public.tasks set status='cancelled' where id=p_task_id; return p_task_id; end; $$;
create or replace function public.apply_review_credit() returns trigger language plpgsql security definer set search_path='' as $$
begin update public.profiles p set credit_score=greatest(0,least(100,round((p.credit_score*0.8)+(new.rating*20*0.2))::integer)) where p.id=new.reviewee_id; return new; end; $$;
create trigger review_credit_update after insert on public.reviews for each row execute function public.apply_review_credit();
grant usage on schema public to authenticated;
grant select,update on public.profiles to authenticated;
grant select,insert on public.tasks to authenticated;
grant select,insert on public.reviews to authenticated;
grant execute on function public.accept_task(uuid) to authenticated;
grant execute on function public.complete_task(uuid) to authenticated;
grant execute on function public.cancel_task(uuid) to authenticated;
do $$ begin alter publication supabase_realtime add table public.tasks; exception when duplicate_object then null; when undefined_object then raise notice 'Enable Realtime for tasks in Supabase dashboard'; end $$;
