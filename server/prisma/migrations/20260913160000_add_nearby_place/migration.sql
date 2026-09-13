-- CreateTable
CREATE TABLE "NearbyPlace" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'osm-overpass',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NearbyPlace_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NearbyPlace_category_idx" ON "NearbyPlace"("category");

-- CreateIndex
CREATE INDEX "NearbyPlace_lat_lng_idx" ON "NearbyPlace"("lat", "lng");
