import { useMsal } from '@azure/msal-react'
import { loginRequest } from '../auth/msalConfig'

export function LoginPage() {
  const { instance } = useMsal()

  function handleLogin() {
    instance.loginRedirect(loginRequest)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-sm text-center">
        <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">T</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">TaskmAIster</h1>
        <p className="text-sm text-gray-400 mb-8">Sign in with your Addvery account</p>

        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 bg-[#0078d4] hover:bg-[#106ebe] text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
            <path fill="#f3f3f3" d="M0 0h11v11H0z"/>
            <path fill="#f35325" d="M12 0h11v11H12z"/>
            <path fill="#05a6f0" d="M0 12h11v11H0z"/>
            <path fill="#ffba08" d="M12 12h11v11H12z"/>
          </svg>
          Sign in with Microsoft
        </button>

        <p className="text-xs text-gray-300 mt-6">Access restricted to Addvery members</p>
      </div>
    </div>
  )
}
