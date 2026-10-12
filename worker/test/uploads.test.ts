import { env } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';
import { ADMIN, call, seedBooking } from './helpers';

const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46, 0, 1, 2, 3]);
const PDF = new TextEncoder().encode('%PDF-1.4\n%fake\n');
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);

function form(
  files: Array<[Uint8Array, string, string]>,
  consent: string | null = 'true'
): FormData {
  const fd = new FormData();
  if (consent !== null) fd.append('healthDataConsent', consent);
  for (const [bytes, name, type] of files) fd.append('files', new File([bytes], name, { type }));
  return fd;
}

const upload = (id: string, fd: FormData, ip?: string) =>
  call(`/api/booking/${id}/files`, { method: 'POST', body: fd, ip });

async function objects(prefix: string) {
  return (await env.UPLOADS.list({ prefix })).objects;
}

describe('POST /api/booking/:id/files', () => {
  it('stores files in R2 under bookings/<id>/<uuid>.<ext> and records metadata', async () => {
    const id = await seedBooking();
    const res = await upload(
      id,
      form([
        [JPEG, 'xray.jpeg', 'image/jpeg'],
        [PDF, 'report.pdf', 'application/pdf'],
      ])
    );
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({
      success: true,
      message: '2 file(s) uploaded successfully',
      files: [
        { name: 'xray.jpeg', size: JPEG.length },
        { name: 'report.pdf', size: PDF.length },
      ],
    });
    const objs = await objects(`bookings/${id}/`);
    expect(objs).toHaveLength(2);
    for (const o of objs)
      expect(o.key).toMatch(new RegExp(`^bookings/${id}/[0-9a-f-]{36}\\.(jpg|pdf)$`));
    // No personal data in object metadata.
    for (const o of objs) expect((await env.UPLOADS.head(o.key))!.customMetadata ?? {}).toEqual({});
    const rows = await env.DB.prepare(
      'SELECT * FROM booking_files WHERE booking_id = ? ORDER BY id'
    )
      .bind(id)
      .all<Record<string, unknown>>();
    expect(rows.results).toHaveLength(2);
    expect(rows.results[0]).toMatchObject({
      original_name: 'xray.jpeg',
      mime_type: 'image/jpeg',
      health_data_consent: 1,
    });
    expect(objs.map(o => o.key)).toContain(rows.results[0].storage_path);
    const days = (new Date(String(rows.results[0].expires_at)).getTime() - Date.now()) / 86_400_000;
    expect(Math.round(days)).toBe(90);
  });

  it('rejects a file whose bytes do not match its declared type, storing nothing', async () => {
    const id = await seedBooking();
    const res = await upload(id, form([[PNG, 'fake.jpg', 'image/jpeg']]));
    expect(res.status).toBe(400);
    expect(((await res.json()) as { error: string }).error).toMatch(/does not match/);
    expect(await objects(`bookings/${id}/`)).toHaveLength(0);
  });

  it('rejects a disallowed MIME type with the Fastify message', async () => {
    const id = await seedBooking();
    const res = await upload(id, form([[new TextEncoder().encode('hi'), 'a.txt', 'text/plain']]));
    expect(res.status).toBe(400);
    expect(((await res.json()) as { error: string }).error).toBe(
      'File type not allowed: text/plain. Accepted: JPG, PNG, WebP, PDF'
    );
  });

  it('requires health-data consent and stores nothing without it', async () => {
    const id = await seedBooking();
    const res = await upload(id, form([[JPEG, 'x.jpg', 'image/jpeg']], 'false'));
    expect(res.status).toBe(400);
    expect(((await res.json()) as { error: string }).error).toBe(
      'Health data consent is required for uploading dental X-rays or photos'
    );
    expect(await objects(`bookings/${id}/`)).toHaveLength(0);
    const n = await env.DB.prepare('SELECT COUNT(*) AS n FROM booking_files WHERE booking_id = ?')
      .bind(id)
      .first<{ n: number }>();
    expect(n!.n).toBe(0);
  });

  it('400 when no file is sent', async () => {
    const id = await seedBooking();
    const res = await upload(id, form([]));
    expect(res.status).toBe(400);
    expect(((await res.json()) as { error: string }).error).toBe('No files uploaded');
  });

  it('413 on more than 3 files', async () => {
    const id = await seedBooking();
    const f: [Uint8Array, string, string] = [JPEG, 'x.jpg', 'image/jpeg'];
    expect((await upload(id, form([f, f, f, f]))).status).toBe(413);
  });

  it('400 on a file over 10 MB', async () => {
    const id = await seedBooking();
    const big = new Uint8Array(10 * 1024 * 1024 + 1);
    big.set(JPEG);
    const res = await upload(id, form([[big, 'big.jpg', 'image/jpeg']]));
    expect(res.status).toBe(400);
    expect(((await res.json()) as { error: string }).error).toBe(
      'File too large: big.jpg. Maximum size: 10MB'
    );
  });

  it('404 for an unknown or soft-deleted booking', async () => {
    expect((await upload(crypto.randomUUID(), form([[JPEG, 'x.jpg', 'image/jpeg']]))).status).toBe(
      404
    );
    const gone = await seedBooking({ deleted_at: new Date().toISOString() });
    expect((await upload(gone, form([[JPEG, 'x.jpg', 'image/jpeg']]))).status).toBe(404);
  });
});

describe('admin file access', () => {
  async function withFile() {
    const id = await seedBooking();
    await upload(id, form([[JPEG, 'rëntgen.jpg', 'image/jpeg']]));
    const list = await call(`/api/receptionist/bookings/${id}/files`, { headers: ADMIN });
    const body = (await list.json()) as { success: boolean; files: Array<Record<string, unknown>> };
    return { id, list, body };
  }

  it('lists files without exposing storage paths', async () => {
    const { list, body } = await withFile();
    expect(list.status).toBe(200);
    expect(body.files).toHaveLength(1);
    expect(body.files[0]).toMatchObject({
      original_name: 'rëntgen.jpg',
      mime_type: 'image/jpeg',
      size_bytes: JPEG.length,
      available: true,
    });
    expect(body.files[0]).not.toHaveProperty('storage_path');
  });

  it('streams a file as a no-store attachment', async () => {
    const { id, body } = await withFile();
    const res = await call(`/api/receptionist/bookings/${id}/files/${body.files[0].id}`, {
      headers: ADMIN,
    });
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('image/jpeg');
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(res.headers.get('content-disposition')).toMatch(
      /^attachment; filename="r_ntgen.jpg"; filename\*=UTF-8''r%C3%ABntgen.jpg$/
    );
    expect(new Uint8Array(await res.arrayBuffer())).toEqual(JPEG);
  });

  it('410 when the row exists but the object was lost (the 2 files that died in /tmp on Fly)', async () => {
    const id = await seedBooking();
    await env.DB.prepare(
      `INSERT INTO booking_files (id, booking_id, filename, original_name, mime_type, size_bytes, storage_path, health_data_consent, expires_at)
       VALUES (9001, ?, 'lost.jpg', 'lost.jpg', 'image/jpeg', 10, ?, 1, '2026-01-01T00:00:00.000Z')`
    )
      .bind(id, `bookings/${id}/lost.jpg`)
      .run();
    const list = (await (
      await call(`/api/receptionist/bookings/${id}/files`, { headers: ADMIN })
    ).json()) as { files: Array<{ available: boolean }> };
    expect(list.files[0].available).toBe(false);
    const res = await call(`/api/receptionist/bookings/${id}/files/9001`, { headers: ADMIN });
    expect(res.status).toBe(410);
  });

  it('404 for a file of another booking, 401 without the token', async () => {
    const { id, body } = await withFile();
    const other = await seedBooking();
    expect(
      (
        await call(`/api/receptionist/bookings/${other}/files/${body.files[0].id}`, {
          headers: ADMIN,
        })
      ).status
    ).toBe(404);
    expect((await call(`/api/receptionist/bookings/${id}/files/${body.files[0].id}`)).status).toBe(
      401
    );
    expect((await call(`/api/receptionist/bookings/${id}/files`)).status).toBe(401);
  });
});
