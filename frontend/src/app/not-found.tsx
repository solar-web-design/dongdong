import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-100 mb-4">404</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">페이지를 찾을 수 없습니다</p>
      <Link href="/feed" className="btn-primary px-6 py-2">
        홈으로 돌아가기
      </Link>
    </div>
  );
}
