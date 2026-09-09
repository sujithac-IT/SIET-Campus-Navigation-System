# 🧪 Testing Strategy & Critical Flow Verification

## Automated Testing Suite

1. **Type Checking**:
   ```bash
   npx tsc --noEmit
   ```
2. **Build Validation**:
   ```bash
   npm run build
   ```

---

## Critical E2E Test Workflows

### Flow 1: Unauthenticated Visitor Route
1. Open Application homepage (`/`).
2. Search `LH-25` in unified search input.
3. Select `LH-25 (Exam Hall - Library Block Floor 2)`.
4. Click `[NAVIGATE HERE]`.
5. Verify route calculation under 2 seconds, turn-by-turn steps, and indoor elevator transition.

### Flow 2: Student Next-Class Intelligence
1. Login as student (`aravind.siet@siet.ac.in`).
2. Navigate to Student Portal (`/dashboard/student`).
3. View `Next Class Intelligence` card (`Data Structures - LH-25`).
4. Click `[NAVIGATE TO CLASS]` and verify route.

### Flow 3: Real-Time Classroom Reassignment
1. Open Admin Portal (`/dashboard/admin`).
2. Trigger Classroom Reassignment (`LH-25` ➔ `LH-26`).
3. Verify notification broadcasted to enrolled students and active navigation route recalculated.
