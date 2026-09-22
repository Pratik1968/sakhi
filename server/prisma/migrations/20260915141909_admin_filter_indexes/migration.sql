-- CreateIndex
CREATE INDEX "CrimeIncident_crimeType_idx" ON "CrimeIncident"("crimeType");

-- CreateIndex
CREATE INDEX "CrimeIncident_severity_idx" ON "CrimeIncident"("severity");

-- CreateIndex
CREATE INDEX "Incident_createdAt_idx" ON "Incident"("createdAt");

-- CreateIndex
CREATE INDEX "Incident_type_idx" ON "Incident"("type");

-- CreateIndex
CREATE INDEX "SosEvent_startedAt_idx" ON "SosEvent"("startedAt");
