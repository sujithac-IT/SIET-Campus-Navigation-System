-- Enable PostGIS and Trigram extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Spatial and text search index extensions for SIET Navigate
-- Note: Geography columns and GIST indexes complement the standard Prisma models

-- Add geography points if using PostGIS functions directly
ALTER TABLE "buildings" ADD COLUMN IF NOT EXISTS "center_geom" geography(Point, 4326);
ALTER TABLE "places" ADD COLUMN IF NOT EXISTS "geom" geography(Point, 4326);
ALTER TABLE "nav_nodes" ADD COLUMN IF NOT EXISTS "geom" geography(Point, 4326);

-- Populate geoms from lat/lng
UPDATE "buildings" SET "center_geom" = ST_SetSRID(ST_MakePoint("centerLng", "centerLat"), 4326) WHERE "center_geom" IS NULL;
UPDATE "places" SET "geom" = ST_SetSRID(ST_MakePoint("lng", "lat"), 4326) WHERE "geom" IS NULL;
UPDATE "nav_nodes" SET "geom" = ST_SetSRID(ST_MakePoint("lng", "lat"), 4326) WHERE "geom" IS NULL;

-- Spatial GIST indexes
CREATE INDEX IF NOT EXISTS "idx_buildings_center_geom" ON "buildings" USING GIST ("center_geom");
CREATE INDEX IF NOT EXISTS "idx_places_geom" ON "places" USING GIST ("geom");
CREATE INDEX IF NOT EXISTS "idx_nav_nodes_geom" ON "nav_nodes" USING GIST ("geom");

-- pg_trgm fuzzy search index on places
CREATE INDEX IF NOT EXISTS "idx_places_name_trgm" ON "places" USING gin ("name" gin_trgm_ops);

-- GIN index on aliases text array
CREATE INDEX IF NOT EXISTS "idx_places_aliases_gin" ON "places" USING gin ("aliases");
