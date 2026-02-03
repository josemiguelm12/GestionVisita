export const DocumentType = {
  Cedula: 1,
  Pasaporte: 2,
  SinIdentificacion: 3,
} as const;

export type DocumentType = typeof DocumentType[keyof typeof DocumentType];

export interface Visitor {
  id: number;
  identityDocument?: string;
  documentType: DocumentType;
  name: string;
  lastName: string;
  phone?: string;
  email?: string;
  institution?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateVisitorRequest {
  identityDocument?: string;
  documentType: DocumentType;
  name: string;
  lastName: string;
  phone?: string;
  email?: string;
  institution?: string;
}

