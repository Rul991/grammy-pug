export type ReadFolderFileTypes = 'file' | 'directory'

export type ReadFolderOptions = {
    types?: ReadFolderFileTypes[]
    fileExtensions?: string[]
}