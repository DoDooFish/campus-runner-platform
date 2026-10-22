-- Additive migration: preserve existing tasks and all original schema/history.
begin;
create or replace function public.validate_task_deadline()
returns trigger language plpgsql set search_path = '' as $$
begin
 if TG_OP = 'UPDATE' then
  -- Completion/cancellation of an old task must remain possible.
  if new.deadline is not distinct from old.deadline then return new; end if;
 end if;
 if new.deadline is not null and (not isfinite(new.deadline) or new.deadline < clock_timestamp()) then
  raise exception '期望完成时间不能早于当前时间' using errcode = '22007';
 end if;
 return new;
end;
$$;
drop trigger if exists task_deadline_guard on public.tasks;
create trigger task_deadline_guard before insert or update of deadline on public.tasks
for each row execute function public.validate_task_deadline();
commit;
