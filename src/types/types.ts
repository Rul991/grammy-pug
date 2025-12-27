import { SessionFlavor } from 'grammy'
import { LocalsObject } from 'pug'

export type PugOptions = {
    folder?: string,
    defaultLocale: string
    isDebug?: boolean,
    globals?: LocalsObject
    filters?: Record<string, (text: string, options: object) => string>
    cache?: boolean
}

export type PugSessionData = {
    __lang?: string
}

export type PugFlavor = SessionFlavor<PugSessionData> & {
    t: (key: string, variables?: LocalsObject) => string,
}