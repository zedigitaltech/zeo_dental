import type { FastifyBaseLogger } from 'fastify';

interface CrmConfig {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface CrmPatient {
  pid?: string;
  uuid?: string;
  fname: string;
  lname: string;
  email?: string;
  phone_cell?: string;
}

interface CrmAppointment {
  pc_eid?: string;
  pc_catid: number;
  pc_title: string;
  pc_duration: number;
  pc_hometext: string;
  pc_apptstatus: string;
  pc_eventDate: string;
  pc_startTime: string;
  pc_aid: number;
}

// Map website service names to CRM appointment category IDs (from setup_dental.sql)
const SERVICE_CATEGORY_MAP: Record<string, { catid: number; duration: number }> = {
  'dental cleaning': { catid: 10, duration: 2700 },
  'teeth cleaning': { catid: 10, duration: 2700 },
  'dental exam': { catid: 11, duration: 1800 },
  examination: { catid: 11, duration: 1800 },
  checkup: { catid: 11, duration: 1800 },
  filling: { catid: 12, duration: 2700 },
  'dental filling': { catid: 12, duration: 2700 },
  'root canal': { catid: 13, duration: 5400 },
  extraction: { catid: 14, duration: 2700 },
  'tooth extraction': { catid: 14, duration: 2700 },
  crown: { catid: 15, duration: 3600 },
  'dental crown': { catid: 15, duration: 3600 },
  implant: { catid: 16, duration: 5400 },
  'dental implant': { catid: 16, duration: 5400 },
  'orthodontic consultation': { catid: 17, duration: 1800 },
  orthodontics: { catid: 17, duration: 1800 },
  braces: { catid: 18, duration: 1800 },
  'orthodontic visit': { catid: 18, duration: 1800 },
  'teeth whitening': { catid: 19, duration: 3600 },
  whitening: { catid: 19, duration: 3600 },
  'dental x-ray': { catid: 20, duration: 900 },
  'x-ray': { catid: 20, duration: 900 },
  emergency: { catid: 21, duration: 1800 },
  'emergency dental': { catid: 21, duration: 1800 },
  veneer: { catid: 22, duration: 3600 },
  veneers: { catid: 22, duration: 3600 },
  denture: { catid: 23, duration: 3600 },
  dentures: { catid: 23, duration: 3600 },
  periodontal: { catid: 24, duration: 3600 },
  'gum treatment': { catid: 24, duration: 3600 },
  pediatric: { catid: 25, duration: 1800 },
  'pediatric dental': { catid: 25, duration: 1800 },
  'children dental': { catid: 25, duration: 1800 },
};

// Time slot to actual time mapping
const TIME_SLOT_MAP: Record<string, string> = {
  morning: '09:00:00',
  afternoon: '14:00:00',
  evening: '17:00:00',
};

class CrmSyncService {
  private config: CrmConfig;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  private siteId = 'default';
  private logger: FastifyBaseLogger | null = null;

  constructor(config: CrmConfig) {
    this.config = config;
  }

  setLogger(logger: FastifyBaseLogger) {
    this.logger = logger;
  }

  private log(level: 'info' | 'error' | 'warn', msg: string, ...args: unknown[]) {
    if (this.logger) {
      (this.logger[level] as (msg: string, ...args: unknown[]) => void)(
        `[CRM Sync] ${msg}`,
        ...args
      );
    }
  }

  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid (with 60s buffer)
    if (this.accessToken && Date.now() < this.tokenExpiry - 60000) {
      return this.accessToken;
    }

    const tokenUrl = `${this.config.baseUrl}/oauth2/${this.siteId}/token`;

    const body = new URLSearchParams({
      grant_type: 'password',
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      username: this.config.username,
      password: this.config.password,
      scope:
        'openid api:oemr api:fhir user/patient.read user/patient.write user/appointment.read user/appointment.write',
    });

    const res = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Token request failed (${res.status}): ${text}`);
    }

    const data = (await res.json()) as TokenResponse;
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + data.expires_in * 1000;

    this.log('info', 'Obtained CRM access token (expires in %ds)', data.expires_in);
    return this.accessToken;
  }

  private async apiRequest(
    method: string,
    path: string,
    body?: Record<string, unknown>
  ): Promise<unknown> {
    const token = await this.getAccessToken();
    const url = `${this.config.baseUrl}/apis/${this.siteId}/api${path}`;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    };
    if (body) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`CRM API ${method} ${path} failed (${res.status}): ${text}`);
    }

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return res.json();
    }
    return res.text();
  }

  /**
   * Find existing patient by email or phone
   */
  async findPatient(email?: string, phone?: string): Promise<CrmPatient | null> {
    try {
      if (email) {
        const result = (await this.apiRequest(
          'GET',
          `/patient?email=${encodeURIComponent(email)}`
        )) as {
          data?: CrmPatient[];
        };
        if (result?.data && result.data.length > 0) {
          return result.data[0];
        }
      }

      if (phone) {
        const cleaned = phone.replace(/\D/g, '');
        const result = (await this.apiRequest(
          'GET',
          `/patient?phone_cell=${encodeURIComponent(cleaned)}`
        )) as { data?: CrmPatient[] };
        if (result?.data && result.data.length > 0) {
          return result.data[0];
        }
      }
    } catch (err) {
      this.log(
        'error',
        'Error finding patient: %s',
        err instanceof Error ? err.message : String(err)
      );
    }
    return null;
  }

  /**
   * Create a new patient in the CRM
   */
  async createPatient(data: {
    name: string;
    email?: string;
    phone?: string;
  }): Promise<CrmPatient | null> {
    try {
      const nameParts = data.name.trim().split(/\s+/);
      const fname = nameParts[0] || 'Unknown';
      const lname = nameParts.slice(1).join(' ') || 'Patient';

      const patientData: Record<string, unknown> = {
        fname,
        lname,
        sex: 'Unknown',
      };

      if (data.email) patientData.email = data.email;
      if (data.phone) patientData.phone_cell = data.phone;

      const result = (await this.apiRequest('POST', '/patient', patientData)) as {
        data?: CrmPatient;
        uuid?: string;
        pid?: string;
      };

      if (result?.data || result?.uuid || result?.pid) {
        const patient = result.data || { pid: result.pid, uuid: result.uuid, fname, lname };
        this.log('info', 'Created patient: %s %s (pid: %s)', fname, lname, patient.pid);
        return patient;
      }
    } catch (err) {
      this.log(
        'error',
        'Error creating patient: %s',
        err instanceof Error ? err.message : String(err)
      );
    }
    return null;
  }

  /**
   * Create an appointment in the CRM
   */
  async createAppointment(data: {
    patientPid: string;
    service: string;
    date: string;
    time: string;
    notes?: string;
    status?: string;
  }): Promise<CrmAppointment | null> {
    try {
      const serviceKey = data.service.toLowerCase().trim();
      const category = SERVICE_CATEGORY_MAP[serviceKey] || { catid: 11, duration: 1800 }; // default to Dental Exam

      const startTime = TIME_SLOT_MAP[data.time.toLowerCase()] || '09:00:00';

      const appointmentData: Record<string, unknown> = {
        pc_catid: category.catid,
        pc_title: data.service,
        pc_duration: category.duration,
        pc_hometext: data.notes || `Online booking: ${data.service}`,
        pc_apptstatus: data.status || '-', // '-' = pending in OpenEMR
        pc_eventDate: data.date,
        pc_startTime: startTime,
        pc_aid: 1, // provider ID (admin/default provider)
      };

      const result = (await this.apiRequest(
        'POST',
        `/patient/${data.patientPid}/appointment`,
        appointmentData
      )) as { data?: CrmAppointment; uuid?: string };

      this.log(
        'info',
        'Created appointment for patient %s: %s on %s at %s',
        data.patientPid,
        data.service,
        data.date,
        startTime
      );
      return result?.data || null;
    } catch (err) {
      this.log(
        'error',
        'Error creating appointment: %s',
        err instanceof Error ? err.message : String(err)
      );
    }
    return null;
  }

  /**
   * Sync a website booking to the CRM:
   * 1. Find or create patient
   * 2. Create appointment with pending status
   */
  async syncBooking(booking: {
    name: string;
    email?: string;
    phone?: string;
    service: string;
    date?: string;
    time?: string;
    notes?: string;
  }): Promise<{ patientPid: string | null; appointmentId: string | null }> {
    const result = { patientPid: null as string | null, appointmentId: null as string | null };

    try {
      // 1. Find or create patient
      let patient = await this.findPatient(booking.email || undefined, booking.phone || undefined);
      if (!patient) {
        patient = await this.createPatient({
          name: booking.name,
          email: booking.email || undefined,
          phone: booking.phone || undefined,
        });
      }

      if (!patient?.pid) {
        this.log('warn', 'Could not find or create patient for booking: %s', booking.name);
        return result;
      }
      result.patientPid = patient.pid;

      // 2. Create appointment (only if date is provided)
      const appointment = booking.date
        ? await this.createAppointment({
            patientPid: patient.pid,
            service: booking.service,
            date: booking.date,
            time: booking.time || 'morning',
            notes: booking.notes,
            status: '-', // pending
          })
        : null;

      if (appointment?.pc_eid) {
        result.appointmentId = appointment.pc_eid;
      }
    } catch (err) {
      this.log(
        'error',
        'Sync booking failed: %s',
        err instanceof Error ? err.message : String(err)
      );
    }

    return result;
  }

  /**
   * Check if the CRM is reachable and configured
   */
  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetch(`${this.config.baseUrl}/apis/${this.siteId}/api/facility`, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000),
      });
      return res.status !== 0;
    } catch {
      return false;
    }
  }
}

// Singleton instance
let crmSync: CrmSyncService | null = null;

export function initCrmSync(logger?: FastifyBaseLogger): CrmSyncService | null {
  const baseUrl = process.env.CRM_BASE_URL;
  const clientId = process.env.CRM_CLIENT_ID;
  const clientSecret = process.env.CRM_CLIENT_SECRET;
  const username = process.env.CRM_USERNAME;
  const password = process.env.CRM_PASSWORD;

  if (!baseUrl || !clientId || !clientSecret || !username || !password) {
    if (logger) {
      logger.info(
        '[CRM Sync] Not configured - set CRM_BASE_URL, CRM_CLIENT_ID, CRM_CLIENT_SECRET, CRM_USERNAME, CRM_PASSWORD to enable'
      );
    }
    return null;
  }

  crmSync = new CrmSyncService({ baseUrl, clientId, clientSecret, username, password });
  if (logger) {
    crmSync.setLogger(logger);
    logger.info('[CRM Sync] Initialized - syncing to %s', baseUrl);
  }
  return crmSync;
}

export function getCrmSync(): CrmSyncService | null {
  return crmSync;
}
