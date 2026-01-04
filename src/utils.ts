import { readdirSync } from 'fs'
import { ReadFolderOptions } from './types/utils'
import { join } from 'path'

export const readFolder = (path: string, options?: ReadFolderOptions): string[] => {
    const {
        types = ['directory', 'file'],
        fileExtensions,
        recursive = false,
        prefix = ''
    } = options ?? {}

    try {
        const files = readdirSync(
            path,
            {
                withFileTypes: true,
                encoding: 'utf-8'
            }
        )
        const result: string[] = []

        for (const file of files) {
            const fullFilename = join(prefix, file.name)
            let isFiltered = false

            for (const type of types) {
                if ((recursive || type == 'directory') && file.isDirectory()) {
                    if (recursive) {
                        result.push(...readFolder(
                            join(path, file.name),
                            {
                                ...options,
                                prefix: fullFilename
                            }
                        ))
                    }
                    else isFiltered = true
                }
                else if (type == 'file' && file.isFile()) {
                    isFiltered = fileExtensions?.some(
                        v => file.name.endsWith(`.${v}`)
                    ) ?? true
                }
            }

            if (isFiltered) {
                result.push(fullFilename)
            }
        }

        return result

    }
    catch (e) {
        console.error(e)
        return []
    }
}