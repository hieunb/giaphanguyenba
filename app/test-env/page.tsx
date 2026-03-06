'use client';

/**
 * Test page to verify environment variables are accessible in client-side
 * Access: http://localhost:3000/test-env
 */

export default function TestEnvPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  return (
    <div className="min-h-screen p-8 bg-stone-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-stone-800">
          🔍 Environment Variables Test
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          {/* Supabase URL */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              NEXT_PUBLIC_SUPABASE_URL
            </label>
            <div className={`p-4 rounded-lg font-mono text-sm ${
              supabaseUrl 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {supabaseUrl || '❌ NOT SET'}
            </div>
            {supabaseUrl && (
              <p className="mt-2 text-xs text-green-600">✅ Variable is accessible</p>
            )}
          </div>

          {/* Supabase Anon Key */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
            </label>
            <div className={`p-4 rounded-lg font-mono text-sm break-all ${
              supabaseKey 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {supabaseKey ? `${supabaseKey.substring(0, 50)}...` : '❌ NOT SET'}
            </div>
            {supabaseKey && (
              <p className="mt-2 text-xs text-green-600">✅ Variable is accessible</p>
            )}
          </div>

          {/* Test Status */}
          <div className={`p-6 rounded-xl ${
            supabaseUrl && supabaseKey
              ? 'bg-green-100 border-2 border-green-300'
              : 'bg-red-100 border-2 border-red-300'
          }`}>
            {supabaseUrl && supabaseKey ? (
              <div>
                <h3 className="text-lg font-bold text-green-800 mb-2">
                  ✅ All Environment Variables Loaded
                </h3>
                <p className="text-green-700">
                  Supabase client can be initialized. File upload should work.
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-bold text-red-800 mb-2">
                  ❌ Missing Environment Variables
                </h3>
                <p className="text-red-700 mb-4">
                  Environment variables are not accessible. Docker may need to be rebuilt with --build-arg.
                </p>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <p className="text-sm font-mono text-red-900">
                    docker compose up -d --build
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Browser Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Browser Context</h3>
            <p className="text-sm text-blue-700">
              This page runs in the browser. NEXT_PUBLIC_ variables must be available at build time
              for Next.js to inject them into the client bundle.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <a
              href="/dashboard/admin/documents"
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
            >
              Go to Documents Upload
            </a>
            <a
              href="/"
              className="px-6 py-3 bg-stone-200 text-stone-700 rounded-xl font-semibold hover:bg-stone-300 transition-colors"
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
