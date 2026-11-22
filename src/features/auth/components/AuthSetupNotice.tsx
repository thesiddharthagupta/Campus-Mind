import { Database, KeyRound } from 'lucide-react';

export function AuthSetupNotice() {
  return <section className="auth-setup-notice" aria-labelledby="auth-setup-title">
    <span className="auth-setup-icon"><Database size={20}/></span>
    <strong id="auth-setup-title">Connect your data source first</strong>
    <p>CampusMind uses Supabase to create accounts and load your private study records. No sample account or password is built in.</p>
    <ol>
      <li>Create a Supabase project.</li>
      <li>Copy <code>.env.example</code> to <code>.env.local</code> and add the project URL and public anon key.</li>
      <li>Restart the app, then create your account here.</li>
    </ol>
    <span className="auth-setup-footnote"><KeyRound size={14}/> Use your own email and password after setup. Never add a service-role key to the web app.</span>
  </section>;
}
