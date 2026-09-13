// No demo data is seeded. Accounts and guardians are created by real users
// through the app (register + add-guardian). This script is intentionally a
// no-op so `npm run db:seed` (and the Docker boot seed) stay valid commands.
async function main() {
  // eslint-disable-next-line no-console
  console.log('No demo data to seed. Register an account in the app to get started.');
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
