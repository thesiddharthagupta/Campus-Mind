import { createClient } from 'npm:@supabase/supabase-js@2';

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
const BUCKET = 'study-materials';
const allowedHeaders = 'authorization, apikey, x-client-info, content-type, x-supabase-api-version, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version, traceparent, tracestate, baggage';

function getCorsHeaders(requestOrigin: string | null) {
  const allowedOriginSetting = Deno.env.get('ALLOWED_ORIGIN')?.trim();
  let allowOrigin = '*';

  if (allowedOriginSetting && allowedOriginSetting !== '*') {
    const origins = allowedOriginSetting.split(',').map((o) => o.trim().replace(/\/+$/, '').toLowerCase());
    const cleanRequestOrigin = requestOrigin?.trim().replace(/\/+$/, '').toLowerCase();
    if (cleanRequestOrigin && origins.includes(cleanRequestOrigin)) {
      allowOrigin = requestOrigin!;
    } else {
      allowOrigin = origins[0] || '*';
    }
  }

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': allowedHeaders,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

function json(body: Record<string, unknown>, status: number, headers: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

function hasPrefix(bytes: Uint8Array, prefix: number[]) {
  return prefix.every((byte, index) => bytes[index] === byte);
}

function detectFileType(fileName: string, bytes: Uint8Array): { extension: string; contentType: string } | null {
  const extension = fileName.split('.').pop()?.toLowerCase() ?? '';

  if (extension === 'pdf') {
    const header = new TextDecoder().decode(bytes.slice(0, Math.min(1024, bytes.length)));
    if (header.includes('%PDF-')) return { extension, contentType: 'application/pdf' };
  }
  if (extension === 'png' && hasPrefix(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return { extension, contentType: 'image/png' };
  }
  if ((extension === 'jpg' || extension === 'jpeg') && hasPrefix(bytes, [0xff, 0xd8, 0xff])) {
    return { extension, contentType: 'image/jpeg' };
  }
  if (extension === 'doc' && hasPrefix(bytes, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])) {
    return { extension, contentType: 'application/msword' };
  }
  if (extension === 'docx' && hasPrefix(bytes, [0x50, 0x4b, 0x03, 0x04])) {
    return { extension, contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };
  }
  if (extension === 'txt') {
    try {
      const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
      if (!text.includes('\0')) return { extension, contentType: 'text/plain' };
    } catch {
      return null;
    }
  }
  return null;
}

Deno.serve(async (request) => {
  const origin = request.headers.get('origin');
  const headers = getCorsHeaders(origin);

  const allowedOriginSetting = Deno.env.get('ALLOWED_ORIGIN')?.trim();
  if (allowedOriginSetting && allowedOriginSetting !== '*' && origin) {
    const validOrigins = allowedOriginSetting.split(',').map((o) => o.trim().replace(/\/+$/, '').toLowerCase());
    const cleanOrigin = origin.trim().replace(/\/+$/, '').toLowerCase();
    if (!validOrigins.includes(cleanOrigin)) {
      return json({ error: 'This app origin is not allowed.' }, 403, headers);
    }
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }
  if (request.method !== 'POST') {
    return json({ error: 'Use POST to upload a study material.' }, 405, headers);
  }

  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return json({ error: 'Sign in before uploading a study material.' }, 401, headers);
  }

  const contentLength = Number(request.headers.get('content-length'));
  if (Number.isFinite(contentLength) && contentLength > MAX_UPLOAD_BYTES + 1024 * 1024) {
    return json({ error: 'Choose a file smaller than 25 MB.' }, 413, headers);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  let publishableKey: string | null | undefined = Deno.env.get('SUPABASE_ANON_KEY');
  if (!publishableKey) {
    try {
      const keys = JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS') ?? '{}') as Record<string, string>;
      publishableKey = keys.default ?? null;
    } catch {
      publishableKey = null;
    }
  }
  if (!supabaseUrl || !publishableKey) {
    return json({ error: 'Upload service is not configured.' }, 500, headers);
  }

  const supabase = createClient(supabaseUrl, publishableKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const accessToken = authorization.slice('Bearer '.length);
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
    if (userError || !user) {
      return json({ error: 'Your session is invalid. Sign in again and retry.' }, 401, headers);
    }

    const form = await request.formData();
    const file = form.get('file');
    const subjectId = form.get('subjectId');

    if (!(file instanceof File)) {
      return json({ error: 'Choose a file to upload.' }, 400, headers);
    }
    if (typeof subjectId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(subjectId)) {
      return json({ error: 'Choose a valid course for this material.' }, 400, headers);
    }
    if (file.size < 1) {
      return json({ error: 'The selected file is empty.' }, 400, headers);
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return json({ error: 'Choose a file smaller than 25 MB.' }, 413, headers);
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const detected = detectFileType(file.name, bytes);
    if (!detected) {
      return json({ error: 'The file contents do not match a supported PDF, image, or document type.' }, 415, headers);
    }

    const { data: subject, error: subjectError } = await supabase
      .from('subjects')
      .select('id,name')
      .eq('id', subjectId)
      .maybeSingle();

    if (subjectError) return json({ error: subjectError.message }, 400, headers);
    if (!subject) return json({ error: 'That course is not in the academic structure.' }, 400, headers);

    const originalName = file.name.split(/[\\/]/).pop() ?? 'study-resource';
    const title = originalName.replace(/\.[^.]+$/, '').trim().slice(0, 180) || 'Study material';
    const safeName = originalName.normalize('NFKD').replace(/[^\w.-]+/g, '-').replace(/^-+|-+$/g, '').slice(-100) || `study-resource.${detected.extension}`;

    const scannerUrl = Deno.env.get('MALWARE_SCANNER_URL')?.trim();
    const scannerApiKey = Deno.env.get('MALWARE_SCANNER_API_KEY')?.trim();

    const isMock = !scannerUrl ||
      scannerUrl === 'mock' ||
      scannerUrl === 'skip' ||
      scannerUrl.includes('your-scanner.example') ||
      scannerApiKey === 'test-key';

    if (!isMock) {
      if (!scannerUrl || !scannerApiKey) {
        return json({ error: 'Secure uploads are not enabled until a malware scanner is configured.' }, 503, headers);
      }

      let scannerEndpoint: URL;
      try {
        scannerEndpoint = new URL(scannerUrl);
      } catch {
        return json({ error: 'The malware scanner URL is invalid.' }, 500, headers);
      }
      if (scannerEndpoint.protocol !== 'https:') {
        return json({ error: 'The malware scanner must use HTTPS.' }, 500, headers);
      }

      const scanForm = new FormData();
      const freshFile = new File([bytes], safeName, { type: detected.contentType });
      scanForm.set('file', freshFile, safeName);

      const scanController = new AbortController();
      const scanTimeout = setTimeout(() => scanController.abort(), 15000);
      let scanResponse: Response;

      try {
        scanResponse = await fetch(scannerEndpoint, {
          method: 'POST',
          headers: { Authorization: `Bearer ${scannerApiKey}` },
          body: scanForm,
          signal: scanController.signal,
        });
      } catch {
        return json({ error: 'The malware scanner could not be reached. The file was not uploaded.' }, 503, headers);
      } finally {
        clearTimeout(scanTimeout);
      }

      if (!scanResponse.ok) {
        return json({ error: 'The malware scanner did not complete successfully. The file was not uploaded.' }, 503, headers);
      }

      let scanResult: { safe?: unknown };
      try {
        scanResult = await scanResponse.json() as { safe?: unknown };
      } catch {
        return json({ error: 'The malware scanner returned an unreadable result. The file was not uploaded.' }, 502, headers);
      }

      if (scanResult.safe !== true) {
        return json({ error: 'The file did not pass the malware scan and was not uploaded.' }, 422, headers);
      }
    }

    const storagePath = `${user.id}/${crypto.randomUUID()}-${safeName}`;
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(storagePath, bytes, {
      contentType: detected.contentType,
      upsert: false,
    });

    if (uploadError) return json({ error: uploadError.message }, 400, headers);

    const { data: material, error: insertError } = await supabase.from('materials').insert({
      owner_id: user.id,
      subject_id: subject.id,
      title,
      description: '',
      resource_type: 'notes',
      storage_path: storagePath,
      mime_type: detected.contentType,
      byte_size: file.size,
      status: 'pending',
    }).select('id,title,description,resource_type,storage_path,byte_size,created_at').single();

    if (insertError) {
      await supabase.storage.from(BUCKET).remove([storagePath]);
      return json({ error: insertError.message }, 400, headers);
    }

    return json(material, 201, headers);
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : 'Could not upload this material.';
    return json({ error: message }, 400, headers);
  }
});
