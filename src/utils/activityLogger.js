export const logActivity = async (action, description, type, user) => {
  console.log(`[Activity] ${action}: ${description}`);
};

export const logSecurityEvent = async (type, severity, ip) => {
  console.warn(`[Security] ${severity.toUpperCase()}: ${type} from ${ip}`);
};