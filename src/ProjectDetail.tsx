import { useQueryData } from 'unframer'
// Projekte-CMS-Collection aus dem Framer-Export
// @ts-ignore – wird von scripts/patch-export.mjs erzeugt
import projectsCollection from './projectsCollection.js'
import PageDetailProjects from './framer/page-detailprojects'
import Page404 from './framer/page-404'

// CMS-Feld-ID  ->  Prop-ID der Seiten-Komponente "Page Detailprojects"
const FIELD_TO_PROP: Record<string, string> = {
  ONn0zlPgJ: 'Xd90xFQaR', // Title
  uozpq3MDw: 'FWe5jPcdK', // Slug
  c0rPdO_UJ: 'c3LUGqSio', // Live Link
  zbsangOOd: 'oC0YqlFVS', // Überblick
  mAA8L2P_R: 'SpBpHBw7H', // Kunde
  RYctnzFT_: 'sYQNTVHgN', // Umsetzungsjahr
  ExEtB85fg: 'ZJG05bK6m', // Dauer
  m2YCFztZl: 'n2Eut0o0h', // Standort
  WSCRrGZxD: 'YikUe4G6j', // Vorgehensweise
  dx4Gy0YIv: 'ZkMFLxdhm', // Tools
  hsVoR36CF: 'hBbpp0_cq', // Deliverable 1
  UwQG_nkan: 'SkOS32fu_', // Deliverable 2
  p5xSNEKWA: 'eqrhAYhMC', // Deliverable 3
  gW3urS7YF: 'f_knqVH1l', // Deliverable 4
  A0XQb6YdN: 'i52pbTIjZ', // Deliverable 5
  RijtUNDzK: 'M42FNTccY', // Deliverable 6
  ARKusNjt5: 'dlELwX1xs', // Image 2
  wXkx5CIWl: 'kNkhMpqe2', // Image 3
  dk52wsp0N: 'TTsZOLCba', // Image 4
  LDBIkdXON: 'OmjdC__Z8', // Testimonial verfügbar
  FZoXSmC4i: 'b1tGvx5Cl', // Testimonial
  zbWBoHbpK: 'Q9ESZ88fc', // Author Image
  v44qyC6v9: 'hCASWeezn', // Author Name
  l0A5wa9q7: 'PdckUYGRp', // Author Role
  UDVcubJmu: 'JSNQlXpVn', // Bild 4 anzeigen (Ja/Nein)
}
const GALLERY_FIELD = 'd1wHAfkJu'

const ALIAS = 'projects'
const query = {
  from: { alias: ALIAS, data: projectsCollection, type: 'Collection' },
  select: [...Object.keys(FIELD_TO_PROP), GALLERY_FIELD, 'id'].map((name) => ({
    collection: ALIAS,
    name,
    type: 'Identifier',
  })),
}

export default function ProjectDetail({ slug }: { slug: string }) {
  const items = useQueryData(query as any) as any[]
  const item = items?.find((i) => i.uozpq3MDw === slug)
  if (!item) return <Page404.Responsive style={{ width: '100%' }} />

  const props: Record<string, unknown> = {}
  for (const [field, prop] of Object.entries(FIELD_TO_PROP)) {
    if (item[field] !== undefined && item[field] !== null) props[prop] = item[field]
  }
  if (Array.isArray(item[GALLERY_FIELD])) {
    props.WhwNLBBsn = item[GALLERY_FIELD].map((g: any) => ({ RDQqmWoSh: g.KYe8jeY39 }))
  }
  // key erzwingt frischen Zustand beim Wechsel zwischen Projekten
  return <PageDetailProjects.Responsive key={slug} style={{ width: '100%' }} {...(props as any)} />
}
