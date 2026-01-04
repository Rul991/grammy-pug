import { SessionFlavor } from 'grammy'
import { LocalsObject } from 'pug'

export type DebugMode = 'none' | 'pug' | 'plugin' | 'all'

export type PugOptions = {
    folder?: string,
    defaultLocale: string
    debug?: DebugMode,
    globals?: LocalsObject
    filters?: Record<string, (text: string, options: object) => string>
    cache?: boolean
    showMismatches?: boolean
}

export type PugSessionData = {
    __lang?: string
}

export type PugFlavor = SessionFlavor<PugSessionData> & {
    t: (key: string, variables?: LocalsObject) => string,
}