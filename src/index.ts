import { Context, Middleware } from 'grammy'
import { PugFlavor, PugOptions } from './types/types'
import { readFolder } from './utils'
import { compileFile, compileTemplate as CompileTemplate, Options, renderFile } from 'pug'
import { basename, join } from 'node:path'

type LocaleFn = PugFlavor['t']

export const pug = <C extends Context & PugFlavor>({
    defaultLocale,
    folder = 'locales',
    isDebug = false,
    globals = {},
    filters = {},
    cache = true
}: PugOptions): Middleware<C> => {
    const dirs = readFolder(
        folder,
        {
            types: ['directory']
        }
    )

    const locales: Record<string, Record<string, CompileTemplate>> = {}
    const ext = 'pug'

    const getOptions = (path: string): Options => {
        return {
            basedir: folder,
            filename: path,
            debug: isDebug,
            compileDebug: isDebug,
            filters
        }
    }

    for (const dir of dirs) {
        if (!cache) break

        const files = readFolder(
            join(folder, dir),
            {
                types: ['file'],
                fileExtensions: [ext]
            }
        )

        if (!locales[dir]) locales[dir] = {}

        for (const file of files) {
            const path = join(folder, dir, file)
            const name = basename(
                path,
                `.${ext}`
            )

            locales[dir][name] = compileFile(
                path,
                getOptions(path)
            )
        }
    }

    if (isDebug) {
        console.log({
            dirs,
            locales
        })
    }

    return async (ctx, next) => {
        const rawLang = ctx?.session?.__lang ?? ctx.from?.language_code
        const lang = rawLang && dirs.some(v => rawLang == v) ?
            rawLang :
            defaultLocale

        const getCache: LocaleFn = (key, variables) => {
            const locale = locales[lang]
            const compileFunction = locale[key]

            if (!compileFunction) {
                throw new Error(`File '${key}' in locale '${lang}' not exist!`)
            }

            const locals = {
                ...globals,
                ...variables
            }

            const result = compileFunction(locals)

            if (isDebug) {
                console.log({ locals, result, lang })
            }
            return result
        }

        const getRuntime: LocaleFn = (key, variables) => {
            const path = join(folder, lang, `${key}.${ext}`)
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