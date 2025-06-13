// Ultra minimal test - no providers, no complex imports
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function TestPage() {
  return (
    <div className="p-8">
      <h1>Test Page - No AppProvider</h1>
      <p>This page has no providers or complex imports.</p>
    </div>
  );
}
