// クライアント側: Markdownエディタ設定・画像処理
import type { SimpleMDEReactProps } from 'react-simplemde-editor'

// 型定義
export type ImageStore = { file: File; tempUrl: string }
type ImageMapRef = { current: Map<string, ImageStore> }

// 画像URL生成
function getImageUrl(file: File) {
  if (!file.type.startsWith('image/')) {
    throw new Error('The provided file is not an image.')
  }
  const maxSizeInMB = 5
  if (file.size > maxSizeInMB * 1024 * 1024) {
    throw new Error(`File size exceeds ${maxSizeInMB}MB.`)
  }
  const mimeToExtension: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/gif': 'gif',
    'image/svg+xml': 'svg',
    'image/webp': 'webp',
  }
  const extension = mimeToExtension[file.type]
  if (!extension) {
    throw new Error('Unsupported file type')
  }
  const objectURL = URL.createObjectURL(file)
  return `${objectURL}#.${extension}`
}

// 画像アップロード関数
function imageUploadFunction(
  file: File,
  onSuccess: (url: string) => void,
  onError: (error: string) => void,
  imageMapRef?: ImageMapRef,
) {
  try {
    const imageUrl = getImageUrl(file)
    if (imageMapRef) {
      imageMapRef.current.set(imageUrl, { file, tempUrl: imageUrl })
    }
    onSuccess(imageUrl)
  } catch (error) {
    if (error instanceof Error) {
      onError('An error occurred during image upload.')
      throw error
    }
    onError('Image upload failed. Please try again.')
  }
}

// エディタクリア
export function clearAction(editor: EasyMDE) {
  editor.value('')
}

// 画像アップロードアクション
export function imageUploadAction(editor: EasyMDE, imageMapRef?: ImageMapRef) {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async event => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (file) {
      try {
        const imageUrl = getImageUrl(file)
        if (imageMapRef) {
          imageMapRef.current.set(imageUrl, { file, tempUrl: imageUrl })
        }
        editor.codemirror.replaceSelection(`![Image](${imageUrl})`)
        const cursor = editor.codemirror.getCursor()
        editor.codemirror.setCursor({
          line: cursor.line,
          ch: cursor.ch + `![Image](${imageUrl})`.length,
        })
        editor.codemirror.focus()
      } catch (error) {
        if (error instanceof Error) {
          throw error
        }
      }
    }
  }
  input.click()
}

// エディタオプション生成
export const createOptions = (
  imageMapRef?: ImageMapRef,
): SimpleMDEReactProps['options'] => ({
  scrollbarStyle: 'native',
  spellChecker: false,
  uploadImage: true,
  imageUploadFunction: (
    file: File,
    onSuccess: (url: string) => void,
    onError: (error: string) => void,
  ) => imageUploadFunction(file, onSuccess, onError, imageMapRef),
  placeholder: 'Type here...',
  toolbar: [
    'bold',
    'italic',
    'heading',
    '|',
    'unordered-list',
    'ordered-list',
    'link',
    'table',
    'horizontal-rule',
    '|',
    'image',
    {
      name: 'image-upload',
      action: (editor: EasyMDE) => {
        imageUploadAction(editor, imageMapRef)
      },
      className: 'fa fa-upload',
      title: 'Upload Image',
    },
    '|',
    {
      name: 'clear',
      action: (editor: EasyMDE) => {
        if (window.confirm('Are you sure you want to clear the content?')) {
          clearAction(editor)
        }
      },
      className: 'fa fa-trash',
      title: 'Clear',
    },
  ],
})
