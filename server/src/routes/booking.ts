import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { join, extname } from 'path';
import type { BookingRequest, BookingResponse } from '../types.js';
import { sendClinicNotification } from '../services/emailTemplates.js';
import { getCrmSync } from '../services/crmSync.js';

const UPLOAD_DIR = process.env.UPLOAD_DIR || '/tmp/zeo-uploads';
const FILE_RETENTION_DAYS = 90;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Validation helpers
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\d\s\-()+]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

function isValidFutureDate(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
}

export async function bookingRoutes(fastify: FastifyInstance) {
  const adminToken = process.env.ADMIN_TOKEN;

  fastify.post<{
    Body: BookingRequest;
    Reply: BookingResponse;
  }>('/booking', async (request: FastifyRequest<{ Body: BookingRequest }>, reply: FastifyReply) => {
    const { name, email, phone, service, date, time, description, notes, honeypot } = request.body;

    // Honeypot spam check
    if (honeypot && honeypot.trim().length > 0) {
      return reply.status(400).send({
        success: false,
        message: 'Invalid submission',
        error: 'Spam detected',
      });
    }

    // Validate required fields (name and service are always required; date/time are optional for quote requests)
    if (!name || !service) {
      return reply.status(400).send({
        success: false,
        message: 'Name and service are required',
        error: 'Missing required fields',
      });
    }

    // Require at least phone OR email
    if (!phone && !email) {
      return reply.status(400).send({
        success: false,
        message: 'Either phone or email is required',
        error: 'Either phone or email is required',
      });
    }

    // Validate email if provided
    if (email && !isValidEmail(email)) {
      return reply.status(400).send({
        success: false,
        message: 'Invalid email format',
        error: 'Invalid email format',
      });
    }

    // Validate phone if provided
    if (phone && !isValidPhone(phone)) {
      return reply.status(400).send({
        success: false,
        message: 'Invalid phone number format',
        error: 'Invalid phone number format',
      });
    }

    // Validate date if provided
    if (date && !isValidFutureDate(date)) {
      return reply.status(400).send({
        success: false,
        message: 'Date must be today or in the future',
        error: 'Date must be today or in the future',
      });
    }

    // Validate time slot if provided
    if (time) {
      const validTimeSlots = ['morning', 'afternoon', 'evening'];
      if (!validTimeSlots.includes(time.toLowerCase())) {
        return reply.status(400).send({
          success: false,
          message: 'Invalid time slot. Use: morning, afternoon, or evening',
          error: 'Invalid time slot',
        });
      }
    }

    try {
      const pool = fastify.pg;

      const result = await pool.query(
        `INSERT INTO bookings (name, email, phone, service, preferred_date, preferred_time, description, notes, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id, name, email, service, preferred_date, preferred_time, status`,
        [
          name.trim(),
          email ? email.trim().toLowerCase() : null,
          phone ? phone.trim() : null,
          service.trim(),
          date || null,
          time ? time.toLowerCase() : null,
          description?.trim() || null,
          notes?.trim() || null,
          'pending',
        ]
      );

      const booking = result.rows[0];

      fastify.log.info('New booking created: %s', booking.id);

      // Send clinic notification via Resend (fire-and-forget)
      sendClinicNotification(
        {
          ...booking,
          phone: phone ? phone.trim() : null,
          preferred_date: date || null,
          preferred_time: time ? time.toLowerCase() : null,
          description: description?.trim() || null,
          notes: notes?.trim() || null,
        },
        fastify
      ).catch(() => {});

      // Sync to ManagerCRM (fire-and-forget)
      const crm = getCrmSync();
      if (crm) {
        crm
          .syncBooking({
            name: name.trim(),
            email: email ? email.trim().toLowerCase() : undefined,
            phone: phone ? phone.trim() : undefined,
            service: service.trim(),
            date: date || undefined,
            time: time ? time.toLowerCase() : undefined,
            notes: notes?.trim() || undefined,
          })
          .then(syncResult => {
            if (syncResult.patientPid) {
              fastify.log.info(
                'Booking %s synced to CRM (patient: %s)',
                booking.id,
                syncResult.patientPid
              );
            }
          })
          .catch(err => {
            fastify.log.error(
              'CRM sync error for booking %s: %s',
              booking.id,
              err instanceof Error ? err.message : String(err)
            );
          });
      }

      return reply.status(201).send({
        success: true,
        message: 'Booking request submitted successfully',
        booking: {
          id: booking.id,
          name: booking.name,
          email: booking.email,
          service: booking.service,
          date: booking.preferred_date,
          time: booking.preferred_time,
          status: booking.status,
        },
      });
    } catch (err) {
      fastify.log.error('Booking error: %s', err instanceof Error ? err.message : String(err));
      return reply.status(500).send({
        success: false,
        message: 'Failed to create booking. Please try again.',
        error: 'Database error',
      });
    }
  });

  // Get bookings (admin endpoint - would need auth in production)
  fastify.get(
    '/bookings',
    {
      preHandler: async (request, reply) => {
        if (!adminToken) {
          return reply.status(503).send({ error: 'Admin access not configured' });
        }
        const authHeader = request.headers.authorization;
        if (authHeader !== `Bearer ${adminToken}`) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }
      },
    },
    async (request, reply) => {
      try {
        const clientIp = (request.headers['fly-client-ip'] ||
          request.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() ||
          request.ip) as string;
        fastify.log.info('Admin bookings accessed from IP: %s', clientIp);

        const pool = fastify.pg;
        const result = await pool.query(
          'SELECT * FROM bookings ORDER BY created_at DESC LIMIT 100'
        );
        return reply.send({ bookings: result.rows });
      } catch (err) {
        fastify.log.error(
          'Get bookings error: %s',
          err instanceof Error ? err.message : String(err)
        );
        return reply.status(500).send({ error: 'Failed to fetch bookings' });
      }
    }
  );

  // Upload files for a booking (GDPR-compliant health data handling)
  fastify.post<{
    Params: { bookingId: string };
  }>('/booking/:bookingId/files', async (request, reply) => {
    const { bookingId } = request.params as { bookingId: string };

    // Validate booking exists
    const pool = fastify.pg;
    const bookingCheck = await pool.query('SELECT id FROM bookings WHERE id = $1', [bookingId]);
    if (bookingCheck.rows.length === 0) {
      return reply.status(404).send({ success: false, error: 'Booking not found' });
    }

    // Ensure upload directory exists
    const bookingDir = join(UPLOAD_DIR, bookingId);
    await mkdir(bookingDir, { recursive: true });

    const parts = request.parts();
    let healthDataConsent = false;
    const savedFiles: Array<{
      filename: string;
      originalName: string;
      mimeType: string;
      sizeBytes: number;
    }> = [];

    for await (const part of parts) {
      if (part.type === 'field') {
        if (part.fieldname === 'healthDataConsent' && part.value === 'true') {
          healthDataConsent = true;
        }
        continue;
      }

      // File part
      if (!ALLOWED_MIME_TYPES.includes(part.mimetype)) {
        return reply.status(400).send({
          success: false,
          error: `File type not allowed: ${part.mimetype}. Accepted: JPG, PNG, WebP, PDF`,
        });
      }

      const buffer = await part.toBuffer();
      if (buffer.length > MAX_FILE_SIZE) {
        return reply.status(400).send({
          success: false,
          error: `File too large: ${part.filename}. Maximum size: 10MB`,
        });
      }

      const ext = extname(part.filename || '') || '.bin';
      const safeFilename = `${randomUUID()}${ext}`;
      const storagePath = join(bookingDir, safeFilename);

      await writeFile(storagePath, buffer);

      savedFiles.push({
        filename: safeFilename,
        originalName: part.filename || 'unknown',
        mimeType: part.mimetype,
        sizeBytes: buffer.length,
      });
    }

    if (savedFiles.length === 0) {
      return reply.status(400).send({ success: false, error: 'No files uploaded' });
    }

    if (!healthDataConsent) {
      return reply.status(400).send({
        success: false,
        error: 'Health data consent is required for uploading dental X-rays or photos',
      });
    }

    // Insert file metadata into DB
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + FILE_RETENTION_DAYS);

    for (const file of savedFiles) {
      await pool.query(
        `INSERT INTO booking_files (booking_id, filename, original_name, mime_type, size_bytes, storage_path, health_data_consent, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          bookingId,
          file.filename,
          file.originalName,
          file.mimeType,
          file.sizeBytes,
          join(bookingId, file.filename),
          healthDataConsent,
          expiresAt,
        ]
      );
    }

    fastify.log.info(
      'Uploaded %d files for booking %s (consent: %s, expires: %s)',
      savedFiles.length,
      bookingId,
      healthDataConsent,
      expiresAt.toISOString()
    );

    return reply.status(201).send({
      success: true,
      message: `${savedFiles.length} file(s) uploaded successfully`,
      files: savedFiles.map(f => ({ name: f.originalName, size: f.sizeBytes })),
    });
  });
}
