import { toJpeg } from 'html-to-image'
import jsPDF from 'jspdf'
import type { ServerResponseResult } from '@/lib/type'

function createCloneSlides(slideSnap: HTMLElement[]) {
  const slideClones = slideSnap.map(item =>
    item.cloneNode(true),
  ) as HTMLElement[]

  const container = document.createElement('div')
  container.classList.add('reveal-print')
  const revealContainer = document.createElement('div')
  revealContainer.classList.add('reveal', 'center')
  const slideContainer = document.createElement('div')
  slideContainer.classList.add('slides')

  container.appendChild(revealContainer)
  revealContainer.appendChild(slideContainer)

  for (const slide of slideClones) {
    slideContainer.appendChild(slide)
  }

  if (container) {
    // 一時的に document.body に追加
    container.style.position = 'absolute'
    container.style.left = '-9999px'
    container.style.visibility = 'hidden'
    document.body.appendChild(container)
  }

  return { slideClones, container }
}

async function imgProxy(slide: HTMLElement) {
  const images = slide.querySelectorAll('img')

  if (images.length === 0) return { ok: true }

  for (const image of images) {
    const src = image.src

    // ログイン済みユーザーの保存済み画像をdata URLに変換（フルURLとパスの両方をチェック）
    if (src.startsWith('/api/images/') || src.includes('/api/images/')) {
      try {
        const response = await fetch(image.src, {
          credentials: 'same-origin', // 認証情報を含める
        })
        if (!response.ok) {
          console.error(
            `Failed to fetch saved image: ${image.src} (Status: ${response.status})`,
          )
          return { ok: false }
        }

        // 画像をdata URLに変換してsrcを置き換え
        const blob = await response.blob()
        const dataUrl = await new Promise<string>(resolve => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(blob)
        })
        image.src = dataUrl
      } catch (error) {
        console.error(`Error fetching saved image: ${image.src}`, error)
        return { ok: false }
      }
      continue
    }

    // blob や data URL もスキップ
    if (src.startsWith('blob:') || src.startsWith('data:')) {
      continue
    }

    // 外部画像の場合のみプロキシ経由で処理
    try {
      const externalUrl = encodeURIComponent(image.src)
      const proxyUrl = `${externalUrl}&t=${Date.now()}`
      image.src = `/api/image-proxy?url=${proxyUrl}`

      // プロキシ経由での画像取得を確認
      const response = await fetch(image.src)
      if (!response.ok) {
        console.error(`Failed to fetch image: ${image.src}`)
        return { ok: false }
      }
    } catch (error) {
      console.error(`Error processing image: ${image.src}`, error)
      return { ok: false }
    }
  }

  // 全ての画像処理が完了
  return { ok: true }
}

function customListStyle(slide: HTMLElement) {
  const pattern = /[0-9A-Za-z!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/
  const listItems = slide.querySelectorAll('li')
  for (const li of listItems) {
    if (pattern.test(li.textContent ?? '')) {
      li.classList.add('nowrap-comma')
    }
  }
}

export async function pdfDownload(
  slideSnap: HTMLElement[],
): Promise<ServerResponseResult> {
  const { slideClones, container } = createCloneSlides(slideSnap)
  if (slideClones.length === 0)
    return Promise.resolve({
      status: 'error',
      message: 'No slides to download',
    })

  const scale = 3.0
  const formatSize = [
    slideClones[0].offsetWidth * scale,
    slideClones[0].offsetHeight * scale,
  ]

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: formatSize,
  })

  for (const [index, slide] of slideClones.entries()) {
    try {
      const res = await imgProxy(slide)

      if (!res || !res.ok) {
        throw new Error(`Slide No ${index + 1}: Failed to fetch image`)
      }

      customListStyle(slide)
      const data = await toJpeg(slide, {
        quality: 1,
        width: formatSize[0],
        height: formatSize[1],
        canvasWidth: formatSize[0],
        canvasHeight: formatSize[1],
        skipFonts: true,
        style: {
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        },
      })

      // // デバッグ用: JPEG画像を一時保存して確認
      // const link = document.createElement('a')
      // link.href = data
      // link.download = `slide_${index + 1}.jpeg`
      // link.click()
      // // dataURLの詳細をコンソール出力
      // console.log(`Slide ${index + 1} dataURL length:`, data.length)
      // console.log(`Slide ${index + 1} dataURL prefix:`, data.substring(0, 50))

      pdf.addImage(data, 'JPEG', 0, 0, formatSize[0], formatSize[1])
      pdf.addPage()
    } catch (err) {
      return Promise.resolve({
        status: 'error',
        message: err instanceof Error ? err.message : String(err),
      })
    }
  }

  // 処理後に containerClone を削除
  container?.parentNode?.removeChild(container)
  pdf.deletePage(pdf.getNumberOfPages())
  await pdf.save('slide.pdf', { returnPromise: true })

  return Promise.resolve({ status: 'success', message: 'pdf download' })
}
