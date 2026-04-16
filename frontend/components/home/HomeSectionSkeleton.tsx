type HomeSectionSkeletonProps = {
  mode?: 'news' | 'notice';
};

export default function HomeSectionSkeleton({ mode = 'news' }: HomeSectionSkeletonProps) {
  if (mode === 'notice') {
    // NoticeList：双列卡片骨架
    return (
      <div className="animate-pulse grid grid-cols-2 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="relative overflow-hidden rounded-lg bg-gray-50 shadow-sm">
            <div className="p-6 flex items-center gap-4">
              {/* 日期块 */}
              <div className="flex-shrink-0 text-center">
                <div className="w-14 h-12 bg-gray-200 rounded mx-auto" />
                <div className="w-16 h-4 bg-gray-100 rounded mt-2 mx-auto" />
              </div>

              {/* 标题/摘要 */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="h-5 bg-gray-200 rounded w-4/5" />
                <div className="h-4 bg-gray-100 rounded w-full" />
              </div>

              {/* 箭头占位 */}
              <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded" />
            </div>

            {/* 底部线占位 */}
            <div className="h-[2px] bg-gray-100" />
          </div>
        ))}
      </div>
    );
  }

  // NewsList：左侧大图 + 右侧列表骨架
  return (
    <div className="animate-pulse flex gap-8 items-stretch">
      {/* 左侧轮播主卡片占位 */}
      <div className="w-1/3 flex-shrink-0">
        <div className="h-full flex flex-col rounded overflow-hidden">
          <div className="relative w-full aspect-[3/2] bg-gray-200" />
          <div className="bg-gray-100 p-4 flex-1">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-100 rounded w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 右侧列表占位 */}
      <div className="flex-1 flex flex-col justify-between gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="flex items-stretch">
              <div className="w-20 flex-shrink-0 bg-gray-200" />
              <div className="flex-1 p-4">
                <div className="space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-100 rounded w-full" />
                </div>
              </div>
            </div>
            <div className="h-0.5 bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
