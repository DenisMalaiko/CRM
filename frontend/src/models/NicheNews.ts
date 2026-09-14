import { TBaseModel } from "./BaseModel"

export type TNicheNews = TBaseModel & {
  title: string
  summary: string
  url: string
  source: string
  industry: string
  publishedAt: string
}
