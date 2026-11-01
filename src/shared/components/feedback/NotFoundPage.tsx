import { Link } from 'react-router-dom';
export function NotFoundPage() { return <main className="not-found"><span className="eyebrow">404 · PAGE NOT FOUND</span><h1>This page wandered off.</h1><p>Let’s get you back to your study space.</p><Link className="button button-primary" to="/">Go to dashboard</Link></main>; }
