-- TravelTactik: lead_documents (PDFs / deliverables)
-- Run once in Neon.

create table if not exists lead_documents (
  id uuid primary key default gen_random_uuid(),

  lead_id uuid not null references leads(id) on delete cascade,

  -- "tarifs" | "descriptif" | "carnet"
  doc_type text not null check (doc_type in ('tarifs','descriptif','carnet')),

  -- pending = pas encore prêt ; ready = disponible (url)
  status text not null default 'pending' check (status in ('pending','ready')),

  -- URL du fichier (plus tard: blob / s3 / signed url pattern)
  url text null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- 1 doc par type et par lead (évite les doublons)
  constraint lead_documents_unique_per_type unique (lead_id, doc_type)
);

create index if not exists lead_documents_lead_id_idx
  on lead_documents (lead_id);

create index if not exists lead_documents_status_idx
  on lead_documents (status);

create index if not exists lead_documents_created_at_idx
  on lead_documents (created_at desc);

-- Create pending docs for already-paid leads (idempotent)
insert into lead_documents (lead_id, doc_type, status)
select l.id, t.doc_type, 'pending'
from leads l
cross join (values ('tarifs'), ('descriptif'), ('carnet')) as t(doc_type)
where l.payment_status = 'paid'
on conflict (lead_id, doc_type) do nothing;
