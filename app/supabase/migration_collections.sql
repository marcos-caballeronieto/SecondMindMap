-- ============================================================
-- SecondMindMap - Collections & Tagging System Migration
-- ============================================================

-- ── Collections table ─────────────────────────────────────────────────────
create table if not exists collections (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  name        varchar(100) not null,
  description text default '',
  color       varchar(30) default '#8f3a2b',
  icon        varchar(50) default 'Folder',
  created_at  timestamptz default now()
);

-- ── Place Collections pivot table (Many-to-Many) ──────────────────────────
create table if not exists place_collections (
  place_id      uuid references places(id) on delete cascade not null,
  collection_id uuid references collections(id) on delete cascade not null,
  created_at    timestamptz default now(),
  primary key (place_id, collection_id)
);

-- ── Row Level Security ────────────────────────────────────────────────────
alter table collections enable row level security;
alter table place_collections enable row level security;

-- Collections policies
create policy "Users can view their own collections"
  on collections for select
  using (auth.uid() = user_id);

create policy "Users can insert their own collections"
  on collections for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own collections"
  on collections for update
  using (auth.uid() = user_id);

create policy "Users can delete their own collections"
  on collections for delete
  using (auth.uid() = user_id);

-- Place Collections policies (scoped through user's collections & places)
create policy "Users can view their own place_collections"
  on place_collections for select
  using (
    exists (
      select 1 from collections c
      where c.id = place_collections.collection_id
        and c.user_id = auth.uid()
    )
  );

create policy "Users can insert their own place_collections"
  on place_collections for insert
  with check (
    exists (
      select 1 from collections c
      where c.id = place_collections.collection_id
        and c.user_id = auth.uid()
    )
  );

create policy "Users can delete their own place_collections"
  on place_collections for delete
  using (
    exists (
      select 1 from collections c
      where c.id = place_collections.collection_id
        and c.user_id = auth.uid()
    )
  );

-- ── Indexes ───────────────────────────────────────────────────────────────
create index if not exists collections_user_id_idx on collections(user_id);
create index if not exists place_collections_place_id_idx on place_collections(place_id);
create index if not exists place_collections_collection_id_idx on place_collections(collection_id);

