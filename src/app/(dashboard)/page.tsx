import DisplayAllSlide from '@/feature/display-all-slide'

export default function DashboardPage() {
  return (
    <>
      <DisplayAllSlide />
      <div className='terms-of-service mx-auto mt-8 max-w-2xl rounded-lg bg-gray-50 px-5 py-6 text-sm leading-6 text-gray-700'>
        <h2 className='font-bold text-base mb-4 tracking-tight text-gray-900'>
          利用規約
        </h2>
        <ul className='pl-0 mb-4 list-none'>
          <li className='mb-2'>
            本サービスは、マークダウン記法によるスライド作成・保存・PDF出力等を提供します。
            <br />
            ユーザーは、法令・公序良俗に反しない範囲でご利用ください。
          </li>
          <li className='mb-2'>
            <span className='font-semibold'>禁止事項</span>
            <ul className='mt-1 ml-5 list-disc'>
              <li>著作権等第三者の権利を侵害する行為</li>
              <li>不正アクセスやサービス運営を妨害する行為</li>
              <li>公序良俗に反する内容の投稿</li>
            </ul>
          </li>
          <li className='mb-2'>
            <span className='font-semibold'>免責事項</span>
            <ul className='mt-1 ml-5 list-disc'>
              <li>サービス内容は予告なく変更・終了する場合があります。</li>
              <li>データ消失・損害等について運営者は一切責任を負いません。</li>
            </ul>
          </li>
          <li className='mb-2'>
            <span className='font-semibold'>
              プライバシーポリシー・データ取り扱い
            </span>
            <ul className='mt-1 ml-5 list-disc'>
              <li>Googleアカウント等による認証情報は安全に管理されます。</li>
              <li>保存されたスライドデータは本人のみ閲覧・編集可能です。</li>
              <li>個人情報・スライド内容は第三者に提供しません。</li>
              <li>アクセス解析等の目的でCookie等を利用する場合があります。</li>
            </ul>
          </li>
          <li>
            <span className='font-semibold'>同意手順</span>
            <ul className='mt-1 ml-5 list-disc'>
              <li>
                本サービスの利用開始時点で、利用規約・プライバシーポリシーに同意したものとみなします。
              </li>
              <li>同意いただけない場合はご利用をお控えください。</li>
            </ul>
          </li>
        </ul>
        <div className='text-xs text-gray-500'>
          詳細は開発者までお問い合わせください。
        </div>
      </div>
    </>
  )
}
