-- ============================================
-- VideoPreProd AI - Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS "Shot" CASCADE;
DROP TABLE IF EXISTS "Scene" CASCADE;
DROP TABLE IF EXISTS "File" CASCADE;
DROP TABLE IF EXISTS "TeamMember" CASCADE;
DROP TABLE IF EXISTS "Location" CASCADE;
DROP TABLE IF EXISTS "Budget" CASCADE;
DROP TABLE IF EXISTS "Task" CASCADE;
DROP TABLE IF EXISTS "Script" CASCADE;
DROP TABLE IF EXISTS "Project" CASCADE;
DROP TABLE IF EXISTS "VerificationToken" CASCADE;
DROP TABLE IF EXISTS "Session" CASCADE;
DROP TABLE IF EXISTS "Account" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- ============================================
-- USER & AUTH (NextAuth compatible)
-- ============================================

CREATE TABLE "User" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    "emailVerified" TIMESTAMP WITH TIME ZONE,
    image TEXT,
    role TEXT DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN', 'MANAGER')),
    "deletedAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE "Account" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at INTEGER,
    token_type TEXT,
    scope TEXT,
    id_token TEXT,
    "session_state" TEXT,
    UNIQUE(provider, "providerAccountId")
);

CREATE TABLE "Session" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "sessionToken" TEXT UNIQUE NOT NULL,
    "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    expires TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE "VerificationToken" (
    identifier TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires TIMESTAMP WITH TIME ZONE NOT NULL,
    UNIQUE(identifier, token)
);

-- ============================================
-- CORE MODELS
-- ============================================

CREATE TABLE "Project" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PLANNING', 'PRE_PRODUCTION', 'PRODUCTION', 'POST_PRODUCTION', 'COMPLETED', 'ARCHIVED')),
    "totalBudget" DOUBLE PRECISION,
    currency TEXT DEFAULT 'EUR',
    "startDate" TIMESTAMP WITH TIME ZONE,
    deadline TIMESTAMP WITH TIME ZONE,
    genre TEXT,
    duration INTEGER,
    format TEXT,
    target TEXT,
    "userId" TEXT NOT NULL REFERENCES "User"(id),
    "deletedAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE "Script" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    type TEXT DEFAULT 'OUTLINE' CHECK (type IN ('OUTLINE', 'TREATMENT', 'SCREENPLAY', 'STORYBOARD', 'SHOT_LIST')),
    status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'OUTLINE', 'REVIEW', 'APPROVED', 'FINAL')),
    version INTEGER DEFAULT 1,
    logline TEXT,
    synopsis TEXT,
    notes TEXT,
    "projectId" TEXT NOT NULL REFERENCES "Project"(id) ON DELETE CASCADE,
    "deletedAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE "Scene" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    number INTEGER NOT NULL,
    heading TEXT NOT NULL,
    content TEXT NOT NULL,
    notes TEXT,
    location TEXT,
    "timeOfDay" TEXT,
    "estimatedDuration" INTEGER,
    "scriptId" TEXT NOT NULL REFERENCES "Script"(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE("scriptId", number)
);

CREATE TABLE "Shot" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    number TEXT NOT NULL,
    description TEXT NOT NULL,
    "shotType" TEXT,
    "cameraAngle" TEXT,
    movement TEXT,
    equipment TEXT,
    duration INTEGER,
    notes TEXT,
    "sceneId" TEXT NOT NULL REFERENCES "Scene"(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE("sceneId", number)
);

CREATE TABLE "Task" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'TODO' CHECK (status IN ('TODO', 'IN_PROGRESS', 'BLOCKED', 'REVIEW', 'COMPLETED', 'CANCELLED')),
    priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    "startDate" TIMESTAMP WITH TIME ZONE,
    "dueDate" TIMESTAMP WITH TIME ZONE,
    "completedAt" TIMESTAMP WITH TIME ZONE,
    "projectId" TEXT NOT NULL REFERENCES "Project"(id) ON DELETE CASCADE,
    "assignedToId" TEXT REFERENCES "User"(id),
    "parentId" TEXT REFERENCES "Task"(id),
    "deletedAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE "Budget" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    category TEXT NOT NULL CHECK (category IN ('PRE_PRODUCTION', 'PRODUCTION', 'POST_PRODUCTION', 'EQUIPMENT', 'LOCATIONS', 'TALENT', 'CREW', 'CATERING', 'TRAVEL', 'MISCELLANEOUS', 'CONTINGENCY')),
    item TEXT NOT NULL,
    description TEXT,
    estimated DOUBLE PRECISION DEFAULT 0,
    actual DOUBLE PRECISION,
    quantity INTEGER DEFAULT 1,
    "unitCost" DOUBLE PRECISION,
    status TEXT DEFAULT 'ESTIMATED' CHECK (status IN ('ESTIMATED', 'APPROVED', 'PENDING', 'PAID', 'OVER_BUDGET')),
    "paidDate" TIMESTAMP WITH TIME ZONE,
    vendor TEXT,
    invoice TEXT,
    "projectId" TEXT NOT NULL REFERENCES "Project"(id) ON DELETE CASCADE,
    "deletedAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE "Location" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    country TEXT DEFAULT 'Italia',
    "postalCode" TEXT,
    type TEXT DEFAULT 'INTERIOR' CHECK (type IN ('INTERIOR', 'EXTERIOR', 'STUDIO', 'GREEN_SCREEN', 'VIRTUAL')),
    description TEXT,
    amenities TEXT[],
    dimensions TEXT,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "costPerDay" DOUBLE PRECISION,
    currency TEXT DEFAULT 'EUR',
    status TEXT DEFAULT 'SCOUTING' CHECK (status IN ('SCOUTING', 'CONTACTED', 'VISITED', 'NEGOTIATING', 'BOOKED', 'CONFIRMED', 'CANCELLED')),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    notes TEXT,
    photos TEXT[],
    "projectId" TEXT NOT NULL REFERENCES "Project"(id) ON DELETE CASCADE,
    "deletedAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE "TeamMember" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    role TEXT DEFAULT 'OTHER' CHECK (role IN ('DIRECTOR', 'PRODUCER', 'DOP', 'CAMERA_OPERATOR', 'SOUND_ENGINEER', 'EDITOR', 'ASSISTANT', 'PRODUCTION_DESIGNER', 'MAKEUP_ARTIST', 'STYLIST', 'TALENT', 'OTHER')),
    "customRole" TEXT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    bio TEXT,
    portfolio TEXT,
    "dailyRate" DOUBLE PRECISION,
    currency TEXT DEFAULT 'EUR',
    "projectId" TEXT NOT NULL REFERENCES "Project"(id) ON DELETE CASCADE,
    "userId" TEXT REFERENCES "User"(id),
    "deletedAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE("projectId", email)
);

CREATE TABLE "File" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    url TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    path TEXT NOT NULL,
    size INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    type TEXT DEFAULT 'DOCUMENT' CHECK (type IN ('IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'SCRIPT', 'STORYBOARD', 'REFERENCE', 'MOODBOARD')),
    status TEXT DEFAULT 'UPLOADING' CHECK (status IN ('UPLOADING', 'PROCESSING', 'READY', 'ERROR', 'ARCHIVED')),
    width INTEGER,
    height INTEGER,
    duration INTEGER,
    tags TEXT[],
    description TEXT,
    "projectId" TEXT REFERENCES "Project"(id) ON DELETE SET NULL,
    "scriptId" TEXT REFERENCES "Script"(id) ON DELETE SET NULL,
    "locationId" TEXT REFERENCES "Location"(id) ON DELETE SET NULL,
    "uploadedBy" TEXT,
    "deletedAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_user_role ON "User"(role);
CREATE INDEX idx_user_deleted ON "User"("deletedAt");

CREATE INDEX idx_project_user ON "Project"("userId");
CREATE INDEX idx_project_status ON "Project"(status);
CREATE INDEX idx_project_deadline ON "Project"(deadline);
CREATE INDEX idx_project_deleted ON "Project"("deletedAt");

CREATE INDEX idx_script_project ON "Script"("projectId");
CREATE INDEX idx_script_status ON "Script"(status);
CREATE INDEX idx_script_type ON "Script"(type);
CREATE INDEX idx_script_deleted ON "Script"("deletedAt");

CREATE INDEX idx_task_project ON "Task"("projectId");
CREATE INDEX idx_task_assigned ON "Task"("assignedToId");
CREATE INDEX idx_task_status ON "Task"(status);
CREATE INDEX idx_task_priority ON "Task"(priority);
CREATE INDEX idx_task_due ON "Task"("dueDate");
CREATE INDEX idx_task_deleted ON "Task"("deletedAt");

CREATE INDEX idx_budget_project ON "Budget"("projectId");
CREATE INDEX idx_budget_category ON "Budget"(category);
CREATE INDEX idx_budget_status ON "Budget"(status);
CREATE INDEX idx_budget_deleted ON "Budget"("deletedAt");

CREATE INDEX idx_location_project ON "Location"("projectId");
CREATE INDEX idx_location_status ON "Location"(status);
CREATE INDEX idx_location_city ON "Location"(city);
CREATE INDEX idx_location_type ON "Location"(type);
CREATE INDEX idx_location_deleted ON "Location"("deletedAt");

CREATE INDEX idx_teammember_project ON "TeamMember"("projectId");
CREATE INDEX idx_teammember_role ON "TeamMember"(role);
CREATE INDEX idx_teammember_user ON "TeamMember"("userId");
CREATE INDEX idx_teammember_deleted ON "TeamMember"("deletedAt");

CREATE INDEX idx_file_project ON "File"("projectId");
CREATE INDEX idx_file_script ON "File"("scriptId");
CREATE INDEX idx_file_location ON "File"("locationId");
CREATE INDEX idx_file_type ON "File"(type);
CREATE INDEX idx_file_status ON "File"(status);
CREATE INDEX idx_file_deleted ON "File"("deletedAt");

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT '✅ Database schema created successfully!' as message;
