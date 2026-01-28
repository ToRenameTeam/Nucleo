export interface Tag {
  id: string
  label: string
  count?: number
}

export interface TagBar {
  tags: Tag[]
  selectedTag?: string
  multiple?: boolean
  activeTags?: string[]
}
