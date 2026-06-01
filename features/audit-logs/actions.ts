import { adminDb } from "@/firebase/admin";
import { FirestorePaths } from "@/firebase/firestore";

interface AuditLogPayload {
  organizationId: string;
  actorId: string;
  action: string;
  targetType: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Creates an audit log record nested under the organization.
 * Bypasses Firestore client security rules using the Admin SDK.
 */
export async function createAuditLog(payload: AuditLogPayload) {
  const {
    organizationId,
    actorId,
    action,
    targetType,
    targetId,
    metadata = {},
  } = payload;

  const logsRef = adminDb.collection(
    FirestorePaths.auditLogsList(organizationId),
  );
  const newLogDoc = logsRef.doc(); // Auto-generated ID

  const auditLogDoc = {
    id: newLogDoc.id,
    organizationId,
    actorId,
    action,
    targetType,
    targetId: targetId || null,
    metadata,
    createdAt: new Date(),
  };

  await newLogDoc.set(auditLogDoc);
  return auditLogDoc;
}
export default createAuditLog;
