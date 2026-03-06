'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">오류 발생</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">{error.message || '알 수 없는 오류가 발생했습니다'}</p>
      <button onClick={reset} className="btn-primary px-6 py-2">
        다시 시도
      </button>
    </div>
  );
}
