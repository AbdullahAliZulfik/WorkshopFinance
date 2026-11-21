import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
      <p className="text-5xl font-semibold text-slate-900">404</p>
      <p className="text-slate-600">Halaman yang kamu cari tidak ditemukan.</p>
      <Link
        href="/"
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
      >
        Kembali ke Dashboard
      </Link>
    </div>
  );
}
