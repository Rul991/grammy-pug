import { readdirSync } from 'fs'
import { ReadFolderOptions } from './types/utils'

export const readFolder = (path: string, options?: ReadFolderOptions): string[] => {
    const {
        types = ['directory', 'file'],
        fileExtensions,
    } = options ?? {}

    try {
        const files = readdirSync(
            path, 
            {
                withFileTypes: true,
                encoding: 'utf-8'
            }
        )

        return files
            .filter(file => {
                let isFiltered = false

                for (const type of types) {
                    if(type == 'directory' && file.isDirectory()) isFiltered = true
                    else if(type == 'file' && file.isFile()) isFiltered = true

                    if(!isFiltered) return false
                }

                isFiltered = fileExtensions?.some(
                    v => file.name.endsWith(`.${v}`)
                ) ?? true

                return isFiltered
            })
            .map(v => v.name)

    }
    catch(e) {
        console.error(e)
        return []
    }
}