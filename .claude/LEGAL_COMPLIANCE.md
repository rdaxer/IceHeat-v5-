# ⚖️ Legal & Compliance Guide

Rechtliche Anforderungen für eine verkaufsreife Anwendung.

## 🌍 Jurisdiction & Applicable Laws

### DACH Region (Deutschland, Österreich, Schweiz)
- **GDPR** (Allgemeine Datenschutzverordnung) - EU/EEA
- **BDSG** (Bundesdatenschutzgesetz) - Deutschland spezifisch
- **TTDSG** (Telekommunikation-Telemedien-Datenschutz-Gesetz)
- **eIDAS** (Electronic Identification and Trust Services)
- **AStG** (Außensteuergesetz) - für internationale Geschäfte

### International
- **CCPA** (California Consumer Privacy Act) - USA/Kalifornien
- **PIPEDA** (Personal Information Protection and Electronic Documents Act) - Kanada
- **LGPD** (Lei Geral de Proteção de Dados) - Brasilien
- **POPIA** (Protection of Personal Information Act) - Südafrika

---

## 📋 Required Legal Documents

### 1. Privacy Policy (Datenschutzerklärung)

**Erforderliche Inhalte (DSGVO Artikel 13, 14):**

```markdown
# Datenschutzerklärung

## 1. Verantwortlicher
- Vollständiger Name
- Adresse
- Email
- Datenschutzbeauftragte (falls erforderlich)

## 2. Datenverarbeitung
- Zweck der Verarbeitung
- Rechtsgrundlage (Vertrag, Einwilligung, Legale Verpflichtung, Berechtigtes Interesse)
- Dauer der Speicherung
- Empfänger der Daten

## 3. Betroffenenrechte
- Recht auf Auskunft (Artikel 15)
- Recht auf Berichtigung (Artikel 16)
- Recht auf Löschung (Artikel 17)
- Recht auf Einschränkung (Artikel 18)
- Recht auf Datenportabilität (Artikel 20)
- Recht auf Widerspruch (Artikel 21)
- Recht gegen automatisierte Entscheidung (Artikel 22)

## 4. Sicherheit
- Verwendete Verschlüsselungstechniken
- Zugriffsschutz
- Rollen basierte Kontrollmechanismen

## 5. Cookies & Tracking
- Verwendete Cookies
- Third-Party Tools (Analytics, Ads)
- Opt-out Möglichkeiten

## 6. Sub-Processor
- Liste aller Dienste (Stripe, SendGrid, etc.)
- Datenverarbeitungsverträge

## 7. Kontakt
- Wie Benutzer ihre Rechte ausüben können
- Beschwerdeverfahren zur Datenschutzbehörde
```

**Generator Tools:**
- iubenda: https://www.iubenda.com
- Termly: https://termly.io
- Privacyshield: https://www.privacyshield.gov

### 2. Terms of Service (Nutzungsbedingungen)

**Erforderliche Abschnitte:**

```markdown
# Terms of Service

## 1. Service Description
- Was die Anwendung tut
- Verfügbarkeit und Umfang

## 2. User Account
- Registrierungsanforderungen
- Altersminimum (z.B. 18 Jahre oder 13+ mit Elternzustimmung)
- Passwort-Sicherheit
- Account Deletion Recht

## 3. Acceptable Use Policy
- Verbotene Aktivitäten:
  - Illegale Inhalte
  - Harassment/Abuse
  - Spam
  - Malware/Hacking
  - Intellectual Property Violations

## 4. Intellectual Property
- Ownership von App/Content
- License Grant an Nutzer
- Prohibited Uses (Reverse Engineering, etc.)
- Copyright/Trademark

## 5. Limitation of Liability
```
TO THE MAXIMUM EXTENT PERMITTED BY LAW, 
COMPANY SHALL NOT BE LIABLE FOR ANY INDIRECT, 
INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES
```

## 6. Indemnification
```
YOU AGREE TO DEFEND, INDEMNIFY, AND HOLD HARMLESS 
THE COMPANY FROM ANY CLAIMS ARISING FROM YOUR USE 
OF THE SERVICE OR VIOLATION OF THESE TERMS
```

## 7. Payment & Refunds
- Refund policy
- Cancellation rights (EU: 14 days)
- Billing practices

## 8. Warranty Disclaimer
```
THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES 
OF ANY KIND, EXPRESS OR IMPLIED
```

## 9. Termination
- Grounds for termination
- Effect of termination
- Data access after termination

## 10. Dispute Resolution
- Jurisdiction (z.B. "German courts")
- Arbitration clause (optional)
- Class action waiver

## 11. Changes to Terms
- How and when terms will be modified
- User notification requirements
- Continued use = acceptance

## 12. Severability
- If one clause is invalid, others remain valid
```

**Hinweis:** Professional legal review empfohlen vor Launch!

---

## 🔐 GDPR Compliance Checklist

### Data Collection

```markdown
- [ ] Lawful Basis documented for every data collection
  - [ ] Consent (explicit, freely given)
  - [ ] Contract (necessary for service)
  - [ ] Legal Obligation
  - [ ] Vital Interests
  - [ ] Public Task
  - [ ] Legitimate Interest (with balancing test)

- [ ] Privacy Notice provided (in clear, plain language)
  
- [ ] Cookie Consent Banner implemented
  - [ ] Explicit opt-in for non-essential cookies
  - [ ] Easy withdrawal mechanism
  - [ ] Granular control (analytics, marketing, etc.)

- [ ] Legitimate Interest Assessment (for legitimate interests)

- [ ] Data Processing Agreement with all sub-processors
```

### Data Security

```markdown
- [ ] Encryption in Transit (TLS 1.3+)
  
- [ ] Encryption at Rest (AES-256)
  
- [ ] Access Control
  - [ ] Role-based access control (RBAC)
  - [ ] Principle of least privilege
  - [ ] Audit logging of access
  
- [ ] Vulnerability Management
  - [ ] Regular security assessments
  - [ ] Penetration testing
  - [ ] Dependency scanning
  
- [ ] Incident Response Plan
  - [ ] 72-hour breach notification process
  - [ ] Incident documentation
  - [ ] DPA Authority notification procedure
```

### User Rights

```markdown
- [ ] Right to Access
  - [ ] Mechanism to export personal data (JSON/CSV)
  - [ ] Free of charge
  - [ ] Within 30 days (extendable to 90)
  - [ ] Machine-readable format

- [ ] Right to Rectification
  - [ ] Allow users to update their data
  - [ ] Verify data accuracy

- [ ] Right to Erasure ("Right to be Forgotten")
  - [ ] User can request deletion
  - [ ] Delete within 30 days
  - [ ] Exception: legal retention requirements
  - [ ] Notify third parties

- [ ] Right to Restrict Processing
  - [ ] Suspend processing but retain data
  
- [ ] Right to Portability
  - [ ] Export data in standard format
  - [ ] Transmit to another provider
  
- [ ] Right to Object
  - [ ] Marketing opt-out
  - [ ] Profiling opt-out
  
- [ ] Rights related to Automated Decision Making
  - [ ] Disclose use of profiling
  - [ ] Right to human review
  - [ ] Right to explanation
```

### Data Retention

```markdown
- [ ] Define retention period for each data category
- [ ] Implement automatic deletion/archival
- [ ] Document legal bases for longer retention
- [ ] Example policy:
  - User account: until deletion
  - Transaction logs: 7 years (tax/legal)
  - Support tickets: 2 years
  - Marketing data: until opt-out
```

### International Transfers

```markdown
If transferring data outside EU/EEA:

- [ ] Standard Contractual Clauses (SCCs) in place
- [ ] Supplementary Technical Measures documented
- [ ] Transfer Impact Assessment completed
- [ ] Third-country country data protection level assessed

Note: Post-Schrems II (2020), adequacy decisions are insufficient
```

### Organizational Measures

```markdown
- [ ] Data Protection Officer (DPO) appointed (if required)
  - [ ] Publicly listed contact information
  - [ ] Accessible to data subjects and authorities

- [ ] Privacy by Design implemented
  - [ ] Privacy reviewed before product launch
  - [ ] Default settings privacy-friendly

- [ ] Data Protection Impact Assessment (DPIA)
  - [ ] Completed for high-risk processing
  - [ ] Published in transparency report

- [ ] Sub-processor Agreements
  - [ ] Written Data Processing Agreements
  - [ ] Regular audits/assessments

- [ ] Staff Training
  - [ ] Annual GDPR training
  - [ ] Data security awareness
  - [ ] Incident response procedures

- [ ] Transparent Records
  - [ ] Maintain Record of Processing Activities (ROPA)
  - [ ] Publicly available privacy documentation
```

---

## 💳 Payment & Financial Compliance

### Payment Processing

**PCI DSS Compliance** (Payment Card Industry Data Security Standard)

```markdown
DO:
- [ ] Use PCI-compliant payment processors (Stripe, PayPal)
- [ ] Never store credit card numbers
- [ ] Use tokenization for recurring payments
- [ ] Implement 3D Secure / SCA for payments

DON'T:
- [ ] Never transmit card data in plaintext
- [ ] Never store CVV/CVC
- [ ] Never store full card numbers (only last 4 digits)
```

### Tax Compliance

```markdown
- [ ] Register for sales tax/VAT if required
- [ ] Implement VAT calculation & collection
  - [ ] EU: MOSS (Mini One-Stop Shop) if eligible
  - [ ] US: Check state-by-state requirements
  
- [ ] Issue invoices with:
  - [ ] Invoice number (sequential)
  - [ ] Date of transaction
  - [ ] Seller identification (name, address)
  - [ ] Buyer identification (if B2B)
  - [ ] Description of services/goods
  - [ ] Price and tax
  - [ ] Tax ID/VAT number
  
- [ ] Keep records for 6-10 years (jurisdiction dependent)

- [ ] Report taxes to authorities
  - [ ] Monthly/Quarterly/Yearly depending on jurisdiction
```

### Refund & Cancellation Policy

**EU Directive 2011/83/EU (14-day cooling-off period for distance contracts):**

```markdown
- [ ] Right to cancel within 14 days
- [ ] Full refund, no questions asked (exceptions for digital goods)
- [ ] Contact information for refund requests
- [ ] Clear cancellation process

Common Exceptions:
- Digital goods delivered (& consumed)
- Customized/personalized content
- Subscription services (if started with consent)

Best Practice: Allow longer cancellation (30 days) for goodwill
```

---

## 📱 App Store Compliance

### Google Play Store

```markdown
- [ ] Privacy Policy mandatory (link in app)
- [ ] Terms of Service accepted by user
- [ ] Age-appropriate rating (IARC)
- [ ] Permissions justified
  - [ ] Only request necessary permissions
  - [ ] Use permissions according to purpose
  - [ ] No permission creep
  
- [ ] Content Guidelines
  - [ ] No illegal content
  - [ ] No deceptive practices
  - [ ] No malware/spyware
  - [ ] No hate speech/harassment
  
- [ ] Subscription Management
  - [ ] Clear description of what's included
  - [ ] Easy cancellation
  - [ ] Transparent pricing
```

### Apple App Store

```markdown
- [ ] Privacy Policy (in-app and web)
- [ ] Terms of Service
- [ ] Age Rating (ESRB/IARC)
- [ ] App Privacy Nutrition Label
  - [ ] Collect what data?
  - [ ] How is data used?
  - [ ] Is data linked to user identity?
  - [ ] Is data sold?
  
- [ ] Content Guidelines compliance
- [ ] Payment Method compliance (Apple In-App Purchase for digital goods)
```

### Microsoft Store

```markdown
- [ ] Privacy Policy & Terms of Service
- [ ] Content rating (ESRB)
- [ ] Accessibility features documented
- [ ] Certification requirements
- [ ] Update frequency (at least annually)
```

---

## 🔐 Security Certifications

### Optional but Recommended

```markdown
- [ ] ISO 27001 (Information Security Management)
      Cost: $5,000-$50,000 + annual audit
      Timeframe: 6-12 months
      
- [ ] SOC 2 Type II (System and Organization Controls)
      Cost: $3,000-$15,000
      Timeframe: 6-12 months
      
- [ ] HIPAA (if handling health data)
      Compliance: Required for healthcare
      
- [ ] PCI DSS (Payment Card Industry)
      Required if handling credit cards
      Cost: $1,000-$50,000/year
```

---

## 📄 License & IP Protection

### Choose License

```markdown
Open Source (if applicable):
- MIT License: Simple, permissive
- Apache 2.0: Permissive with patent protection
- GPL: Copyleft (derivatives must be GPL)

Proprietary:
- Custom proprietary license
- Copyright notice + all rights reserved
```

### Dependency License Compliance

```bash
# Check licenses of all dependencies
npm audit
npm list --depth=0

# License scanner tools
npx license-checker
npx licensereport
```

**Incompatible Licenses:**
- GPL + Proprietary = Usually incompatible
- AGPL + Proprietary = Very restrictive
- MIT + Apache = Generally compatible

---

## 📊 Incident Management

### Data Breach Response Plan

```markdown
1. Immediate Actions (within 24 hours)
   - [ ] Isolate affected systems
   - [ ] Assess scope and impact
   - [ ] Secure evidence
   - [ ] Notify relevant teams

2. Investigation (within 72 hours)
   - [ ] Determine what data was accessed
   - [ ] Identify affected individuals
   - [ ] Determine root cause

3. Notification (within 72 hours to authorities)
   - [ ] Notify relevant DPA
   - [ ] Notify affected individuals
   - [ ] Notify media (if required)

4. Follow-up (ongoing)
   - [ ] Implement remediation measures
   - [ ] Communicate updates
   - [ ] Monitor for misuse
   - [ ] Document lessons learned
```

### Incident Notification Template

```markdown
Subject: Data Security Incident - [Date]

Dear [User],

We are writing to inform you of a security incident 
that may have affected your personal information.

**What happened:**
[Description of incident]

**What information was affected:**
[List of data categories]

**What we're doing:**
[Remediation measures]

**What you can do:**
[Recommendations for users]

**Contact:**
[Support contact info]

Best regards,
[Company Name] Security Team
```

---

## 🏆 Pre-Launch Legal Checklist

- [ ] Privacy Policy drafted & reviewed by lawyer
- [ ] Terms of Service finalized
- [ ] Cookies & Consent management implemented
- [ ] Data Processing Agreements with sub-processors
- [ ] Incident response plan documented
- [ ] Backup & recovery procedures
- [ ] Security assessment completed
- [ ] Penetration test (for sensitive apps)
- [ ] Data retention policy set
- [ ] Right to be forgotten mechanism
- [ ] Right to data portability implemented
- [ ] User consent tracking system
- [ ] Email notification system for breaches
- [ ] DPO appointed (if required)
- [ ] Insurance review (errors & omissions, cyber)
- [ ] Third-party risk assessment
- [ ] Contract review (payment processor, hosting, etc.)

---

## 🔗 Resources & Tools

**Legal Templates:**
- Termly: https://termly.io
- iubenda: https://www.iubenda.com
- LawBite: https://www.lawbite.co.uk

**GDPR Resources:**
- GDPR Info: https://gdpr-info.eu
- GDPR.eu: https://gdpr.eu
- EDPB Guidelines: https://edpb.ec.europa.eu

**Compliance Tools:**
- Osano: https://www.osano.com
- OneTrust: https://www.onetrust.com
- TrustArc: https://www.trustarc.com

**Security:**
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- NIST Cybersecurity Framework: https://www.nist.gov/cyberframework

---

**Important:** This guide is informational only.
**Always consult with a qualified attorney in your jurisdiction!**
