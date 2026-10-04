import { useSession, homeForRole } from '../security/session'
import { API_BASE_URL } from '../security/api'
import { useEffect, useState } from "react";
import QRCode from 'qrcode'
import { useNavigate, Link } from "react-router-dom";
import axios from "../security/api";
import { AxiosError } from "axios";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import Navbar from "./navbar";

type LoginProps = {
  onLoginSuccess: () => void;
};

function Login({ onLoginSuccess }: LoginProps) {
  const navigate = useNavigate();
  const { refresh } = useSession();
  const [loading, setLoading] = useState(false);

  const savedUserName = localStorage.getItem("rememberedUsername") || "";

  const [userName, setUserName] = useState(savedUserName);
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(!!savedUserName);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mfa, setMfa] = useState<'setup' | 'verify' | null>(new URLSearchParams(window.location.search).get('mfa') === 'setup' ? 'setup' : null)
  const [setup, setSetup] = useState<{ secret: string; account: string; uri: string } | null>(null)
  const [qr, setQr] = useState('')
  const [code, setCode] = useState('')
  const [useRecovery, setUseRecovery] = useState(false)
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])
  const [destination, setDestination] = useState('/login')

  useEffect(() => {
    if (mfa !== 'setup') return
    let cancelled = false
    axios.post(`${API_BASE_URL}/api/mfa/setup`).then(async response => {
      const data = response.data
      const image = await QRCode.toDataURL(data.uri)
      if (!cancelled) { setSetup(data); setQr(image) }
    }).catch(() => { if (!cancelled) setError('Setup expired. Select Start again and sign in.') })
    return () => { cancelled = true }
  }, [mfa])

  const finishLogin = async (user: { role: string }) => {
    if (rememberMe) localStorage.setItem('rememberedUsername', userName)
    else localStorage.removeItem('rememberedUsername')
    setPassword(''); setCode(''); setSetup(null); setQr('')
    await refresh(); onLoginSuccess()
    return homeForRole(user.role)
  }

  const verifyMfa = async (event: React.FormEvent) => {
    event.preventDefault(); setLoading(true); setError('')
    try {
      const response = await axios.post(`${API_BASE_URL}/api/mfa/complete`, useRecovery ? { recoveryCode: code.trim() } : { code: code.trim() })
      const path = await finishLogin(response.data.user)
      if (response.data.recoveryCodes.length) { setRecoveryCodes(response.data.recoveryCodes); setDestination(path) }
      else navigate(path)
    } catch (error) { setError((error as AxiosError<{ message: string }>).response?.data.message || 'Verification failed. Please try again.') }
    finally { setLoading(false) }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/login`, {
        userName,
        password,
      });

      if (response.status === 202) {
        setPassword(''); setCode(''); setMfa(response.data.setupRequired ? 'setup' : 'verify')
        return
      }

      if (response.status === 200) {
        localStorage.setItem("username", response.data.userName || "");
        localStorage.setItem("firstname", response.data.firstName || "");
        localStorage.setItem("lastname", response.data.lastName || "");
        localStorage.setItem("fullname", response.data.fullName || "");
        localStorage.setItem("email", response.data.email || "");
        localStorage.setItem("role", response.data.role || "");
        localStorage.setItem("village", response.data.village || "");
        localStorage.setItem("profileImageUrl", response.data.profileImageUrl || "");

        if (rememberMe) {
          localStorage.setItem("rememberedUsername", userName);
        } else {
          localStorage.removeItem("rememberedUsername");
        }

        await refresh();
        onLoginSuccess();

        navigate(homeForRole(response.data.role));
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;

      if (axiosError.response?.data?.message) {
        setError(axiosError.response.data.message);
      } else if (axiosError.message) {
        setError(axiosError.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally { setLoading(false); }
  };

  return (
    <>
      <Navbar userType="public" />

      <main className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-4">
            <div className="p-4 border rounded-4 shadow-sm bg-white">
              <h3 className="fw-semi-bold text-center text-primary mb-4">
                Welcome to SAMCT Portal
              </h3>

              <h2 className="h3 text-center fst-italic mb-4">Login</h2>

              {recoveryCodes.length > 0 ? <section aria-labelledby="recovery-title">
                <h2 id="recovery-title" className="h4">Save your recovery codes</h2>
                <p>Store these codes in your password manager or another safe place. Each code works once if you lose access to your authenticator. They will not be shown again.</p>
                <pre className="small bg-light p-3" data-testid="recovery-codes">{recoveryCodes.join('\n')}</pre>
                <button className="btn btn-primary" onClick={() => { setRecoveryCodes([]); navigate(destination) }}>I have saved my recovery codes</button>
              </section> : mfa ? <form onSubmit={verifyMfa}>
                <h2 className="h4">{mfa === 'setup' ? 'Set up two-factor authentication' : 'Two-factor authentication'}</h2>
                {mfa === 'setup' && <>
                  <p>Staff accounts need an authenticator app. Add a new account by scanning this QR code, or enter the setup key manually.</p>
                  {qr && <img src={qr} alt="Scan this QR code with your authenticator app" width={220} height={220} />}
                  {setup && <><p>Account: {setup.account}</p><label htmlFor="setup-key">Setup key</label><input id="setup-key" className="form-control mb-3" value={setup.secret} readOnly /></>}
                </>}
                <label htmlFor="verification-code" className="form-label">{useRecovery ? 'Recovery code' : 'Authenticator code'}</label>
                <input id="verification-code" className="form-control mb-3" autoComplete="one-time-code" inputMode={useRecovery ? 'text' : 'numeric'} required maxLength={useRecovery ? 39 : 6} pattern={useRecovery ? '[a-fA-F0-9-]{32,39}' : '[0-9]{6}'} value={code} onChange={event => setCode(event.target.value)} />
                {error && <div role="alert" className="alert alert-danger">{error}</div>}
                <button className="btn btn-primary w-100" disabled={loading || (mfa === 'setup' && !setup)}>Verify and sign in</button>
                {mfa === 'verify' && <button type="button" className="btn btn-link" onClick={() => { setUseRecovery(!useRecovery); setCode('') }}>{useRecovery ? 'Use an authenticator code' : 'Use a recovery code'}</button>}
                <button type="button" className="btn btn-link" onClick={() => { setMfa(null); setSetup(null); setQr(''); setCode(''); setError('') }}>Start again</button>
              </form> : <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label className="form-label fw-semibold" htmlFor="username">
                    <FaUser className="me-2" />
                    Username
                  </label>
                  <input
                    id="username"
                    name="username" required maxLength={50}
                    type="text"
                    className="form-control"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    autoComplete="username"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold" htmlFor="password">
                    <FaLock className="me-2" />
                    Password
                  </label>

                  <div className="input-group">
                    <input
                    id="password"
                    name="password" required maxLength={72}
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {error && <div role="alert" className="alert alert-danger">{error}</div>}

                <div className="form-check mb-3">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="rememberMe">
                    Remember my username
                  </label>
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary w-100">
                  Login
                </button>

                <div className="text-center mt-3">
                  <Link
                    to="/forgot-password"
                    className="text-decoration-none small"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </form>}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default Login;
