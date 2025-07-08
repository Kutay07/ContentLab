import { v4 as uuidv4 } from "uuid";

// Benzersiz id üretmek için ortak yardımcı fonksiyon
export const generateId = (): string => uuidv4();
