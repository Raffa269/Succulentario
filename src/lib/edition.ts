// Opt-in solo nel nuovo deployment. Il valore predefinito conserva la BETA.
export const isFreemium = process.env.NEXT_PUBLIC_APP_EDITION === "freemium";
export const editionName = isFreemium ? "Succulentario 1.0 freemium" : "Succulentario (BETA)";
export const plantLimit = 5;
export const identificationEnabled = !isFreemium || process.env.NEXT_PUBLIC_IDENTIFICATION_ENABLED === "true";
export const databaseSchema = isFreemium ? "freemium" : "public";
export const photoBucket = isFreemium ? "foto-freemium" : "foto";
export const supabaseOptions = {
  db: { schema: databaseSchema },
  ...(isFreemium ? { cookieOptions: { name: "succulentario-freemium-auth" } } : {}),
};
