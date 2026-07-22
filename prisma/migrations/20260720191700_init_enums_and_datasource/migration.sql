-- CreateEnum
CREATE TYPE "WorkflowStatus" AS ENUM ('borrador_ia', 'en_revision', 'aprobado', 'publicado', 'rechazado', 'despublicado');

-- CreateEnum
CREATE TYPE "SchemaType" AS ENUM ('Service', 'Article', 'CreativeWork', 'Person', 'Organization', 'FAQPage', 'LocalBusiness', 'BreadcrumbList');

-- CreateEnum
CREATE TYPE "AiModel" AS ENUM ('claude-sonnet-4-6', 'claude-opus-4-8');
