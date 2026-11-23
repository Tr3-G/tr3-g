export interface BrevoEmailOptions {
  toEmail: string
  toName: string
  roleTitle: string
  referenceId?: string
  applicantName: string
}

export async function sendApplicationConfirmationEmail(
  options: BrevoEmailOptions
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const apiKey = process.env.BREVO_API_KEY
  const senderEmail = process.env.BREVO_SENDER_EMAIL || "careers@tr3-g.com.ng"
  const senderName = process.env.BREVO_SENDER_NAME || "TR3-G Innovations Limited"

  if (!apiKey) {
    console.warn("BREVO_API_KEY is not configured in environment variables. Email notification skipped.")
    return { success: false, error: "BREVO_API_KEY not configured" }
  }

  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Received — TR3-G Innovations Limited</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0B192C; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #E1E9F1;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0B192C; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #0E243A; border: 1px solid rgba(63, 122, 34, 0.4); border-radius: 8px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px; background: linear-gradient(135deg, #062950 0%, #0E243A 100%); border-bottom: 1px solid rgba(63, 122, 34, 0.3);">
              <table width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #FFFFFF; letter-spacing: -0.5px;">TR3-G <span style="font-size: 13px; font-weight: 600; color: #3F7A22; text-transform: uppercase; letter-spacing: 1.5px; margin-left: 8px;">Innovations</span></h1>
                    <p style="margin: 6px 0 0; font-size: 11px; font-family: monospace; color: #7CA1BF; text-transform: uppercase; letter-spacing: 1px;">Talent & Engineering Cohort</p>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 10px; background-color: rgba(63, 122, 34, 0.2); border: 1px solid #3F7A22; border-radius: 4px; font-size: 11px; font-family: monospace; color: #529E2C; text-transform: uppercase;">RECEIVED</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #FFFFFF;">Application Confirmed</h2>
              <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: #C2D3E4;">Dear <strong>${options.applicantName}</strong>,</p>
              
              <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.7; color: #A0B7CD;">
                Thank you for applying for the <strong style="color: #FFFFFF;">${options.roleTitle}</strong> position at <strong>TR3-G Innovations Limited</strong>. We have received your application along with your submitted credentials and materials.
              </p>

              <!-- Application summary card -->
              <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #062950; border: 1px solid rgba(6, 41, 80, 0.5); border-left: 3px solid #3F7A22; border-radius: 4px; margin: 24px 0; padding: 20px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 8px; font-size: 11px; font-family: monospace; text-transform: uppercase; color: #7CA1BF; letter-spacing: 1px;">Submission Summary</p>
                    <table width="100%" cellspacing="0" cellpadding="4" style="font-size: 13px;">
                      <tr>
                        <td width="35%" style="color: #7CA1BF; font-family: monospace;">Role:</td>
                        <td style="color: #FFFFFF; font-weight: 600;">${options.roleTitle}</td>
                      </tr>
                      <tr>
                        <td style="color: #7CA1BF; font-family: monospace;">Candidate:</td>
                        <td style="color: #FFFFFF;">${options.applicantName}</td>
                      </tr>
                      <tr>
                        <td style="color: #7CA1BF; font-family: monospace;">Date:</td>
                        <td style="color: #FFFFFF;">${dateStr}</td>
                      </tr>
                      ${
                        options.referenceId
                          ? `
                      <tr>
                        <td style="color: #7CA1BF; font-family: monospace;">Reference ID:</td>
                        <td style="color: #529E2C; font-family: monospace;">${options.referenceId}</td>
                      </tr>`
                          : ""
                      }
                    </table>
                  </td>
                </tr>
              </table>

              <h3 style="margin: 28px 0 12px; font-size: 15px; font-weight: 600; color: #FFFFFF;">What happens next?</h3>
              <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.7; color: #A0B7CD;">
                At TR3-G, we treat software and talent with sovereign rigor. Our engineering leads and talent cohort will carefully review your background and responses. If your profile aligns with our current architecture track, our operations hub will reach out to schedule an introductory discussion.
              </p>

              <p style="margin: 0 0 28px; font-size: 14px; line-height: 1.7; color: #A0B7CD;">
                In the meantime, feel free to explore our public architecture and deployed digital ecosystems at <a href="https://www.tr3-g.com.ng" style="color: #529E2C; text-decoration: none; font-weight: 600;">tr3-g.com.ng</a>.
              </p>

              <div style="border-top: 1px solid rgba(63, 122, 34, 0.2); padding-top: 24px; margin-top: 24px;">
                <p style="margin: 0; font-size: 13px; color: #FFFFFF; font-weight: 600;">The TR3-G Talent & Engineering Cohort</p>
                <p style="margin: 4px 0 0; font-size: 12px; font-family: monospace; color: #7CA1BF;">Abuja Operations Hub • TR3-G Innovations Limited</p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #061F38; border-top: 1px solid rgba(63, 122, 34, 0.2); font-size: 11px; color: #54697F; line-height: 1.6; text-align: center;">
              <p style="margin: 0 0 6px;">AA2 Behind Arena Off Dunamis Church, Kuje Abuja, Nigeria</p>
              <p style="margin: 0;">© ${new Date().getFullYear()} TR3-G Innovations Limited. Enterprise software, built secure.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: senderName,
          email: senderEmail,
        },
        to: [
          {
            email: options.toEmail,
            name: options.toName,
          },
        ],
        subject: `Application Received: ${options.roleTitle} — TR3-G Innovations Limited`,
        htmlContent,
      }),
    })

    if (!response.ok) {
      const errBody = await response.text()
      console.error("Brevo API error:", response.status, errBody)
      return { success: false, error: errBody }
    }

    const data = await response.json()
    return { success: true, messageId: data.messageId }
  } catch (error: any) {
    console.error("Failed to send Brevo email:", error)
    return { success: false, error: error.message }
  }
}

export interface SendEmailPayload {
  toEmail: string
  toName?: string
  subject: string
  message: string
  category?: string
}

export async function sendCustomEmail(
  payload: SendEmailPayload
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const apiKey = process.env.BREVO_API_KEY
  const senderEmail = process.env.BREVO_SENDER_EMAIL || "info@tr3-g.com.ng"
  const senderName = process.env.BREVO_SENDER_NAME || "TR3-G Innovations Limited"

  if (!apiKey) {
    return { success: false, error: "BREVO_API_KEY is not configured in environment variables" }
  }

  const formattedBody = payload.message
    .split("\n")
    .map((line) => line.trim())
    .map((line) =>
      line
        ? `<p style="margin: 0 0 16px; font-size: 14px; line-height: 1.7; color: #C2D3E4;">${line}</p>`
        : "<br/>"
    )
    .join("")

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${payload.subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0B192C; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #E1E9F1;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0B192C; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #0E243A; border: 1px solid rgba(63, 122, 34, 0.4); border-radius: 8px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px; background: linear-gradient(135deg, #062950 0%, #0E243A 100%); border-bottom: 1px solid rgba(63, 122, 34, 0.3);">
              <table width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #FFFFFF; letter-spacing: -0.5px;">TR3-G <span style="font-size: 13px; font-weight: 600; color: #3F7A22; text-transform: uppercase; letter-spacing: 1.5px; margin-left: 8px;">Innovations</span></h1>
                    <p style="margin: 6px 0 0; font-size: 11px; font-family: monospace; color: #7CA1BF; text-transform: uppercase; letter-spacing: 1px;">Official Dispatch</p>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 10px; background-color: rgba(63, 122, 34, 0.2); border: 1px solid #3F7A22; border-radius: 4px; font-size: 11px; font-family: monospace; color: #529E2C; text-transform: uppercase;">TRANSMISSION</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              ${
                payload.toName
                  ? `<p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: #FFFFFF;">Dear <strong>${payload.toName}</strong>,</p>`
                  : ""
              }
              
              <div style="font-size: 14px; line-height: 1.7; color: #C2D3E4;">
                ${formattedBody}
              </div>

              <div style="border-top: 1px solid rgba(63, 122, 34, 0.2); padding-top: 24px; margin-top: 32px;">
                <p style="margin: 0; font-size: 13px; color: #FFFFFF; font-weight: 600;">The TR3-G Operations & Leadership Team</p>
                <p style="margin: 4px 0 0; font-size: 12px; font-family: monospace; color: #7CA1BF;">Abuja Operations Hub • TR3-G Innovations Limited</p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #061F38; border-top: 1px solid rgba(63, 122, 34, 0.2); font-size: 11px; color: #54697F; line-height: 1.6; text-align: center;">
              <p style="margin: 0 0 6px;">AA2 Behind Arena Off Dunamis Church, Kuje Abuja, Nigeria</p>
              <p style="margin: 0;">© ${new Date().getFullYear()} TR3-G Innovations Limited. Enterprise software, built secure.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: senderName,
          email: senderEmail,
        },
        to: [
          {
            email: payload.toEmail.trim(),
            name: payload.toName?.trim() || undefined,
          },
        ],
        subject: payload.subject.trim(),
        htmlContent,
      }),
    })

    if (!response.ok) {
      const errBody = await response.text()
      console.error("Brevo API error:", response.status, errBody)
      return { success: false, error: errBody }
    }

    const data = await response.json()
    return { success: true, messageId: data.messageId }
  } catch (error: any) {
    console.error("Failed to send Brevo email:", error)
    return { success: false, error: error.message }
  }
}

export interface ReportReceivedEmailOptions {
  toEmail: string
  toName: string
  staffUid: string
  reportTitle: string
  reportId?: string
  workstation: string
}

export async function sendReportReceivedEmail(
  options: ReportReceivedEmailOptions
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const apiKey = process.env.BREVO_API_KEY
  const senderEmail = process.env.BREVO_SENDER_EMAIL || "reports@tr3-g.com.ng"
  const senderName = process.env.BREVO_SENDER_NAME || "TR3-G Innovations Operations"

  if (!apiKey) {
    console.warn("BREVO_API_KEY is not configured. Report received email skipped.")
    return { success: false, error: "BREVO_API_KEY not configured" }
  }

  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Report Received — TR3-G Innovations</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0B192C; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #E1E9F1;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0B192C; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #0E243A; border: 1px solid rgba(63, 122, 34, 0.4); border-radius: 8px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px; background: linear-gradient(135deg, #062950 0%, #0E243A 100%); border-bottom: 1px solid rgba(63, 122, 34, 0.3);">
              <table width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #FFFFFF; letter-spacing: -0.5px;">TR3-G <span style="font-size: 13px; font-weight: 600; color: #3F7A22; text-transform: uppercase; letter-spacing: 1.5px; margin-left: 8px;">Innovations</span></h1>
                    <p style="margin: 6px 0 0; font-size: 11px; font-family: monospace; color: #7CA1BF; text-transform: uppercase; letter-spacing: 1px;">Workforce Reporting Portal</p>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 10px; background-color: rgba(63, 122, 34, 0.2); border: 1px solid #3F7A22; border-radius: 4px; font-size: 11px; font-family: monospace; color: #529E2C; text-transform: uppercase;">RECEIVED</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #FFFFFF;">Report Received & Queued</h2>
              <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: #C2D3E4;">Dear <strong>${options.toName || options.staffUid}</strong>,</p>
              
              <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.7; color: #A0B7CD;">
                Your report titled <strong style="color: #FFFFFF;">&ldquo;${options.reportTitle}&rdquo;</strong> has been successfully received by the management of <strong>TR3-G Innovations Limited</strong> and will be reviewed by the administration.
              </p>

              <!-- Report summary card -->
              <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #062950; border: 1px solid rgba(6, 41, 80, 0.5); border-left: 3px solid #3F7A22; border-radius: 4px; margin: 24px 0; padding: 20px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 8px; font-size: 11px; font-family: monospace; text-transform: uppercase; color: #7CA1BF; letter-spacing: 1px;">Report Details</p>
                    <table width="100%" cellspacing="0" cellpadding="4" style="font-size: 13px;">
                      <tr>
                        <td width="35%" style="color: #7CA1BF; font-family: monospace;">Title:</td>
                        <td style="color: #FFFFFF; font-weight: 600;">${options.reportTitle}</td>
                      </tr>
                      <tr>
                        <td style="color: #7CA1BF; font-family: monospace;">Staff UID:</td>
                        <td style="color: #529E2C; font-family: monospace;">${options.staffUid}</td>
                      </tr>
                      <tr>
                        <td style="color: #7CA1BF; font-family: monospace;">Workstation:</td>
                        <td style="color: #FFFFFF;">${options.workstation}</td>
                      </tr>
                      <tr>
                        <td style="color: #7CA1BF; font-family: monospace;">Date:</td>
                        <td style="color: #FFFFFF;">${dateStr}</td>
                      </tr>
                      ${
                        options.reportId
                          ? `
                      <tr>
                        <td style="color: #7CA1BF; font-family: monospace;">Report Reference:</td>
                        <td style="color: #7CA1BF; font-family: monospace;">${options.reportId}</td>
                      </tr>`
                          : ""
                      }
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0; font-size: 13px; line-height: 1.6; color: #7CA1BF;">
                An administrator will review your report shortly. You will receive an automated dispatch notification as soon as the review is complete and the report is approved.
              </p>

              <div style="border-top: 1px solid rgba(63, 122, 34, 0.2); padding-top: 24px; margin-top: 32px;">
                <p style="margin: 0; font-size: 13px; color: #FFFFFF; font-weight: 600;">Operations Control Center</p>
                <p style="margin: 4px 0 0; font-size: 12px; font-family: monospace; color: #7CA1BF;">TR3-G Innovations Limited</p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #061F38; border-top: 1px solid rgba(63, 122, 34, 0.2); font-size: 11px; color: #54697F; line-height: 1.6; text-align: center;">
              <p style="margin: 0 0 6px;">AA2 Behind Arena Off Dunamis Church, Kuje Abuja, Nigeria</p>
              <p style="margin: 0;">&copy; ${new Date().getFullYear()} TR3-G Innovations Limited. Enterprise software, built secure.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: senderName,
          email: senderEmail,
        },
        to: [
          {
            email: options.toEmail.trim(),
            name: options.toName?.trim() || options.staffUid,
          },
        ],
        subject: `Report Received: ${options.reportTitle} — TR3-G Innovations`,
        htmlContent,
      }),
    })

    if (!response.ok) {
      const errBody = await response.text()
      console.error("Brevo API error (Report Received):", response.status, errBody)
      return { success: false, error: errBody }
    }

    const data = await response.json()
    return { success: true, messageId: data.messageId }
  } catch (error: any) {
    console.error("Failed to send Brevo report received email:", error)
    return { success: false, error: error.message }
  }
}

export interface ReportApprovedEmailOptions {
  toEmail: string
  toName: string
  staffUid: string
  reportTitle: string
  reportId?: string
  workstation?: string
  adminName: string
  adminNotes?: string
}

export async function sendReportApprovedEmail(
  options: ReportApprovedEmailOptions
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const apiKey = process.env.BREVO_API_KEY
  const senderEmail = process.env.BREVO_SENDER_EMAIL || "reports@tr3-g.com.ng"
  const senderName = process.env.BREVO_SENDER_NAME || "TR3-G Innovations Administration"

  if (!apiKey) {
    console.warn("BREVO_API_KEY is not configured. Report approved email skipped.")
    return { success: false, error: "BREVO_API_KEY not configured" }
  }

  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Report Approved — TR3-G Innovations</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0B192C; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #E1E9F1;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0B192C; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #0E243A; border: 1px solid rgba(63, 122, 34, 0.4); border-radius: 8px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px; background: linear-gradient(135deg, #062950 0%, #0E243A 100%); border-bottom: 1px solid rgba(63, 122, 34, 0.3);">
              <table width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #FFFFFF; letter-spacing: -0.5px;">TR3-G <span style="font-size: 13px; font-weight: 600; color: #3F7A22; text-transform: uppercase; letter-spacing: 1.5px; margin-left: 8px;">Innovations</span></h1>
                    <p style="margin: 6px 0 0; font-size: 11px; font-family: monospace; color: #7CA1BF; text-transform: uppercase; letter-spacing: 1px;">Official Executive Review</p>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 10px; background-color: rgba(34, 197, 94, 0.2); border: 1px solid #22c55e; border-radius: 4px; font-size: 11px; font-family: monospace; color: #22c55e; text-transform: uppercase; font-weight: 700;">APPROVED</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #FFFFFF;">Report Formally Approved</h2>
              <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: #C2D3E4;">Dear <strong>${options.toName || options.staffUid}</strong>,</p>
              
              <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.7; color: #A0B7CD;">
                We are pleased to inform you that your report titled <strong style="color: #FFFFFF;">&ldquo;${options.reportTitle}&rdquo;</strong> has been reviewed and officially <strong style="color: #22c55e;">APPROVED</strong> by administrator <strong style="color: #FFFFFF;">${options.adminName}</strong>.
              </p>

              <!-- Approval Summary card -->
              <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #062950; border: 1px solid rgba(6, 41, 80, 0.5); border-left: 3px solid #22c55e; border-radius: 4px; margin: 24px 0; padding: 20px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 8px; font-size: 11px; font-family: monospace; text-transform: uppercase; color: #7CA1BF; letter-spacing: 1px;">Approval Record</p>
                    <table width="100%" cellspacing="0" cellpadding="4" style="font-size: 13px;">
                      <tr>
                        <td width="35%" style="color: #7CA1BF; font-family: monospace;">Report Title:</td>
                        <td style="color: #FFFFFF; font-weight: 600;">${options.reportTitle}</td>
                      </tr>
                      <tr>
                        <td style="color: #7CA1BF; font-family: monospace;">Staff UID:</td>
                        <td style="color: #529E2C; font-family: monospace;">${options.staffUid}</td>
                      </tr>
                      <tr>
                        <td style="color: #7CA1BF; font-family: monospace;">Approved By:</td>
                        <td style="color: #FFFFFF; font-weight: 700;">${options.adminName}</td>
                      </tr>
                      <tr>
                        <td style="color: #7CA1BF; font-family: monospace;">Approval Date:</td>
                        <td style="color: #FFFFFF;">${dateStr}</td>
                      </tr>
                      ${
                        options.adminNotes
                          ? `
                      <tr>
                        <td style="color: #7CA1BF; font-family: monospace; vertical-align: top;">Reviewer Notes:</td>
                        <td style="color: #E1E9F1; font-style: italic;">${options.adminNotes}</td>
                      </tr>`
                          : ""
                      }
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0; font-size: 13px; line-height: 1.6; color: #7CA1BF;">
                Your report has been archived into the central enterprise records repository. Thank you for your continued dedication to excellence at TR3-G Innovations.
              </p>

              <div style="border-top: 1px solid rgba(63, 122, 34, 0.2); padding-top: 24px; margin-top: 32px;">
                <p style="margin: 0; font-size: 13px; color: #FFFFFF; font-weight: 600;">Executive Administration</p>
                <p style="margin: 4px 0 0; font-size: 12px; font-family: monospace; color: #7CA1BF;">TR3-G Innovations Limited</p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #061F38; border-top: 1px solid rgba(63, 122, 34, 0.2); font-size: 11px; color: #54697F; line-height: 1.6; text-align: center;">
              <p style="margin: 0 0 6px;">AA2 Behind Arena Off Dunamis Church, Kuje Abuja, Nigeria</p>
              <p style="margin: 0;">&copy; ${new Date().getFullYear()} TR3-G Innovations Limited. Enterprise software, built secure.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: senderName,
          email: senderEmail,
        },
        to: [
          {
            email: options.toEmail.trim(),
            name: options.toName?.trim() || options.staffUid,
          },
        ],
        subject: `Report Approved: ${options.reportTitle} — TR3-G Innovations`,
        htmlContent,
      }),
    })

    if (!response.ok) {
      const errBody = await response.text()
      console.error("Brevo API error (Report Approved):", response.status, errBody)
      return { success: false, error: errBody }
    }

    const data = await response.json()
    return { success: true, messageId: data.messageId }
  } catch (error: any) {
    console.error("Failed to send Brevo report approved email:", error)
    return { success: false, error: error.message }
  }
}
