import { DebugMode, PugFlavor, PugOptions, PugSessionData } from './types/types'
import { Context, Middleware } from 'grammy'
import { readFolder } from './utils'
import { compileFile, compileTemplate as CompileTemplate, Options, renderFile } from 'pug'
import { join } from 'node:path'

type LocaleFn = PugFlavor['t']

const findKeyMismatches = (
    data: Record<string, Record<string, any>>
): Record<string, string[]> => {
    const result: Record<string, string[]> = {}

    const allKeysSet = new Set<string>()
    const filteredObjects = Object.entries(data)

    filteredObjects.forEach(([_, obj]) => {
        Object.keys(obj).forEach(key => allKeysSet.add(key))
    })

    const allKeys = Array.from(allKeysSet)

    filteredObjects.forEach(([name, obj]) => {
        const objKeys = new Set(Object.keys(obj))
        const missingKeys = allKeys.filter(key => !objKeys.has(key))

        result[name] = missingKeys
    })

    return result
}

const debugTitle = 'grammy-pug`s debug output'

export const pug = <C extends Context & PugFlavor>({
    defaultLocale,
    folder = 'locales',
    debug = 'none',
    globals = {},
    filters = {},
    cache = true,
    showMismatches: rawShowMismatches
}: PugOptions): Middleware<C> => {
    const dirs = readFolder(
        folder,
        {
            types: ['directory']
        }
    )

    const isAllDebug = debug == 'all'
    const isPugDebug = isAllDebug || debug == 'pug'
    const isPluginDebug = isAllDebug || debug == 'plugin'
    const showMismatches = rawShowMismatches ?? isPluginDebug

    const locales: Record<string, Record<string, CompileTemplate>> = {}
    const extension = 'pug'

    const getOptions = (path: string): Options => {
        return {
            basedir: folder,
            filename: path,
            debug: isPugDebug,
            compileDebug: isPugDebug,
            filters
        }
    }

    for (const dir of dirs) {
        if (!cache) break

        const files = readFolder(
            join(folder, dir),
            {
                fileExtensions: [extension],
                recursive: true,
                types: ['file']
            }
        )

        if (!locales[dir]) locales[dir] = {}

        for (const file of files) {
            const path = join(folder, dir, file)
            const name = file.split('.')[0]

            locales[dir][name] = compileFile(
                path,
                getOptions(path)
            )
        }
    }

    if (isPluginDebug) {
        console.log({
            title: debugTitle,
            dirs,
            locales,
            globals,
            mistmatches: showMismatches ?
                findKeyMismatches(locales) :
                undefined
        })
    }
    else if (showMismatches) {
        console.log({
            title: debugTitle,
            mismatches: findKeyMismatches(locales)
        })
    }

    return async (ctx, next) => {
        const rawLang = ctx?.session?.__lang ?? ctx.from?.language_code
        const lang = rawLang && dirs.some(v => rawLang == v) ?
            rawLang :
            defaultLocale

        const getCache: LocaleFn = (key, variables) => {
            const usedKey = join(key)
            const locale = locales[lang]
            const compileFunction = locale[usedKey]

            if (!compileFunction) {
                throw new Error(`File '${usedKey}' in locale '${lang}' not exist!`)
            }

            const locals = {
                ...globals,
                ...variables
            }

            const result = compileFunction(locals)

            if (isPluginDebug) {
                console.log({ key: usedKey, locals, result, lang })
            }
            return result
        }

        const getRuntime: LocaleFn = (key, variables) => {
            const path = join(folder, lang, `${key}.${extension}`)
            return renderFile(
                path,
                {
                    ...getOptions(path),
                    ...globals,
                    ...variables,
                    cache: true
                }
            )
        }

        const get: LocaleFn = (key, variables) => {
            if (cache) {
                return getCache(key, variables)
            }
            else {
                return getRuntime(key, variables)
            }
        }

        ctx.t = get

        next()
    }
}

export { PugFlavor, PugOptions, PugSessionData, DebugMode }